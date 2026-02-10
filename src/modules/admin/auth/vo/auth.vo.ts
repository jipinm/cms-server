import { ApiProperty } from '@nestjs/swagger'

export class AuthVo {
  @ApiProperty({
    description: '访问令牌',
  })
  accessToken: string

  @ApiProperty({
    description: '刷新令牌',
  })
  refreshToken: string

  @ApiProperty({
    description: '过期时间(秒)',
  })
  expiresIn: number
}

export class UserInfoVo {
  @ApiProperty({
    description: '主键id',
  })
  id: number
  @ApiProperty({
    description: '用户名',
  })
  username: string
  @ApiProperty({
    description: '昵称',
  })
  nickname: string
  @ApiProperty({
    description: '角色',
  })
  role: string
  createTime: Date
  updateTime: Date
}
