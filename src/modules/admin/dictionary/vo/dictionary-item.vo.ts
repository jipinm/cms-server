import { ApiProperty } from '@nestjs/swagger'

export class DictionaryItemVo {
  @ApiProperty({ description: '字典项ID' })
  id: number

  @ApiProperty({ description: '字典类型ID' })
  dictId: number

  @ApiProperty({ description: '字典标签' })
  label: string

  @ApiProperty({ description: '字典值' })
  value: string

  @ApiProperty({ description: '字典类型编码' })
  dictType: string

  @ApiProperty({ description: '字典项描述' })
  description: string

  @ApiProperty({ description: '排序号' })
  sortOrder: number

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
