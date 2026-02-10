import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { HttpService } from '@nestjs/axios'
import { DatabaseService } from '@database/database.service'
import { RedisService } from '@database/redis.service'
import { LoginDto, UpdatePasswordDto } from './dto'
import { SSOCallbackDto } from './dto/sso.dto'
import { decrypt, encrypt } from '@utils/encrypt'
import { v4 as uuid } from 'uuid'
import { lastValueFrom } from 'rxjs'
import { MAX_TOKEN_EXISTS } from '@common/constants/auth'
import { SSOConfig } from 'src/config/config.interface'
import { IAMUser } from './interfaces/iam-user.interface'
import { Response } from 'express'
import { MenuType } from '@prisma/client'

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly databaseService: DatabaseService,
    private readonly redisService: RedisService,
  ) {}

  // 获取SSO登录URL
  async getSSOLoginUrl(): Promise<string> {
    const ssoConfig = this.configService.get<SSOConfig>('sso')
    const state = uuid()
    // 存储state用于回调验证
    await this.redisService.setex(`sso:state:${state}`, 300, state)

    const params = new URLSearchParams({
      client_id: ssoConfig.client_id,
      redirect_uri: ssoConfig.redirect_uri,
      response_type: 'code',
      state,
    })

    return `${ssoConfig.auth_url}?${params.toString()}`
  }

  // 处理SSO回调
  async handleSSOCallback(callbackDto: SSOCallbackDto) {
    // 验证state
    const savedState = await this.redisService.get(`sso:state:${callbackDto.state}`)
    if (!savedState) {
      throw new HttpException('Invalid state', HttpStatus.UNAUTHORIZED)
    }

    // 清除state
    await this.redisService.del(`sso:state:${callbackDto.state}`)

    // 获取access token
    const tokenResult = await this.getAccessToken(callbackDto.code)

    // 获取用户信息
    const userInfo = await this.getUserInfo(tokenResult.access_token)

    // 查找或创建本地用户
    const iamUser = await this.findOrCreateUser(userInfo)

    const user = await this.databaseService.user.findFirst({
      where: {
        id: iamUser.id,
      },
      select: {
        id: true,
        username: true,
        nickname: true,
        userType: true,
        status: true,
        siteUsers: {
          select: {
            site: {
              select: {
                id: true,
                name: true,
                code: true,
                domain: true,
                description: true,
              },
            },
          },
        },
        userRoles: {
          select: {
            role: {
              select: {
                id: true,
                name: true,
                description: true,
                roleMenu: {
                  select: {
                    menuIds: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (user.status === 0) {
      throw new HttpException('用户账户已禁用', HttpStatus.FORBIDDEN)
    }

    if (user.siteUsers.length === 0) {
      throw new HttpException('用户未关联站点', HttpStatus.FORBIDDEN)
    }

    // 生成JWT token
    const accessToken = this.jwtService.sign({
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      userType: user.userType,
      roles: user.userRoles.map((role) => role.role.id),
      jti: uuid(),
    })

    // 分别保存每个角色的按钮权限到redis
    await Promise.all(
      user.userRoles.map(async (role) => {
        const menuIds = role.role.roleMenu.menuIds.split(',')
        const buttons = await this.databaseService.adminMenu.findMany({
          where: {
            id: { in: menuIds.map(Number) },
            menuType: MenuType.BUTTON,
          },
        })
        const permissions = buttons.map((button) => button.permission)
        await this.redisService.setRolePermissions(Number(role.role.id), permissions)
      }),
    )

    // 获取用户已有的令牌数量
    const existingTokens = await this.redisService.getUserTokens(BigInt(user.id))

    // 如果已达到MAX_TOKEN_EXISTS个令牌，移除最旧的一个
    if (existingTokens.length >= MAX_TOKEN_EXISTS) {
      const oldestToken = existingTokens.sort((a, b) => a.timestamp - b.timestamp)[0]
      await this.redisService.removeAuthToken(BigInt(user.id), oldestToken.token)
    }

    // 存储token和refresh_token
    await this.redisService.setAuthToken(BigInt(user.id), accessToken)
    await this.redisService.setex(`refresh_token:${user.id}`, tokenResult.expires_in, tokenResult.refresh_token)

    return {
      accessToken,
      refreshToken: tokenResult.refresh_token,
      expiresIn: tokenResult.expires_in,
    }
  }

  // 获取访问令牌
  private async getAccessToken(code: string) {
    const ssoConfig = this.configService.get('sso')
    const params = {
      client_id: ssoConfig.client_id,
      client_secret: ssoConfig.client_secret,
      code,
      grant_type: 'authorization_code',
    }
    // params添加到urlsearch
    const url = new URL(ssoConfig.token_url)
    url.searchParams.set('client_id', ssoConfig.client_id)
    url.searchParams.set('client_secret', ssoConfig.client_secret)
    url.searchParams.set('code', code)
    url.searchParams.set('grant_type', 'authorization_code')
    const { data } = await lastValueFrom(this.httpService.post(url.toString(), params))
    return data
  }

  // 获取用户信息
  private async getUserInfo(accessToken: string): Promise<IAMUser> {
    const ssoConfig = this.configService.get<SSOConfig>('sso')
    const { data } = await lastValueFrom(
      this.httpService.get<IAMUser>(ssoConfig.userinfo_url, {
        params: {
          client_id: ssoConfig.client_id,
          access_token: accessToken,
        },
      }),
    )
    return data
  }

  // 修改密码
  async updatePassword(updatePasswordDto: UpdatePasswordDto, loginUser: JwtUser) {
    const { encryptedOldPassword, encryptedNewPassword, key } = updatePasswordDto
    // 解密
    const oldPassword = decrypt(encryptedOldPassword, key)
    const newPassword = decrypt(encryptedNewPassword, key)

    const user = await this.databaseService.user.findFirst({
      where: {
        id: loginUser.id,
        password: encrypt(oldPassword),
      },
    })

    if (!user) {
      throw new HttpException('旧密码错误', HttpStatus.FORBIDDEN)
    }

    await this.databaseService.user.update({
      where: { id: user.id },
      data: { password: encrypt(newPassword) },
    })
    // 清除Redis中的token
    await this.redisService.removeAllAuthTokens(user.id)
    await this.redisService.removeRefreshToken(user.id.toString())

    return {
      message: '密码修改成功,请重新登录',
    }
  }

  // 查找或创建本地用户
  private async findOrCreateUser(iamUser: IAMUser) {
    const user = await this.databaseService.user.findFirst({
      where: {
        username: iamUser.employeeNumber, // 使用工号作为用户名
      },
    })

    if (user) {
      return await this.databaseService.user.update({
        where: { id: user.id },
        data: {
          // nickname: iamUser.displayName,
          username: iamUser.employeeNumber,
          lastLogin: new Date(),
          // userType: this.mapUserType(iamUser.userType),
          // email: iamUser.enterpriseEmail,
          // phone: iamUser.mobile,
          // organizationId: iamUser.organizationId,
        },
      })
    }

    return await this.databaseService.user.create({
      data: {
        username: iamUser.employeeNumber,
        // nickname: iamUser.displayName,
        password: encrypt(uuid()), // 生成随机密码
        // userType: this.mapUserType(iamUser.userType),
        // email: iamUser.enterpriseEmail,
        // phone: iamUser.mobile,
        // organizationId: iamUser.organizationId,
        lastLogin: new Date(),
      },
    })
  }

  // 映射IAM用户类型到系统用户类型
  private mapUserType(iamUserType: IAMUser['userType']): string {
    const userTypeMap = {
      ADMIN: 'ADMIN',
      PROFESSIONAL: 'PROFESSIONAL',
      WORKER: 'WORKER',
    }
    return userTypeMap[iamUserType] || 'USER'
  }

  // 统一的登出处理
  async ssoLogout(req: any, res: Response) {
    const userId = req.user.id
    const token = req.headers.authorization?.split(' ')[1]

    // 清除Redis中的token
    if (token) {
      try {
        await this.redisService.removeAuthToken(BigInt(userId), token)
        await this.redisService.removeRefreshToken(userId.toString())
      } catch (error) {
        console.error('登出失败', error)
      }
    }

    // 获取SSO登出URL
    const ssoConfig = this.configService.get<SSOConfig>('sso')
    const logoutUrl = `${ssoConfig.logout_url}?redirectToUrl=${encodeURIComponent(ssoConfig.frontend_url)}&redirectToLogin=true&entityId=${ssoConfig.client_id}`
    // 清除浏览器的cookie
    res.clearCookie('access_token')
    res.clearCookie('refresh_token')

    return res.redirect(logoutUrl)
  }
  // 统一的登出处理
  async logout(req: any) {
    const userId = req.user.id
    const token = req.headers.authorization?.split(' ')[1]

    // 清除Redis中的token
    if (token) {
      await this.redisService.removeAuthToken(BigInt(userId), token)
      // await this.redisService.removeRefreshToken(userId.toString())
    }
    return {
      message: '退出成功',
    }
  }

  // 保留原有的用户名密码登录方法
  async login(params: LoginDto) {
    const password = decrypt(params.encryptedPassword, params.key)
    const user = await this.databaseService.user.findFirst({
      where: {
        username: params.username,
        password: encrypt(password),
      },
      select: {
        id: true,
        username: true,
        nickname: true,
        userType: true,
        status: true,
        siteUsers: {
          select: {
            site: {
              select: {
                id: true,
                name: true,
                code: true,
                domain: true,
                description: true,
              },
            },
          },
        },
        userRoles: {
          select: {
            role: {
              select: {
                id: true,
                name: true,
                description: true,
                roleMenu: {
                  select: {
                    menuIds: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!user) {
      throw new HttpException('用户名或密码错误', HttpStatus.FORBIDDEN)
    }

    if (user.status === 0) {
      throw new HttpException('用户账户已禁用', HttpStatus.FORBIDDEN)
    }

    if (user.siteUsers.length === 0) {
      throw new HttpException('用户未关联站点', HttpStatus.FORBIDDEN)
    }

    const roles = user.userRoles.map((role) => role.role.id)

    // 分别保存每个角色的按钮权限到redis
    await Promise.all(
      user.userRoles.map(async (role) => {
        const menuIds = role.role.roleMenu.menuIds.split(',')
        const buttons = await this.databaseService.adminMenu.findMany({
          where: {
            id: { in: menuIds.map(Number) },
            menuType: MenuType.BUTTON,
          },
        })
        const permissions = buttons.map((button) => button.permission)
        await this.redisService.setRolePermissions(Number(role.role.id), permissions)
      }),
    )

    // 获取用户已有的令牌数量
    const existingTokens = await this.redisService.getUserTokens(BigInt(user.id))

    // 如果已达到MAX_TOKEN_EXISTS个令牌，移除最旧的一个
    if (existingTokens.length >= MAX_TOKEN_EXISTS) {
      const oldestToken = existingTokens.sort((a, b) => a.timestamp - b.timestamp)[0]
      await this.redisService.removeAuthToken(BigInt(user.id), oldestToken.token)
    }

    // 记录最后一次登录时间和登录ip
    this.databaseService.user.update({
      where: {
        id: BigInt(user.id),
      },
      data: {
        lastLogin: new Date(),
      },
    })

    const accessToken = this.jwtService.sign({
      username: user.username,
      nickname: user.nickname,
      siteId: user.siteUsers[0]?.site.id,
      siteCode: user.siteUsers[0]?.site.code,
      id: BigInt(user.id),
      userType: user.userType,
      roles,
      jti: uuid(), // 生成一个唯一的标识符
    })

    // 存储新的令牌并记录时间戳
    await this.redisService.setAuthToken(BigInt(user.id), accessToken)

    return {
      accessToken,
    }
  }

  // 添加刷新令牌方法
  async refreshToken(refreshToken: string) {
    const ssoConfig = this.configService.get<SSOConfig>('sso')

    try {
      // 调用IAM刷新令牌接口
      const { data } = await lastValueFrom(
        this.httpService.post(ssoConfig.token_url, {
          client_id: ssoConfig.client_id,
          client_secret: ssoConfig.client_secret,
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        }),
      )

      // 获取用户信息
      const userInfo = await this.getUserInfo(data.access_token)
      const user = await this.findOrCreateUser(userInfo)

      // 生成新的JWT
      const accessToken = this.jwtService.sign({
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        userType: user.userType,
        jti: uuid(),
      })

      // 更新Redis中的token
      await this.redisService.setAuthToken(BigInt(user.id), accessToken)
      await this.redisService.setex(`refresh_token:${user.id}`, data.expires_in, data.refresh_token)

      return {
        accessToken,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in,
      }
    } catch (error) {
      throw new HttpException('刷新令牌失败', HttpStatus.UNAUTHORIZED)
    }
  }
}
