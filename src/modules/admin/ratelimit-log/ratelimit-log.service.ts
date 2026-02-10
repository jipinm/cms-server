import { Injectable } from '@nestjs/common'
import { DatabaseService } from '@database/database.service'
import { Prisma } from '@prisma/client'
import { RatelimitLogVo, RatelimitLogPagerVo } from './vo/ratelimit-log.vo'
import { QueryRatelimitLogDto } from './dto/query-ratelimit-log.dto'
@Injectable()
export class RatelimitLogService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(query: QueryRatelimitLogDto) {
    const { current, size, ...where } = query
    const filter: Prisma.RateLimitLogWhereInput = {}

    if (where.ip) filter.ip = { contains: where.ip }
    if (where.path) filter.path = { contains: where.path }
    if (where.method) filter.method = { contains: where.method }
    if (where.body) filter.body = { contains: where.body }
    if (where.createTimeStart) filter.createTime = { gte: where.createTimeStart }
    if (where.createTimeEnd) filter.createTime = { lte: where.createTimeEnd }

    const [total, items] = await Promise.all([
      this.db.rateLimitLog.count({ where: filter }),
      this.db.rateLimitLog.findMany({
        skip: (current - 1) * size,
        take: size,
        where: filter,
        orderBy: { createTime: 'desc' },
      }),
    ])

    return {
      items,
      total,
      current,
      size,
    }
  }
  async findOne(id: number): Promise<RatelimitLogVo | null> {
    const item = await this.db.rateLimitLog.findUnique({
      where: { id },
    })

    if (!item) return null

    return {
      ...item,
      id: Number(item.id),
    }
  }
}
