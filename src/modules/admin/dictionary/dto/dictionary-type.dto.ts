import { ApiProperty, OmitType } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'
import { Transform } from 'class-transformer'
export class CreateDictionaryTypeDto {
  @ApiProperty({ description: '字典类型编码' })
  @IsNotEmpty({ message: '字典类型编码不能为空' })
  @IsString()
  dictType: string

  @ApiProperty({ description: '字典类型描述' })
  @IsOptional()
  @IsString()
  description?: string

  @ApiProperty({ description: '系统标识(0:业务字典 1:系统字典)' })
  @IsOptional()
  @IsNumber()
  systemFlag?: number

  @ApiProperty({ description: '备注' })
  @IsOptional()
  @IsString()
  remarks?: string
}

export class UpdateDictionaryTypeDto extends OmitType(CreateDictionaryTypeDto, ['dictType']) {}

export class DictionaryTypeQuery {
  @ApiProperty({ description: '字典类型编码或者描述', required: false })
  @IsOptional()
  @IsString()
  keyword?: string

  @ApiProperty({ description: '系统标识(0:业务字典 1:系统字典)', required: false })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  systemFlag?: number
}
