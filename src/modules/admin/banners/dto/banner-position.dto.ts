import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator'
import { AllYesNo } from '@common/constants/list'
import { PagingDto } from '@common/dto'

export class CreateBannerPositionDto {
  @ApiProperty({ description: '位置名称' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  name: string

  @ApiProperty({ description: '位置编码' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  code: string

  @ApiPropertyOptional({ description: '位置描述' })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  description?: string

  @ApiProperty({ description: '是否启用', enum: AllYesNo })
  @IsEnum(AllYesNo)
  status: AllYesNo
}

export class UpdateBannerPositionDto extends CreateBannerPositionDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ description: 'id' })
  id: number
}

export class QueryBannerPositionDto extends PagingDto {
  @ApiPropertyOptional({ description: '位置名称' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  name?: string

  @ApiPropertyOptional({ description: '位置编码' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  code?: string

  @ApiPropertyOptional({ description: '组合字段模糊查询' })
  @IsOptional()
  @MaxLength(30)
  searchText?:string
}
