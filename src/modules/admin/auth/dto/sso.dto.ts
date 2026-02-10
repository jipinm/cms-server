import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'

export class SSOCallbackDto {
  @ApiProperty({
    description: '授权码',
    required: true,
  })
  @IsNotEmpty()
  code: string

  @ApiProperty({
    description: '状态码',
    required: true,
  })
  @IsNotEmpty()
  state: string
}
