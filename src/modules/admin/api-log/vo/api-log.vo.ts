import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class ApiLogSiteInfoVO {
  @ApiProperty({ description: '站点ID' })
  id: bigint

  @ApiProperty({ description: '站点名称' })
  name: string

  @ApiProperty({ description: '站点代码' })
  code: string
}

export class ApiLogUserInfoVO {
  @ApiProperty({ description: '用户ID' })
  id: bigint

  @ApiProperty({ description: '用户名' })
  username: string

  @ApiPropertyOptional({ description: '昵称' })
  nickname?: string | null
}

export class StatusCodeStatVO {
  @ApiProperty({ description: '状态码' })
  statusCode: number

  @ApiProperty({ description: '数量' })
  count: number
}

export class MethodStatVO {
  @ApiProperty({ description: '请求方法' })
  method: string

  @ApiProperty({ description: '数量' })
  count: number
}

export class PathStatVO {
  @ApiProperty({ description: '路径' })
  path: string

  @ApiProperty({ description: '数量' })
  count: number
}

export class ResponseTimeStatsVO {
  @ApiProperty({ description: '平均响应时间' })
  avg: number

  @ApiProperty({ description: '最大响应时间' })
  max: number

  @ApiProperty({ description: '最小响应时间' })
  min: number
}

export class ApiLogVO {
  @ApiProperty({ description: '日志ID' })
  id: bigint

  @ApiProperty({ description: '站点ID' })
  siteId: bigint

  @ApiPropertyOptional({ description: '用户ID' })
  userId?: bigint

  @ApiProperty({ description: '请求方法' })
  method: string

  @ApiProperty({ description: '请求路径' })
  path: string

  @ApiProperty({ description: '状态码' })
  statusCode: number

  @ApiProperty({ description: '响应时间(ms)' })
  responseTime: number

  @ApiProperty({ description: '客户端IP' })
  clientIp: string

  @ApiProperty({ description: 'User-Agent' })
  userAgent: string

  @ApiPropertyOptional({ description: '请求参数' })
  requestParams?: string

  @ApiProperty({ description: '错误信息' })
  errorMessage: string

  @ApiProperty({ description: '创建时间' })
  createTime: Date

  @ApiPropertyOptional({ description: '站点信息', type: ApiLogSiteInfoVO })
  site?: ApiLogSiteInfoVO

  @ApiPropertyOptional({ description: '用户信息', type: ApiLogUserInfoVO })
  user?: ApiLogUserInfoVO
}

export class ApiLogStatisticsVO {
  @ApiProperty({ description: '总请求数' })
  totalRequests: number

  @ApiProperty({ description: '错误数' })
  errorCount: number

  @ApiProperty({ description: '错误率' })
  errorRate: number

  @ApiProperty({ description: '状态码统计', type: [StatusCodeStatVO] })
  statusCodeStats: StatusCodeStatVO[]

  @ApiProperty({ description: '请求方法统计', type: [MethodStatVO] })
  methodStats: MethodStatVO[]

  @ApiProperty({ description: '路径统计', type: [PathStatVO] })
  pathStats: PathStatVO[]

  @ApiProperty({ description: '响应时间统计', type: ResponseTimeStatsVO })
  responseTimeStats: ResponseTimeStatsVO
}
