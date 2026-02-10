import { ApiProperty } from '@nestjs/swagger'

export class DictionaryTypeVo {
  @ApiProperty({ description: '字典类型ID' })
  id: number

  @ApiProperty({ description: '站点ID' })
  siteId: number

  @ApiProperty({ description: '字典类型编码' })
  dictType: string

  @ApiProperty({ description: '字典类型描述' })
  description: string

  @ApiProperty({ description: '系统标识(0:业务字典 1:系统字典)' })
  systemFlag: number

  @ApiProperty({ description: '备注' })
  remarks: string

  @ApiProperty({ description: '创建者' })
  createBy: string

  @ApiProperty({ description: '创建时间' })
  createTime: Date

  @ApiProperty({ description: '更新者' })
  updateBy: string

  @ApiProperty({ description: '更新时间' })
  updateTime: Date
}
