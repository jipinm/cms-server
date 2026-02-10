import { ApiProperty, PartialType } from '@nestjs/swagger'
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator'
import { PagingDto } from '@common/dto'

export class CreateRoleDto {
  @ApiProperty({ description: '角色名称' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  name: string

  @ApiProperty({ description: '角色编码' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  code: string

  @ApiProperty({ description: '角色描述' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  description: string
}

export class UpdateRoleDto extends PartialType(CreateRoleDto) {}

export class AssignMenusDto {
  @ApiProperty({ description: '菜单ID列表', type: [Number] })
  @IsArray()
  @IsNumber({}, { each: true })
  menuIds: number[]
}

export class QueryRoleDto extends PagingDto {
  @ApiProperty({ description: '角色名称', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  name?: string

  @ApiProperty({ description: '角色编码', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  code?: string
}
