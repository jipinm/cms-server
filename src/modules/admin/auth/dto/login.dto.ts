import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'

export class LoginDto {
  @ApiProperty({
    description: '登录账号',
    required: true,
  })
  @IsNotEmpty()
  username: string
  @ApiProperty({
    description: '加密的密码',
    required: true,
  })
  @IsNotEmpty()
  encryptedPassword: string
  @ApiProperty({
    description: '加密的key',
    required: true,
  })
  @IsNotEmpty()
  key: string
}

export class UpdatePasswordDto {
  @ApiProperty({
    description: '加密的旧密码',
    required: true,
  })
  encryptedOldPassword: string
  @ApiProperty({
    description: '加密的新密码',
    required: true,
  })
  encryptedNewPassword: string
  @ApiProperty({
    description: '加密的key',
    required: true,
  })
  key: string
}
