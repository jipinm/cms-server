import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsArray, IsDate, IsEnum, IsNumber, IsOptional, IsString, MaxLength, MinLength } from 'class-validator'
import { Transform } from 'class-transformer'
import { PagingDto } from '@common/dto'
import { AllYesNo } from '@common/constants/list'

export class CreateArticleDto {
  @ApiProperty({
    description: '文章标题',
    minLength: 2,
    maxLength: 500,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(500)
  title: string

  @ApiProperty({
    description: '文章内容',
    minLength: 1,
  })
  @IsString()
  @MinLength(1)
  content: string

  @ApiPropertyOptional({ description: '图片地址' })
  @IsString()
  @IsOptional()
  imageUrl?: string

  @ApiPropertyOptional({ description: '移动端图片地址' })
  @IsString()
  @IsOptional()
  imageMobileUrl?: string

  @ApiPropertyOptional({ description: '视频地址' })
  @IsString()
  @IsOptional()
  videoUrl?: string

  @ApiProperty({
    description: 'URL友好的标识符',
    pattern: '^[a-z0-9-]+$',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  slug: string

  @ApiPropertyOptional({ description: '文章摘要' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  summary?: string

  @ApiPropertyOptional({ description: '发布时间' })
  @Transform(({ value }) => new Date(value))
  @IsDate()
  @IsOptional()
  publishTime?: Date

  @ApiPropertyOptional({ description: '排序号' })
  @IsNumber()
  @IsOptional()
  sort?: number

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

  @ApiPropertyOptional({ description: '标签ID列表', type: [Number] })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  tagIds?: number[]

  @ApiProperty({ description: '分类ID列表', type: [Number] })
  @IsArray()
  @IsNumber({}, { each: true })
  categoryIds: number[]

  @ApiPropertyOptional({ description: '状态1启用0禁用', enum: AllYesNo })
  @IsEnum(AllYesNo)
  @IsOptional()
  status?: AllYesNo
}

export class UpdateArticleDto extends CreateArticleDto {}

export class QueryArticleDto extends PagingDto {
  @ApiPropertyOptional({ description: '文章状态', enum: AllYesNo })
  @IsEnum(AllYesNo)
  @IsOptional()
  status?: AllYesNo

  @ApiPropertyOptional({ description: '文章标题' })
  @IsString()
  @IsOptional()
  title?: string

  @ApiPropertyOptional({ description: '分类ID列表', type: [Number] })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  categoryIds?: number[]

  @ApiPropertyOptional({ description: '标签ID列表', type: [Number] })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  tagIds?: number[]

  @ApiPropertyOptional({ description: '发布时间开始' })
  @Transform(({ value }) => new Date(value))
  @IsDate()
  @IsOptional()
  publishTimeStart?: Date

  @ApiPropertyOptional({ description: '发布时间结束' })
  @Transform(({ value }) => new Date(value))
  @IsDate()
  @IsOptional()
  publishTimeEnd?: Date
}

export class UpdateArticleStatusDto {
  @ApiProperty({
    description: '文章状态',
    enum: AllYesNo,
  })
  @IsEnum(AllYesNo)
  status: AllYesNo
}
