import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'
import { Transform } from 'class-transformer'
import { PagingDto } from '@common/dto'

export class CreateDictionaryItemDto {
  @ApiProperty({ description: '字典类型ID' })
  @IsNotEmpty({ message: '字典类型ID不能为空' })
  @IsNumber()
  dictId: number

  @ApiProperty({ description: '字典标签' })
  @IsNotEmpty({ message: '字典标签不能为空' })
  @IsString()
  label: string

  @ApiProperty({ description: '字典值' })
  @IsNotEmpty({ message: '字典值不能为空' })
  @IsString()
  value: string

  @ApiProperty({ description: '字典项描述' })
  @IsOptional()
  @IsString()
  description?: string

  @ApiProperty({ description: '排序号' })
  @IsOptional()
  @IsNumber()
  sortOrder?: number

  @ApiProperty({ description: '备注' })
  @IsOptional()
  @IsString()
  remarks?: string
}

export class UpdateDictionaryItemDto extends CreateDictionaryItemDto {}

export class DictionaryItemQuery extends PagingDto {
  @ApiProperty({ description: '字典类型ID', required: false })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  dictId?: number

  @ApiProperty({ description: '字典类型编码', required: false })
  @IsOptional()
  @IsString()
  dictType?: string

  @ApiProperty({ description: '字典标签', required: false })
  @IsOptional()
  @IsString()
  label?: string
}

export class QueryDictionaryItemDto {
  @ApiProperty({ description: '字典类型ID', required: false })
  @Transform(({ value }) => Number(value))
  @IsNumber()
  dictId: number

  @ApiProperty({ description: '字典标签', required: false })
  @IsOptional()
  @IsString()
  label?: string

  @ApiProperty({ description: '字典值', required: false })
  @IsOptional()
  @IsString()
  value?: string
}
