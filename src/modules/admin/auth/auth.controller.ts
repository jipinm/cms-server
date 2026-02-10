import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, Request, Logger, Res } from '@nestjs/common'
import { Response } from 'express'
import { AuthService } from './auth.service'
import { LoginDto, UpdatePasswordDto } from './dto'
import { SSOCallbackDto } from './dto/sso.dto'
import { Public } from '@core/guards/jwt-auth.guard'
import { ValidationPipe } from '@core/pipes/validation.pipe'
import { ApiHeaders, ApiOperation, ApiTags } from '@nestjs/swagger'
import { ApiResult } from '../../../common/swagger/api-result-decorator'
import { AuthVo, UserInfoVo } from '@modules/admin/auth/vo/auth.vo'
import { UsersService } from '@modules/admin/users/users.service'
import { RefreshTokenDto } from './dto/refresh-token.dto'
import { ConfigService } from '@nestjs/config'
import { RequestUser } from '@core/decorators/request-user.decorator'

@ApiTags('认证管理')
@Controller('admin/auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name)

  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  @ApiOperation({
    summary: '账号密码登录',
  })
  @ApiResult(AuthVo)
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body(ValidationPipe) loginDto: LoginDto) {
    return this.authService.login(loginDto)
  }

  @ApiOperation({
    summary: '修改密码',
  })
  @ApiHeaders([{ name: 'Authorization', required: true }])
  @ApiResult(null)
  @HttpCode(HttpStatus.OK)
  @Post('updatePassword')
  async updatePassword(@Body(ValidationPipe) updatePasswordDto: UpdatePasswordDto, @RequestUser() user: JwtUser) {
    return this.authService.updatePassword(updatePasswordDto, user)
  }

  @ApiOperation({
    summary: '单点登录',
  })
  @Public()
  @Get('sso')
  async ssoLogin(@Res() res: Response) {
    const url = await this.authService.getSSOLoginUrl()
    return res.redirect(url)
  }

  @ApiOperation({
    summary: '单点登录回调',
  })
  @Public()
  @Get('sso/callback')
  async ssoCallback(@Query() callbackDto: SSOCallbackDto, @Res() res: Response) {
    try {
      const { accessToken, refreshToken } = await this.authService.handleSSOCallback(callbackDto)

      // 设置cookie
      res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })

      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })

      // 重定向到前端页面
      const frontendUrl = this.configService.get('sso.frontend_url')
      return res.redirect(frontendUrl)
    } catch (error) {
      this.logger.error(`SSO回调处理失败: ${error.message}`)
      // 重定向到登录失败页面
      const loginUrl = this.configService.get('sso.frontend_url')
      return res.redirect(`${loginUrl}?error=登录失败`)
    }
  }

  @ApiOperation({
    summary: '获取当前登录用户信息',
  })
  @ApiResult(UserInfoVo)
  @ApiHeaders([{ name: 'Authorization', required: true }])
  @Get('info')
  async info(@Request() req) {
    const userid = req.user.id
    return this.userService.getUser(+userid)
  }

  @ApiOperation({
    summary: '单点登录退出',
  })
  @ApiResult(null)
  @HttpCode(HttpStatus.OK)
  @Get('sso/logout')
  async ssoLogout(@Request() req, @Res() res: Response) {
    return this.authService.ssoLogout(req, res)
  }

  @ApiOperation({
    summary: '退出登录',
  })
  @ApiHeaders([{ name: 'Authorization', required: true }])
  @ApiResult(null)
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@Request() req) {
    return this.authService.logout(req)
  }

  @ApiOperation({
    summary: '刷新访问令牌',
  })
  @ApiResult(AuthVo)
  @Public()
  @Post('refreshToken')
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refreshToken)
  }
}
