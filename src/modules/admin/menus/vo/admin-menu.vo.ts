import { ApiProperty } from '@nestjs/swagger'
import { MenuType } from '@prisma/client'

export class AdminMenuVo {
  @ApiProperty({ description: '菜单ID' })
  id: number

  @ApiProperty({ description: '父菜单ID' })
  parentId?: number

  @ApiProperty({ description: '菜单名称' })
  name: string

  @ApiProperty({ description: '菜单路径' })
  path: string

  @ApiProperty({ description: '组件路径' })
  component?: string

  @ApiProperty({ description: '菜单图标' })
  icon?: string

  @ApiProperty({ description: '排序' })
  sort: number

  @ApiProperty({ description: '是否可见' })
  isVisible: boolean

  @ApiProperty({ description: '菜单类型', enum: MenuType })
  menuType: MenuType

  @ApiProperty({ description: '子菜单', type: [AdminMenuVo] })
  children?: AdminMenuVo[]
}
