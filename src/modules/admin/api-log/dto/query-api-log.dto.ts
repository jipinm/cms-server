import { IsOptional, IsNumber, IsString, IsDateString } from 'class-validator'
import { Transform, Type } from 'class-transformer'

export class QueryApiLogDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  current?: number = 1

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  size?: number = 20

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  siteId?: bigint

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  userId?: bigint

  @IsOptional()
  @IsString()
  method?: string

  @IsOptional()
  @IsString()
  path?: string

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  statusCode?: number

  @IsOptional()
  @IsDateString()
  startTime?: string

  @IsOptional()
  @IsDateString()
  endTime?: string

  @IsOptional()
  @IsString()
  clientIp?: string
}
