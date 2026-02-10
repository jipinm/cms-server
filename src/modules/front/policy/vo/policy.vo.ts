import { ApiProperty } from '@nestjs/swagger'

export class PolicyVo {
  @ApiProperty({ description: '政策ID' })
  id: number

  @ApiProperty({ description: '政策标题' })
  title: string

  @ApiProperty({ description: '政策内容' })
  content: string

  @ApiProperty({ description: '版本号' })
  version: number

  @ApiProperty({ description: '创建时间' })
  createTime: Date
}
