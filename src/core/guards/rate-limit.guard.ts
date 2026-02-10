import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { RateLimitService } from '../services/rate-limit.service'
import { RateLimitOptions } from '../interfaces/rate-limit.interface'
import {getIp} from "@utils/tools";

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private rateLimitService: RateLimitService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()

    const options = this.reflector.get<RateLimitOptions>('rateLimit', context.getHandler()) || {}

    const ip = getIp(request)
    const key = options.key || `${request.method}:${request.route.path}`
    const ttl = options.ttl || 60 // 默认1分钟
    const limit = options.limit || 60 // 默认60次

    const current = await this.rateLimitService.get(key, ip)

    if (current >= limit) {
      // 记录限流日志
      let body = ''
      if (request.body) {
        try {
          body = JSON.stringify(request.body)
        } catch (error) {
          body = request.body
        }
      }

      await this.rateLimitService.createLog({
        ip,
        key,
        current,
        limit,
        ttl,
        body,
        path: request.url,
        method: request.method,
      })

      return false
    }

    await this.rateLimitService.increment(key, ip, ttl)
    return true
  }
}
