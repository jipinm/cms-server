import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsNotEmpty, IsString } from 'class-validator'

export class QueryBannerDto {
  @ApiProperty({ description: 'Banner位置编码', required: true })
  @IsNotEmpty({ message: '位置编码不能为空' })
  @IsString()
  code: string

  @ApiProperty({ description: '站点编码', required: true })
  @IsNotEmpty({ message: '站点编码不能为空' })
  @IsString()
  siteCode: string
}

export class QueryBannerCodesDto {
  @ApiProperty({ description: 'Banner位置编码', required: true })
  @IsNotEmpty({ message: '位置编码不能为空' })
  @IsArray()
  @IsString({ each: true })
  codes: string[]

  @ApiProperty({ description: '站点编码', required: true })
  @IsNotEmpty({ message: '站点编码不能为空' })
  @IsString()
  siteCode: string
}
