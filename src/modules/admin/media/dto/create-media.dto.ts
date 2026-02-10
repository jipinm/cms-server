import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'

export class CreateMediaDto {
  @ApiProperty({ description: '素材描述', required: false })
  @IsOptional()
  @IsString()
  description?: string

  @ApiProperty({ description: '目录', required: false })
  @IsOptional()
  @IsString()
  directory?: string

  @ApiProperty({ description: '使用原始文件名,1是,0否(相同文件会覆盖上传)', required: false })
  @IsOptional()
  @IsString()
  useOriginFileName?: string
}
