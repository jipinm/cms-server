import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsOptional, IsNumber, Min, IsString } from 'class-validator'
import { PagingDto } from '@common/dto'

export class QueryMediaDto extends PagingDto {
  @ApiProperty({ description: '文件名', required: false })
  @IsOptional()
  @IsString()
  name?: string

  @ApiProperty({ description: '素材类型', required: false })
  @IsOptional()
  @IsString()
  mimeType?: string

  @ApiProperty({ description: '目录', required: false })
  @IsOptional()
  @IsString()
  directory?: string
}
