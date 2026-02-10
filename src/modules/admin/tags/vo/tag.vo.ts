import { ApiProperty } from '@nestjs/swagger'

export class TagVo {
  @ApiProperty({ description: '标签ID' })
  id: number

  @ApiProperty({ description: '标签名称' })
  name: string

  @ApiProperty({ description: '标签别名' })
  slug: string

  @ApiProperty({ description: '创建人' })
  createBy: string

  @ApiProperty({ description: '创建时间' })
  createTime: Date

  @ApiProperty({ description: '更新人' })
  updateBy: string

  @ApiProperty({ description: '更新时间' })
  updateTime: Date

  @ApiProperty({ description: '文章数量' })
  articleCount: number
}
