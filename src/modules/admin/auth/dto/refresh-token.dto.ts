import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'

export class RefreshTokenDto {
  @ApiProperty({
    description: '刷新令牌',
    required: true,
  })
  @IsNotEmpty()
  refreshToken: string
}
