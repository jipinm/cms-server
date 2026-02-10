import { ApiProperty } from '@nestjs/swagger'

export class RoleVo {
  @ApiProperty({ description: '角色ID' })
  id: number

  @ApiProperty({ description: '角色名称' })
  name: string

  @ApiProperty({ description: '角色编码' })
  code: string

  @ApiProperty({ description: '角色描述' })
  description: string

  @ApiProperty({ description: '创建时间' })
  createTime: Date

  @ApiProperty({ description: '更新时间' })
  updateTime: Date

  @ApiProperty({ description: '创建者' })
  createBy: string

  @ApiProperty({ description: '更新者' })
  updateBy: string

  @ApiProperty({ description: '菜单ID列表' })
  menuIds?: number[]
}
