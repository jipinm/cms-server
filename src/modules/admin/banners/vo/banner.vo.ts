import { ApiProperty } from '@nestjs/swagger'

export class BannerVo {
  @ApiProperty({ description: 'BannerID' })
  id: number

  @ApiProperty({ description: 'Banner标题' })
  title: string

  @ApiProperty({ description: 'Banner图片' })
  image: string

  @ApiProperty({ description: 'Banner链接' })
  url: string

  @ApiProperty({ description: 'Banner排序' })
  sort: number

  @ApiProperty({ description: 'Banner位置' })
  position: string

  @ApiProperty({ description: 'Banner状态' })
  status: string

  @ApiProperty({ description: 'Banner创建时间' })
  createdAt: Date

  @ApiProperty({ description: 'Banner更新时间' })
  updatedAt: Date
}
