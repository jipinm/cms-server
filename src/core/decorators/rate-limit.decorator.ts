import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common'
import { RateLimitGuard } from '../guards/rate-limit.guard'
import { RateLimitOptions } from '../interfaces/rate-limit.interface'

export const RATE_LIMIT_KEY = 'rateLimit'

export function RateLimit(options: RateLimitOptions = {}) {
  return applyDecorators(SetMetadata(RATE_LIMIT_KEY, options), UseGuards(RateLimitGuard))
}
