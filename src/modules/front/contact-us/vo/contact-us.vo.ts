import { ApiProperty } from '@nestjs/swagger'

export class ContactUsVo {
  @ApiProperty({ description: 'ID' })
  id: number

  @ApiProperty({ description: '类型(business:商务合作 purchase_intention:购车意向)' })
  type: string

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

  @ApiProperty({ description: '创建时间' })
  createTime: Date

  @ApiProperty({
    description: 'CRM线索创建结果',
    example: {
      success: true,
      crmLeadId: '12345',
      message: 'CRM线索创建成功',
    },
  })
  crmResult?: {
    success: boolean
    crmLeadId?: string
    error?: string
    crmResponse?: any
    status?: number
    statusText?: string
    leadData?: any
    message: string
  }
}
