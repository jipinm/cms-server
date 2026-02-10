import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { RoleVo } from '../../roles/vo/role.vo'
import { AllYesNo } from '@common/constants/list'

export class UserVo {
  @ApiProperty({ description: '用户ID' })
  id: number

  @ApiProperty({ description: '用户名' })
  username: string

  @ApiPropertyOptional({ description: '昵称' })
  nickname?: string

  @ApiPropertyOptional({ description: '邮箱' })
  email?: string

  @ApiPropertyOptional({ description: '头像' })
  avatar?: string

  @ApiPropertyOptional({ description: '手机号' })
  phone?: string

  @ApiProperty({ description: '状态', enum: AllYesNo })
  status: AllYesNo

  @ApiPropertyOptional({ description: '最后登录时间' })
  lastLogin?: Date

  @ApiPropertyOptional({ description: '最后登录IP' })
  loginIp?: string

  @ApiProperty({ description: '创建者' })
  createBy: string

  @ApiProperty({ description: '创建时间' })
  createTime: Date

  @ApiPropertyOptional({ description: '更新者' })
  updateBy?: string

  @ApiPropertyOptional({ description: '更新时间' })
  updateTime?: Date

  @ApiPropertyOptional({ description: '角色列表', type: [RoleVo] })
  roles?: RoleVo[]
}
