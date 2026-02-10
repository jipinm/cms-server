import { Injectable } from '@nestjs/common'
import { DatabaseService } from '../../../database/database.service'
import { ApiLog, Prisma } from '@prisma/client'

@Injectable()
export class ApiLogService {
  constructor(private readonly prisma: DatabaseService) {}

  /**
   * 分页查询API日志
   */
  async findMany(query: {
    current?: number
    size?: number
    siteId?: bigint
    userId?: bigint
    method?: string
    path?: string
    statusCode?: number
    startTime?: Date
    endTime?: Date
    clientIp?: string
  }) {
    const { current = 1, size = 10, siteId, userId, method, path, statusCode, startTime, endTime, clientIp } = query

    const where: Prisma.ApiLogWhereInput = {}

    if (siteId) where.siteId = siteId
    if (userId) where.userId = userId
    if (method) where.method = method
    if (path) where.path = { contains: path }
    if (statusCode) where.statusCode = statusCode
    if (clientIp) where.clientIp = { contains: clientIp }
    if (startTime || endTime) {
      where.createTime = {}
      if (startTime) where.createTime.gte = startTime
      if (endTime) where.createTime.lte = endTime
    }

    const [items, total] = await Promise.all([
      this.prisma.apiLog.findMany({
        where,
        orderBy: { createTime: 'desc' },
        skip: (current - 1) * size,
        take: size,
        include: {
          site: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          user: {
            select: {
              id: true,
              username: true,
              nickname: true,
            },
          },
        },
      }),
      this.prisma.apiLog.count({ where }),
    ])

    return {
      items,
      total,
      current,
      size,
      totalPages: Math.ceil(total / size),
    }
  }

  /**
   * 根据ID查询API日志详情
   */
  async findOne(id: bigint) {
    return this.prisma.apiLog.findUnique({
      where: { id },
      include: {
        site: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            nickname: true,
          },
        },
      },
    })
  }

  /**
   * 获取API统计信息
   */
  async getStatistics(query: { siteId?: bigint; startTime?: Date; endTime?: Date }) {
    const { siteId, startTime, endTime } = query

    const where: Prisma.ApiLogWhereInput = {}
    if (siteId) where.siteId = siteId
    if (startTime || endTime) {
      where.createTime = {}
      if (startTime) where.createTime.gte = startTime
      if (endTime) where.createTime.lte = endTime
    }

    // 总请求数
    const totalRequests = await this.prisma.apiLog.count({ where })

    // 按状态码统计
    const statusCodeStats = await this.prisma.apiLog.groupBy({
      by: ['statusCode'],
      where,
      _count: {
        statusCode: true,
      },
      orderBy: {
        _count: {
          statusCode: 'desc',
        },
      },
    })

    // 按方法统计
    const methodStats = await this.prisma.apiLog.groupBy({
      by: ['method'],
      where,
      _count: {
        method: true,
      },
      orderBy: {
        _count: {
          method: 'desc',
        },
      },
    })

    // 按路径统计Top 10
    const pathStats = await this.prisma.apiLog.groupBy({
      by: ['path'],
      where,
      _count: {
        path: true,
      },
      orderBy: {
        _count: {
          path: 'desc',
        },
      },
      take: 10,
    })

    // 响应时间统计
    const responseTimeStats = await this.prisma.apiLog.aggregate({
      where,
      _avg: {
        responseTime: true,
      },
      _max: {
        responseTime: true,
      },
      _min: {
        responseTime: true,
      },
    })

    // 错误率统计
    const errorCount = await this.prisma.apiLog.count({
      where: {
        ...where,
        statusCode: {
          gte: 400,
        },
      },
    })

    const errorRate = totalRequests > 0 ? (errorCount / totalRequests) * 100 : 0

    return {
      totalRequests,
      errorCount,
      errorRate: Number(errorRate.toFixed(2)),
      statusCodeStats: statusCodeStats.map((stat) => ({
        statusCode: stat.statusCode,
        count: stat._count.statusCode,
      })),
      methodStats: methodStats.map((stat) => ({
        method: stat.method,
        count: stat._count.method,
      })),
      pathStats: pathStats.map((stat) => ({
        path: stat.path,
        count: stat._count.path,
      })),
      responseTimeStats: {
        avg: Math.round(responseTimeStats._avg.responseTime || 0),
        max: responseTimeStats._max.responseTime || 0,
        min: responseTimeStats._min.responseTime || 0,
      },
    }
  }

  /**
   * 清理过期日志
   */
  async cleanup(days: number = 30) {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    const result = await this.prisma.apiLog.deleteMany({
      where: {
        createTime: {
          lt: cutoffDate,
        },
      },
    })

    return result
  }

  /**
   * 批量删除日志
   */
  async deleteMany(ids: bigint[]) {
    return this.prisma.apiLog.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    })
  }
}
