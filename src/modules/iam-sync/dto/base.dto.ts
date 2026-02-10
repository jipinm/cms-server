import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'

export class BaseIamDto {
  @ApiProperty({ description: 'BIM请求ID' })
  @IsNotEmpty()
  bimRequestId: string

  @ApiProperty({ description: 'BIM远程用户' })
  @IsNotEmpty()
  bimRemoteUser: string

  @ApiProperty({ description: 'BIM远程密码' })
  @IsNotEmpty()
  bimRemotePwd: string

  @ApiProperty({ description: '签名' })
  @IsNotEmpty()
  signature: string
}

export class BaseIamResponse {
  bimRequestId: string
  resultCode: string
  message: string
}
