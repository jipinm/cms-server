import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class QueryPolicyDto {
  @ApiProperty({ description: '站点编码', required: true })
  @IsNotEmpty({ message: '站点编码不能为空' })
  @IsString()
  siteCode: string
}
