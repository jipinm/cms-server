import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'

export class UpdateMediaDto {
  @ApiProperty({ description: '素材描述', required: false })
  @IsOptional()
  @IsString()
  description?: string

  @ApiProperty({ description: '素材文件', required: false, type: 'string', format: 'binary' })
  @IsOptional()
  file?: Express.Multer.File
}
