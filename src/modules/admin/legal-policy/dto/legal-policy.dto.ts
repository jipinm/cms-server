import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator'
import { PagingDto } from '@common/dto'

export class CreateLegalPolicyDto {
  @ApiProperty({ description: '政策内容' })
  @IsString()
  @IsNotEmpty()
  content: string
}

export class LegalPolicyQueryDto extends PagingDto {}
