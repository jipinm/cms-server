import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'
import { PagingDto } from './index'

export class QueryDto extends PagingDto {
  @ApiProperty({ description: '关键词', required: false })
  @IsOptional()
  @IsString()
  keyword?: string
}
