import { BadRequestException, Injectable, NotFoundException, HttpException, HttpStatus } from '@nestjs/common'
import { DatabaseService } from '@database/database.service'
import { CreateUserDto, QueryUserDto, UpdateUserDto, UpdateBaseUserDto, UpdatePasswordDto } from './dto/user.dto'
import { ListOrder } from '@common/constants/list'
import { DEFAULT_ENCRYPTED_PASSWORD } from '@common/constants/auth'
import { isNil, omit } from 'lodash'
import { Prisma, MenuType } from '@prisma/client'
import { RedisService } from '@database/redis.service'
import { decrypt, encrypt } from '@utils/encrypt'
@Injectable()
export class UsersService {
  constructor(
    private readonly db: DatabaseService,
    private readonly redisService: RedisService,
  ) {}

  async findAll(query: QueryUserDto) {
    const { current, size, username, status, startTime, endTime, phone, nickname } = query
    const skip = (current - 1) * size
    const where: Prisma.UserWhereInput = {}

    if (!isNil(status)) {
      where.status = status
    }
    if (startTime && endTime) {
      where.createTime = {
        gte: startTime,
        lte: endTime,
      }
    } else if (startTime) {
      where.createTime = {
        gte: startTime,
      }
    } else if (endTime) {
      where.createTime = {
        lte: endTime,
      }
    }

    const AND = []
    if (username) {
      AND.push({
        username: {
          contains: username,
        },
      })
    }
    if (phone) {
      AND.push({
        phone: {
          contains: phone,
        },
      })
    }
    if (nickname) {
      AND.push({
        nickname: {
          contains: nickname,
        },
      })
    }
    if (AND.length > 0) {
      where.AND = AND
    }

    const [total, items] = await Promise.all([
      this.db.user.count({ where }),
      this.db.user.findMany({
        where,
        select: {
          id: true,
          username: true,
          nickname: true,
          email: true,
          phone: true,
          userType: true,
          status: true,
          createBy: true,
          createTime: true,
          updateTime: true,
          updateBy: true,
          loginIp: true,
          lastLogin: true,
          userRoles: {
            select: {
              role: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        skip,
        take: size,
        orderBy: { createTime: ListOrder.Desc },
      }),
    ])

    return {
      items: items.map((item) => ({
        ...omit(item, 'userRoles'),
        roles: item.userRoles.map((ur) => ur.role.name).join(','),
      })),
      total,
      current,
      size,
    }
  }

  async create(createUserDto: CreateUserDto, user: JwtUser) {
    const exists = await this.db.user.findFirst({
      where: {
        OR: [{ username: createUserDto.username }, { email: createUserDto.email }, { phone: createUserDto.phone }],
      },
    })

    if (exists) {
      throw new BadRequestException('用户名、邮箱或手机号已存在')
    }

    const roleIds = createUserDto.roleIds
    // 判断角色是否存在
    const roles = await this.db.role.findMany({
      where: { id: { in: roleIds } },
      select: { id: true, roleMenu: { select: { menuIds: true } } },
    })
    if (roles.length !== roleIds.length) {
      throw new BadRequestException('角色不存在')
    }

    // 分别保存每个角色的按钮权限到redis
    await Promise.all(
      roles.map(async (role) => {
        const menuIds = role.roleMenu?.menuIds.split(',')
        if (!menuIds) {
          return
        }
        const buttons = await this.db.adminMenu.findMany({
          where: {
            id: { in: menuIds.map(Number) },
            menuType: MenuType.BUTTON,
          },
        })
        const permissions = buttons.map((button) => button.permission)
        await this.redisService.setRolePermissions(Number(role.id), permissions)
      }),
    )

    const siteIds = createUserDto.siteIds
    // 判断站点是否存在
    if (siteIds && siteIds.length > 0) {
      const sites = await this.db.site.findMany({ where: { id: { in: siteIds } } })
      if (sites.length !== siteIds.length) {
        throw new BadRequestException('站点不存在')
      }
    }

    return this.db.user.create({
      data: {
        username: createUserDto.username,
        nickname: createUserDto.nickname,
        email: createUserDto.email,
        avatar: createUserDto.avatar,
        phone: createUserDto.phone,
        password: DEFAULT_ENCRYPTED_PASSWORD,
        createBy: user.username,
        userRoles: {
          create: createUserDto.roleIds.map((roleId) => ({ roleId })),
        },
        // if siteIds is not empty, create siteUsers
        ...(createUserDto.siteIds && {
          siteUsers: {
            create: createUserDto.siteIds.map((siteId) => ({ siteId })),
          },
        }),
      },
    })
  }

  async findOne(id: number) {
    const user = await this.db.user.findUnique({
      where: { id },
      include: {
        userRoles: true,
        siteUsers: true,
      },
    })

    return {
      ...omit(user, ['password', 'userRoles', 'siteUsers']),
      siteIds: user.siteUsers.map((item) => item.siteId),
      roleIds: user.userRoles.map((item) => item.roleId),
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto, requestUser: JwtUser) {
    const user = await this.db.user.findUnique({
      where: { id },
      select: {
        id: true,
        siteUsers: {
          select: {
            site: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    })

    if (!user) {
      throw new NotFoundException('用户不存在')
    }

    const roleIds = updateUserDto.roleIds
    // 判断角色是否存在
    const roles = await this.db.role.findMany({
      where: { id: { in: roleIds } },
      select: { id: true, roleMenu: { select: { menuIds: true } } },
    })
    if (roles.length !== roleIds.length) {
      throw new BadRequestException('角色不存在')
    }

    // 分别保存每个角色的按钮权限到redis
    await Promise.all(
      roles.map(async (role) => {
        const menuIds = role.roleMenu.menuIds.split(',')
        const buttons = await this.db.adminMenu.findMany({
          where: {
            id: { in: menuIds.map(Number) },
            menuType: MenuType.BUTTON,
          },
        })
        const permissions = buttons.map((button) => button.permission)
        await this.redisService.setRolePermissions(Number(role.id), permissions)
      }),
    )

    const siteIds = updateUserDto.siteIds
    // 判断站点是否存在
    if (siteIds && siteIds.length > 0) {
      const sites = await this.db.site.findMany({ where: { id: { in: siteIds } } })
      if (sites.length !== siteIds.length) {
        throw new BadRequestException('站点不存在')
      }
    }

    // 用户关联的站点更新，并且和用户现在的站点不一致，需要清除所有用户的token
    if (user.siteUsers.length > 0 && user.siteUsers.some((item) => !siteIds.includes(Number(item.site.id)))) {
      await this.redisService.removeAllAuthTokens(user.id)
    }

    return this.db.user.update({
      where: { id },
      data: {
        nickname: updateUserDto.nickname,
        email: updateUserDto.email,
        avatar: updateUserDto.avatar,
        phone: updateUserDto.phone,
        updateBy: requestUser.username,
        updateTime: new Date(),
        userRoles: {
          deleteMany: {
            userId: user.id,
          },
          create: updateUserDto.roleIds.map((roleId) => ({ roleId })),
        },
        ...(updateUserDto.siteIds && {
          siteUsers: {
            deleteMany: {
              userId: user.id,
            },
            create: updateUserDto.siteIds.map((siteId) => ({ siteId })),
          },
        }),
      },
    })
  }

  async updateBaseInfo(id: number, updateBaseUserDto: UpdateBaseUserDto, requestUser: JwtUser) {
    return this.db.user.update({
      where: { id },
      data: {
        nickname: updateBaseUserDto.nickname,
        email: updateBaseUserDto.email,
        avatar: updateBaseUserDto.avatar,
        phone: updateBaseUserDto.phone,
        updateBy: requestUser.username,
        updateTime: new Date(),
      },
    })
  }

  async updatePassword(id: number, updatePasswordDto: UpdatePasswordDto, requestUser: JwtUser) {
    const secretkey = updatePasswordDto.secretkey
    const oldPassword = decrypt(updatePasswordDto.oldpassword, secretkey)
    const password = decrypt(updatePasswordDto.password, secretkey)
    const retryPassword = decrypt(updatePasswordDto.retryPassword, secretkey)

    const user = await this.db.user.findFirst({
      where: {
        id: id,
        password: encrypt(oldPassword),
      },
    })

    if (!user) {
      throw new HttpException('旧密码错误', HttpStatus.FORBIDDEN)
    }
    if (password !== retryPassword) {
      throw new HttpException('确认秘密输入不一致', HttpStatus.FORBIDDEN)
    }

    await this.db.user.update({
      where: { id: user.id },
      data: { password: encrypt(password) },
    })
    // 清除Redis中的token
    await this.redisService.removeAllAuthTokens(user.id)
    await this.redisService.removeRefreshToken(user.id.toString())

    return {
      message: '密码修改成功,请重新登录',
    }
  }

  async remove(id: number) {
    await this.db.user.delete({ where: { id } })
    return { success: true }
  }

  // 获取用户信息，不返回password
  async getUser(id: number) {
    const user = await this.db.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        nickname: true,
        email: true,
        phone: true,
        userType: true,
        status: true,
        createBy: true,
        createTime: true,
        updateTime: true,
        loginIp: true,
        siteUsers: {
          select: {
            site: {
              select: {
                id: true,
                code: true,
                name: true,
              },
            },
          },
        },
        userRoles: {
          select: {
            role: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    })

    // 根据用户的角色，从redis中获取角色权限，并且去重
    const userPermissions = await Promise.all(
      user.userRoles.map(async (item) => {
        const rolePermissions = await this.redisService.getRolePermissions(Number(item.role.id))
        return rolePermissions
      }),
    )

    return {
      ...omit(user, ['siteUsers', 'userRoles']),
      site: user.siteUsers[0]?.site,
      permissions: [...new Set(userPermissions.flat())],
      roles: user.userRoles.map((item) => item.role.id),
    }
  }

  async batchResetPassword(userIds: number[]) {
    await this.db.user.updateMany({
      where: { id: { in: userIds } },
      data: { password: DEFAULT_ENCRYPTED_PASSWORD },
    })
    // 清除所有用户的token
    await Promise.all(userIds.map((id) => this.redisService.removeAllAuthTokens(BigInt(id))))
    return {
      success: true,
    }
  }

  async changeStatus(userIds: number[], status: 0 | 1) {
    await this.db.user.updateMany({ where: { id: { in: userIds } }, data: { status } })
    return { success: true }
  }
}
