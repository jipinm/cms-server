import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { TagVo } from '@modules/admin/tags/vo/tag.vo'
import { CategoryVo } from '@modules/admin/categories/vo'

export class ArticleVo {
  @ApiProperty({ description: '文章ID' })
  id: number

  @ApiProperty({ description: '站点ID' })
  siteId: number

  @ApiProperty({ description: '文章标题' })
  title: string

  @ApiProperty({ description: 'URL友好的标识符' })
  slug: string

  @ApiPropertyOptional({ description: '文章摘要' })
  summary?: string

  @ApiProperty({ description: '文章内容' })
  content: string

  @ApiPropertyOptional({ description: '图片地址' })
  imageUrl?: string

  @ApiPropertyOptional({ description: '移动端图片地址' })
  imageMobileUrl?: string

  @ApiPropertyOptional({ description: '视频地址' })
  videoUrl?: string

  @ApiProperty({ description: '浏览量' })
  viewCount: number

  @ApiProperty({ description: '点赞数' })
  likeCount: number

  @ApiProperty({ description: '评论数' })
  commentCount: number

  @ApiProperty({ description: '排序号' })
  sort: number

  @ApiProperty({ description: '发布时间' })
  publishTime: Date

  @ApiProperty({ description: '创建时间' })
  createTime: Date

  @ApiProperty({ description: '更新时间' })
  updateTime: Date

  @ApiPropertyOptional({ description: '标签列表', type: [TagVo] })
  tags?: TagVo[]

  @ApiPropertyOptional({ description: '分类列表', type: [CategoryVo] })
  categories?: CategoryVo[]
}
