import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class BannerVo {
  @ApiProperty({ description: 'Banner ID' })
  id: number

  @ApiProperty({ description: 'Banner 标题' })
  title: string

  @ApiPropertyOptional({ description: 'Banner 图片地址' })
  image?: string

  @ApiPropertyOptional({ description: 'Banner 移动端图片地址' })
  imageMobile?: string

  @ApiPropertyOptional({ description: 'Banner 视频地址' })
  video?: string

  @ApiPropertyOptional({ description: 'Banner 链接地址' })
  url?: string

  @ApiProperty({ description: '排序号' })
  sort: number

  @ApiProperty({ description: 'Banner 位置编码' })
  positionCode: string

  @ApiProperty({ description: 'Banner 位置名称' })
  positionName: string
}
