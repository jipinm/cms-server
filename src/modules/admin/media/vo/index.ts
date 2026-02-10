import { ApiProperty } from '@nestjs/swagger'

export class MediaVo {
  @ApiProperty({ description: 'id' })
  id: string

  @ApiProperty({ description: '名称' })
  name: string

  @ApiProperty({ description: 'url' })
  url: string

  @ApiProperty({ description: '大小' })
  size: number

  @ApiProperty({ description: '创建时间' })
  createTime: Date

  @ApiProperty({ description: '更新时间' })
  updateTime: Date

  @ApiProperty({ description: '描述' })
  description: string

  @ApiProperty({ description: '目录' })
  directory: string

  @ApiProperty({ description: 'mimeType' })
  mimeType: string
}
