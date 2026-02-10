import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { ContactUsType } from '@prisma/client'

export class CreateContactUsDto {
  @ApiProperty({ description: '站点编码', example: 'site1' })
  @IsNotEmpty({ message: '站点编码不能为空' })
  @IsString()
  siteCode: string

  @ApiProperty({ description: '类型', enum: ContactUsType, example: ContactUsType.BUSINESS })
  @IsNotEmpty({ message: '类型不能为空' })
  @IsEnum(ContactUsType)
  type: ContactUsType

  @ApiPropertyOptional({ description: '姓名', example: '张三' })
  @IsString()
  name?: string

  @ApiPropertyOptional({ description: '电话', example: '13800138000' })
  @IsString()
  phone: string

  @ApiPropertyOptional({ description: '邮箱', example: 'example@example.com' })
  email?: string

  @ApiPropertyOptional({ description: '经销商门店', example: '北京朝阳店' })
  @IsString()
  dealer?: string

  @ApiPropertyOptional({ description: '区域', example: '华北区' })
  @IsString()
  region?: string

  @ApiPropertyOptional({ description: '年销量', example: '1000台' })
  @IsString()
  annualSalesVolume?: string

  @ApiPropertyOptional({ description: '预期购买日期', example: '2025-12-31' })
  @IsString()
  expectedPurchaseDate?: string

  @ApiPropertyOptional({ description: '预期购买日期', example: '2025-12-31' })
  @IsString()
  testDriveTime?: string

  @ApiPropertyOptional({ description: '邮政编码', example: '100000' })
  @IsString()
  postalCode?: string

  @ApiPropertyOptional({ description: '城市', example: '北京' })
  @IsString()
  city?: string

  @ApiPropertyOptional({ description: 'CRM城市代码', example: 'BJ001' })
  @IsString()
  crmCityCode?: string

  @ApiPropertyOptional({ description: '留言内容', example: '我想了解更多关于贵公司的产品信息' })
  @IsString()
  message?: string

  @ApiPropertyOptional({ description: '国家', example: 'China' })
  @IsString()
  country?: string

  @ApiPropertyOptional({ description: '车型', example: 'Jaecoo J7' })
  @IsString()
  vehicleType?: string

  @ApiPropertyOptional({ description: '车架号', example: 'LSJW24U66MS******' })
  @IsString()
  vehicleVin?: string

  @ApiPropertyOptional({ description: '车辆颜色(仅在TEST_DRIVE类型时使用)', example: '红色' })
  @IsString()
  @IsOptional()
  carColor?: string

  @ApiPropertyOptional({ description: '来源', example: 'website' })
  @IsString()
  @IsOptional()
  source?: string

  @ApiPropertyOptional({ description: '展厅位置', example: 'Dubai Showroom' })
  @IsString()
  @IsOptional()
  showroom_location?: string
}
