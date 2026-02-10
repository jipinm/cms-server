import { ApiProperty } from '@nestjs/swagger'
import { AllYesNo } from '@common/constants/list'

export class SiteVo {
  @ApiProperty({ description: '站点ID' })
  id: number

  @ApiProperty({ description: '站点名称' })
  name: string

  @ApiProperty({ description: '域名' })
  domain: string

  @ApiProperty({ description: '站点编码' })
  code: string

  @ApiProperty({ description: '描述' })
  description: string

  @ApiProperty({ description: 'Logo' })
  logo: string

  @ApiProperty({ description: '网站图标' })
  favicon: string

  @ApiProperty({ description: '状态' })
  status: AllYesNo

  @ApiProperty({ description: '创建时间' })
  createTime: Date

  @ApiProperty({ description: '更新时间' })
  updateTime: Date
}
