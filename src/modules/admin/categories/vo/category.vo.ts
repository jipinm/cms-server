import { ApiProperty } from '@nestjs/swagger'

export class CategoryVo {
  @ApiProperty({ description: '分类ID' })
  id: number

  @ApiProperty({ description: '站点id' })
  siteId: number

  @ApiProperty({ description: '站点name' })
  siteName: string

  @ApiProperty({ description: '分类名称' })
  name: string

  @ApiProperty({ description: '分类别名' })
  slug: string

  @ApiProperty({ description: '分类描述' })
  description: string

  @ApiProperty({ description: 'seo标题' })
  seoTitle?: string

  @ApiProperty({ description: 'seo关键词' })
  seoKeywords?: string

  @ApiProperty({ description: 'seo描述' })
  seoDescription?: string

  @ApiProperty({ description: '创建人' })
  createBy: string

  @ApiProperty({ description: '创建时间' })
  createTime: Date

  @ApiProperty({ description: '更新人' })
  updateBy: string

  @ApiProperty({ description: '更新时间' })
  updateTime: Date
}

export class CategoryChildVo {
  @ApiProperty({ description: '分类ID' })
  id: number

  @ApiProperty({ description: '分类名称' })
  name: string

  @ApiProperty({ description: '分类别名' })
  slug: string

  @ApiProperty({ description: '文章数量' })
  articleCount: number
}
export class CategoryParentVo {
  @ApiProperty({ description: '分类ID' })
  id: number

  @ApiProperty({ description: '分类名称' })
  name: string

  @ApiProperty({ description: '分类别名' })
  slug: string
}
export class CategoryDetailVo extends CategoryVo {
  @ApiProperty({ description: '父分类', type: CategoryParentVo })
  parent: CategoryParentVo

  @ApiProperty({ description: '子分类列表', type: [CategoryChildVo] })
  children: CategoryChildVo[]
}

export class CategoryListVo {
  @ApiProperty({ description: '分类列表', type: [CategoryVo] })
  items: CategoryVo[]

  @ApiProperty({ description: '总数' })
  total: number
}
