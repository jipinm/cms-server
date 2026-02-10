import { ApiProperty } from '@nestjs/swagger'

export class BannerPositionVo {
  @ApiProperty({ description: 'Banner位置ID' })
  id: number

  @ApiProperty({ description: 'Banner位置名称' })
  name: string

  @ApiProperty({ description: 'Banner位置代码' })
  code: string

  @ApiProperty({ description: 'Banner位置描述' })
  description: string

  @ApiProperty({ description: 'Banner位置状态' })
  status: string

  @ApiProperty({ description: 'Banner位置创建时间' })
  createdAt: Date

  @ApiProperty({ description: 'Banner位置更新时间' })
  updatedAt: Date
}
