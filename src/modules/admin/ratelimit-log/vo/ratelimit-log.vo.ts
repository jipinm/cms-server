import { ApiProperty } from '@nestjs/swagger'

export class RatelimitLogVo {
  @ApiProperty({ description: '日志ID' })
  id: number

  @ApiProperty({ description: 'IP地址' })
  ip: string

  @ApiProperty({ description: '限流键名' })
  key: string

  @ApiProperty({ description: '当前请求次数' })
  current: number

  @ApiProperty({ description: '限制次数' })
  limit: number

  @ApiProperty({ description: '时间窗口(秒)' })
  ttl: number

  @ApiProperty({ description: '请求路径' })
  path: string

  @ApiProperty({ description: '请求方法' })
  method: string

  @ApiProperty({ description: '创建时间' })
  createTime: Date
}

export class RatelimitLogPagerVo {
  @ApiProperty({ description: '总数' })
  total: number

  @ApiProperty({ description: '数据列表', type: [RatelimitLogVo] })
  items: RatelimitLogVo[]
}
