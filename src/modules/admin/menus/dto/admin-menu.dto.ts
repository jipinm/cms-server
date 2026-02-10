import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator'
import { MenuType } from '@prisma/client'
import { AllYesNo } from '@common/constants/list'

export class CreateAdminMenuDto {
  @ApiProperty({ description: '父级菜单ID' })
  @IsNumber()
  parentId: number

  @ApiProperty({ description: '菜单/按钮名称' })
  @IsString()
  @MaxLength(50)
  name: string

  @ApiProperty({ description: '菜单/按钮英文名称' })
  @IsString()
  @MaxLength(50)
  nameEn: string

  @ApiProperty({ description: '菜单路径' })
  @IsString()
  @IsOptional()
  path: string

  @ApiProperty({ description: '组件路径' })
  @IsString()
  @IsOptional()
  url: string

  @ApiPropertyOptional({ description: '菜单图标' })
  @IsString()
  @IsOptional()
  icon?: string

  @ApiProperty({ description: '排序号' })
  @IsNumber()
  sortOrder: number

  @ApiPropertyOptional({ description: '权限标识' })
  @IsString()
  @IsOptional()
  permission?: string

  @ApiProperty({ description: '菜单类型', enum: MenuType })
  @IsEnum(MenuType)
  menuType: MenuType

  @ApiProperty({ description: '是否缓存', enum: AllYesNo })
  @IsEnum(AllYesNo)
  isKeepAlive: AllYesNo

  @ApiProperty({ description: '是否固定', enum: AllYesNo })
  @IsEnum(AllYesNo)
  isAffix: AllYesNo

  @ApiProperty({ description: '是否隐藏', enum: AllYesNo })
  @IsEnum(AllYesNo)
  isHide: AllYesNo

  @ApiProperty({ description: '是否外链', enum: AllYesNo })
  @IsOptional()
  @IsEnum(AllYesNo)
  isLink: AllYesNo

  @ApiProperty({ description: '是否内嵌', enum: AllYesNo })
  @IsEnum(AllYesNo)
  @IsOptional()
  isIframe: AllYesNo
}

export class UpdateAdminMenuDto extends CreateAdminMenuDto {
  @ApiProperty({ description: '菜单ID' })
  @IsNotEmpty()
  @IsNumber()
  id: number
}
