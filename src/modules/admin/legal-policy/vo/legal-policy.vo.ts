import { ApiProperty } from '@nestjs/swagger'

export class LegalPolicyVo {
  @ApiProperty({ description: '政策ID' })
  id: number | bigint

  @ApiProperty({ description: '站点ID' })
  siteId: number | bigint

  @ApiProperty({ description: '政策内容' })
  content: string

  @ApiProperty({ description: '版本号' })
  version: number

  @ApiProperty({ description: '是否为当前版本' })
  isCurrent: boolean

  @ApiProperty({ description: '创建者' })
  createBy: string

  @ApiProperty({ description: '创建时间' })
  createTime: Date

  @ApiProperty({ description: '更新者' })
  updateBy: string

  @ApiProperty({ description: '更新时间' })
  updateTime: Date
}
