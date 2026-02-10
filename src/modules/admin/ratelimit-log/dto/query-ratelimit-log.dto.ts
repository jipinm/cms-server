import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsString, IsInt, Min } from 'class-validator'
import { Transform } from 'class-transformer'
import { PagingDto } from '@common/dto'

export class QueryRatelimitLogDto extends PagingDto {
  @ApiProperty({ description: 'IP地址', required: false })
  @IsString()
  @IsOptional()
  ip?: string

  @ApiProperty({ description: '请求路径', required: false })
  @IsString()
  @IsOptional()
  path?: string

  @ApiProperty({ description: '请求参数', required: false })
  @IsString()
  @IsOptional()
  body?: string

  @ApiProperty({ description: '请求方法', required: false })
  @IsString()
  @IsOptional()
  method?: string

  @ApiProperty({ description: '创建时间开始', required: false })
  @Transform(({ value }) => new Date(value))
  @IsOptional()
  createTimeStart?: Date

  @ApiProperty({ description: '创建时间结束', required: false })
  @Transform(({ value }) => new Date(value))
  @IsOptional()
  createTimeEnd?: Date
}
