import { CanActivate, ExecutionContext, Injectable, SetMetadata } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

export const USER_TYPE_KEY = 'user_type'
export const IsSystemAdmin = () => SetMetadata(USER_TYPE_KEY, 'SYSTEM_ADMIN')

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredUserType = this.reflector.getAllAndOverride(USER_TYPE_KEY, [context.getHandler(), context.getClass()])

    if (!requiredUserType) {
      return true
    }
    const { user } = context.switchToHttp().getRequest()
    return requiredUserType === user.userType
  }
}
