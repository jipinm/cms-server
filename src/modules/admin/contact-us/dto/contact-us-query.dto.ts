import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsOptional, IsString, IsNumber, Min, Max } from 'class-validator'
import { ContactUsType } from '@prisma/client'
import { Transform } from 'class-transformer'

export class ContactUsQueryDto {
  @ApiPropertyOptional({ description: '当前页', example: 1 })
  @Transform(({ value }) => (Number(value) === 0 ? 1 : Number(value)))
  @IsOptional()
  @IsNumber()
  @Min(0)
  current?: number

  @ApiPropertyOptional({ description: '每页大小', maximum: 50, minimum: 1, example: 10 })
  @Transform(({ value }) => Number(value))
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(500)
  size?: number

  @ApiPropertyOptional({ description: '类型', enum: ContactUsType })
  @IsOptional()
  @IsEnum(ContactUsType)
  type?: ContactUsType

  @ApiPropertyOptional({ description: '姓名' })
  @IsOptional()
  @IsString()
  name?: string

  @ApiPropertyOptional({ description: '电话' })
  @IsOptional()
  @IsString()
  phone?: string

  @ApiPropertyOptional({ description: '邮箱' })
  @IsOptional()
  @IsString()
  email?: string

  @ApiPropertyOptional({ description: '经销商门店' })
  @IsOptional()
  @IsString()
  dealer?: string

  @ApiPropertyOptional({ description: '区域' })
  @IsOptional()
  @IsString()
  region?: string

  @ApiPropertyOptional({ description: '年销量' })
  @IsOptional()
  @IsString()
  annualSalesVolume?: string

  @ApiPropertyOptional({ description: '预期购买日期' })
  @IsOptional()
  @IsString()
  expectedPurchaseDate?: string

  @ApiPropertyOptional({ description: '邮政编码' })
  @IsOptional()
  @IsString()
  postalCode?: string

  @ApiPropertyOptional({ description: '城市' })
  @IsOptional()
  @IsString()
  city?: string

  @ApiPropertyOptional({ description: 'CRM城市代码' })
  @IsOptional()
  @IsString()
  crmCityCode?: string
}
