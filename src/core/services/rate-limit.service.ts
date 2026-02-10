import { Injectable } from '@nestjs/common'
import { RedisService } from '@database/redis.service'
import { DatabaseService } from '@database/database.service'

@Injectable()
export class RateLimitService {
  constructor(
    private readonly redisService: RedisService,
    private readonly db: DatabaseService,
  ) {}

  async get(key: string, ip: string): Promise<number> {
    const redisKey = `rate_limit:${key}:${ip}`
    const value = await this.redisService.get(redisKey)
    return value ? parseInt(value, 10) : 0
  }

  async increment(key: string, ip: string, ttl: number): Promise<void> {
    const redisKey = `rate_limit:${key}:${ip}`
    await this.redisService.incr(redisKey)
    await this.redisService.expire(redisKey, ttl)
  }

  async createLog(data: {
    ip: string
    key: string
    current: number
    limit: number
    ttl: number
    path: string
    body: string
    method: string
  }) {
    return this.db.rateLimitLog.create({
      data: {
        ...data,
        createTime: new Date(),
      },
    })
  }
}
