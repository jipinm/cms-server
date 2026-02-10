import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'
import { PagingDto } from '@common/dto'
import { AllYesNo } from '@common/constants/list'
import { Transform } from 'class-transformer'

export class SiteDto {
  @ApiProperty({ description: '站点名称' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string

  @ApiProperty({ description: '站点编码', required: true })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  code: string

  @ApiProperty({ description: '域名', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  domain?: string

  @ApiProperty({ description: '描述', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string

  @ApiProperty({ description: 'Logo', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  logo?: string

  @ApiProperty({ description: '网站图标', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  favicon?: string

  @ApiProperty({ description: '状态', required: true })
  @Transform(({ value }) => Number(value))
  @IsEnum(AllYesNo)
  status: AllYesNo
}

export class UpdateSiteDto extends SiteDto {}

export class QuerySiteDto extends PagingDto {
  @ApiProperty({ description: '站点名称', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string

  @ApiProperty({ description: '站点编码', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  code?: string

  @ApiProperty({ description: '域名', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  domain?: string
}
