import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator'
import { PagingDto } from '@common/dto'

export class CreatePrivacyPolicyDto {
  @ApiProperty({ description: '政策内容' })
  @IsString()
  @IsNotEmpty()
  content: string
}

export class PrivacyPolicyQueryDto extends PagingDto {}
