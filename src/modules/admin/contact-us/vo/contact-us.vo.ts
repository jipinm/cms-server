import { ApiProperty } from '@nestjs/swagger'

export class ContactUsVo {
  @ApiProperty({ description: 'ID' })
  id: number

  @ApiProperty({ description: '站点ID' })
  siteId: number

  @ApiProperty({ description: '类型(business:商务合作 purchase_intention:购车意向)' })
  type: string

  @ApiProperty({ description: '邮件ID' })
  emailId: number

  @ApiProperty({ description: '国家' })
  country: string

  @ApiProperty({ description: '姓名' })
  name: string

  @ApiProperty({ description: '电话' })
  phone: string

  @ApiProperty({ description: '邮箱' })
  email: string

  @ApiProperty({ description: '经销商门店' })
  dealer: string

  @ApiProperty({ description: '区域' })
  region: string

  @ApiProperty({ description: '年销量' })
  annualSalesVolume: string

  @ApiProperty({ description: '预期购买日期' })
  expectedPurchaseDate: string

  @ApiProperty({ description: '邮政编码' })
  postalCode: string

  @ApiProperty({ description: '城市' })
  city: string

  @ApiProperty({ description: 'CRM城市代码' })
  crmCityCode: string

  @ApiProperty({ description: '留言内容' })
  message: string

  @ApiProperty({ description: '车型' })
  vehicleType: string

  @ApiProperty({ description: '车架号' })
  vehicleVin: string

  @ApiProperty({ description: '创建时间' })
  createTime: Date

  @ApiProperty({ description: '更新时间' })
  updateTime: Date
}
