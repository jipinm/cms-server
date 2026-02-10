import { ApiProperty } from '@nestjs/swagger'
import { IsHexColor, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'
import { PagingDto } from '@common/dto'
export class CreateTagDto {
  @ApiProperty({ description: '标签名称' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  name: string

  @ApiProperty({ description: '标签别名' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  slug: string
}

export class UpdateTagDto extends CreateTagDto {
  @ApiProperty({ description: '标签名称', required: false })
  @IsOptional()
  name: string

  @ApiProperty({ description: '标签别名', required: false })
  @IsOptional()
  slug: string
}

export class QueryTagDto extends PagingDto {
  @ApiProperty({ description: '标签名称', required: false })
  @IsOptional()
  name?: string

  @ApiProperty({ description: '标签名称', required: false })
  @IsOptional()
  slug: string
}
