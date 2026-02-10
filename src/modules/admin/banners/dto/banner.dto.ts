import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger'
import { IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator'
import { AllYesNo } from '@common/constants/list'
import { PagingDto } from '@common/dto'
import { Transform } from 'class-transformer'

export class CreateBannerDto {
  @ApiProperty({ description: 'Banner标题' })
  @IsNotEmpty()
  @IsString()
  title: string

  @ApiProperty({ description: '图片地址' })
  @IsOptional()
  @IsString()
  image?: string

  @ApiProperty({ description: '移动端图片地址' })
  @IsOptional()
  @IsString()
  imageMobile?: string

  @ApiPropertyOptional({ description: '视频地址' })
  @IsString()
  @IsOptional()
  video?: string

  @ApiPropertyOptional({ description: '链接地址' })
  @IsString()
  @IsOptional()
  url?: string

  @ApiPropertyOptional({ description: '排序' })
  @IsNumber()
  @IsOptional()
  sort?: number

  @ApiPropertyOptional({ description: '发布时间' })
  @Transform(({ value }) => {
    return value ? new Date(+value) : value
  })
  @IsOptional()
  publishTime?: Date

  @ApiPropertyOptional({ description: '位置' })
  @IsNumber()
  positionId: number

  @ApiProperty({ description: '是否启用', enum: AllYesNo })
  @IsOptional()
  @IsEnum(AllYesNo)
  status: AllYesNo

  @ApiPropertyOptional({ description: '开始时间' })
  @Transform(({ value }) => {
    return value ? new Date(+value) : value
  })
  @IsOptional()
  startTime?: Date

  @ApiPropertyOptional({ description: '结束时间' })
  @Transform(({ value }) => {
    return value ? new Date(+value) : value
  })
  @IsOptional()
  endTime?: Date

  @ApiPropertyOptional({ description: '自定义json' })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  jsondef?: string
}

export class UpdateBannerDto extends CreateBannerDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ description: 'id' })
  id: number
}

export class QueryBannerDto extends PagingDto {
  @ApiPropertyOptional({ description: 'Banner标题' })
  @IsOptional()
  @IsString()
  title: string

  @ApiPropertyOptional({ description: 'positionId' })
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @IsOptional()
  positionId?: number
}
