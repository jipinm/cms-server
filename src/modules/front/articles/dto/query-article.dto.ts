import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'
import { PagingDto } from '@common/dto'
import { Transform } from 'class-transformer'

export class QueryArticleDto extends PagingDto {
  @ApiProperty({ description: '站点编码', required: true })
  @IsNotEmpty({ message: '站点编码不能为空' })
  @IsString()
  siteCode: string

  @ApiProperty({ description: '目录别名', required: false })
  @IsOptional()
  @IsString()
  category?: string

  @ApiProperty({ description: '标签别名', required: false })
  @IsOptional()
  @IsString()
  tag?: string
}

export class QueryArticleDetailByIdDto {
  @ApiProperty({ description: '文章ID', required: true })
  @Transform(({ value }) => Number(value))
  @IsNumber()
  id: number
}

export class QueryArticleBySlugDto {
  @ApiProperty({ description: '站点编码', required: true })
  @IsNotEmpty({ message: '站点编码不能为空' })
  @IsString()
  siteCode: string

  @ApiProperty({ description: '文章别名', required: true })
  @IsNotEmpty({ message: '文章别名不能为空' })
  @IsString()
  slug: string
}

export class ReplaceUrlPrefixDto {
  @ApiProperty({ description: '前缀', required: true })
  @IsNotEmpty({ message: '前缀不能为空' })
  @IsString()
  prefix: string

  @ApiProperty({ description: '替换者', required: true })
  @IsNotEmpty({ message: '替换者不能为空' })
  @IsString()
  replacer: string

  @ApiProperty({ description: '站点编码', required: true })
  @IsNotEmpty({ message: '站点编码不能为空' })
  @IsString()
  siteCode: string
}
