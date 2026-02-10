import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { AUTH_SECRET } from '@common/constants/auth'
import { PayloadDto } from '../dto/payload.dto'
import { Request } from 'express'
import { JwtService } from '@nestjs/jwt'
import { RedisService } from '@database/redis.service'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private redisService: RedisService,
    private jwtService: JwtService,
  ) {
    super({
      jwtFromRequest: (req) => {
        // 首先尝试从Authorization头获取
        const authHeader = ExtractJwt.fromAuthHeaderAsBearerToken()(req)
        if (authHeader) {
          return authHeader
        }

        // 如果没有Authorization头，尝试从cookie获取
        return req.cookies?.access_token
      },
      ignoreExpiration: false,
      secretOrKey: AUTH_SECRET,
      passReqToCallback: true,
    })
  }

  async validate(request: Request, payload: PayloadDto) {
    const userId = BigInt(payload.id)

    const requestToken = payload.iat ? payload : (this.jwtService.decode(payload as any as string) as PayloadDto)

    // 获取用户所有有效令牌
    const userTokens = await this.redisService.getUserTokens(userId)

    // 检查当前请求的令牌是否在有效令牌中
    const validToken = userTokens.find((token) => {
      const decoded = this.jwtService.decode(token.token)
      return (decoded as PayloadDto).jti === requestToken.jti
    })

    if (!validToken) {
      throw new HttpException(`token invalid`, HttpStatus.UNAUTHORIZED)
    }

    return {
      id: payload.id,
      username: payload.username,
      nickname: payload.nickname,
      siteId: payload.siteId,
      siteCode: payload.siteCode,
      roles: payload.roles,
    }
  }
}
