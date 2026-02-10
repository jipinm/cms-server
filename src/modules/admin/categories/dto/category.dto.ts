import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator'
import { PagingDto } from '@common/dto'

export class CreateCategoryDto {
  @ApiProperty({ description: '分类名称' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string

  @ApiProperty({ description: '分类别名' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  slug: string

  @ApiProperty({ description: '分类描述', required: false })
  @IsOptional()
  @IsString()
  description?: string
  //
  // @ApiProperty({ description: '父分类ID', required: false })
  // @IsOptional()
  // parentId?: number

  @ApiPropertyOptional({ description: 'seo标题' })
  @IsString()
  @IsOptional()
  seoTitle?: string

  @ApiPropertyOptional({ description: 'seo关键词' })
  @IsString()
  @IsOptional()
  seoKeywords?: string

  @ApiPropertyOptional({ description: 'seo描述' })
  @IsString()
  @IsOptional()
  seoDescription?: string
}

export class UpdateCategoryDto extends CreateCategoryDto {}

export class QueryCategoryDto extends PagingDto {
  @ApiProperty({ description: '分类名称' })
  @IsOptional()
  @MaxLength(100)
  name?: string

  @ApiProperty({ description: '分类别名' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  slug?: string
}
