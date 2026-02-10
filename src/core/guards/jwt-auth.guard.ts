import { ExecutionContext, Injectable, SetMetadata } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthGuard } from '@nestjs/passport'
import { JwtService } from '@nestjs/jwt'

export const IS_PUBLIC_KEY = 'is_public'
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true)

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
  ) {
    super()
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (isPublic) {
      return true
    }
    return super.canActivate(context)
  }

  async getTokenInfo(token: string) {
    try {
      return this.jwtService.verify(token)
    } catch {
      return null
    }
  }
}
