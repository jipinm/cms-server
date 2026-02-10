import {CanActivate, ExecutionContext, Injectable} from '@nestjs/common'
import {Reflector} from '@nestjs/core'
import {PERMISSIONS_KEY} from '@core/decorators/permissions.decorator'
import {RedisService} from "@database/redis.service";

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly redisService: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const user = request.user as JwtUser
    if(user?.username === 'admin') {
      return true
    }
    const requiredPermission = this.reflector.getAllAndOverride(PERMISSIONS_KEY, [context.getHandler()])
    if (!user || !requiredPermission) {
      return true
    }
    const userPermissions = await Promise.all(user.roles?.map(roleId => this.redisService.getRolePermissions(roleId)))
    const permissions = [...new Set(userPermissions.flat())]
    const isAllow = permissions.some((p) => requiredPermission.some((o) => o === p))
    return isAllow
  }
}
