import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger'
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator'
import { PagingDto } from '@common/dto'
import { Transform } from 'class-transformer'
import { AllYesNo } from '@common/constants/list'

export class CreateUserDto {
  @ApiProperty({ description: '用户名' })
  @IsString()
  username: string

  @ApiProperty({ description: '昵称' })
  @IsString()
  @IsOptional()
  nickname: string

  @ApiPropertyOptional({ description: '邮箱' })
  @IsEmail()
  @IsOptional()
  email?: string

  @ApiPropertyOptional({ description: '头像' })
  @IsString()
  @IsOptional()
  avatar?: string

  @ApiPropertyOptional({ description: '手机号' })
  @IsPhoneNumber('CN')
  @IsOptional()
  phone?: string

  @ApiProperty({ description: '角色ID列表', type: [Number] })
  @IsNotEmpty({ message: '角色ID列表不能为空' })
  @IsArray()
  @ArrayMinSize(1, { message: '角色ID列表不能为空' })
  roleIds: number[]

  @ApiProperty({ description: '站点ID列表', type: [Number] })
  @ArrayMinSize(1)
  @ArrayMaxSize(1)
  @IsArray()
  siteIds: number[]
}

// omit username
export class UpdateUserDto extends OmitType(CreateUserDto, ['username']) {}
export class UpdateBaseUserDto extends OmitType(CreateUserDto, ['username', 'roleIds', 'siteIds']) {}

export class QueryUserDto extends PagingDto {
  @ApiPropertyOptional({ description: '用户名' })
  @IsString()
  @IsOptional()
  username?: string

  @ApiPropertyOptional({ description: '昵称' })
  @IsString()
  @IsOptional()
  nickname?: string

  @ApiPropertyOptional({ description: '手机号' })
  @IsOptional()
  phone?: string

  @ApiPropertyOptional({ description: '状态', enum: AllYesNo })
  @Transform(({ value }) => Number(value))
  @IsEnum(AllYesNo)
  @IsOptional()
  status?: AllYesNo

  //   创建时间开始 startTime
  @ApiPropertyOptional({ description: '创建时间开始' })
  @Transform(({ value }) => {
    return value ? new Date(+value) : value
  })
  @IsDate()
  @IsOptional()
  startTime?: string
  //   创建时间结束
  @ApiPropertyOptional({ description: '创建时间结束' })
  @Transform(({ value }) => {
    return value ? new Date(+value) : value
  })
  @IsDate()
  @IsOptional()
  endTime?: string
}
export class UpdatePasswordDto {
  @ApiProperty({ description: '旧密码' })
  @IsString()
  oldpassword: string
  @ApiProperty({ description: '新密码' })
  @IsString()
  password: string
  @ApiProperty({ description: '确认密码' })
  @IsString()
  retryPassword: string
  @ApiProperty({ description: '密钥' })
  @IsString()
  secretkey: string
}

export class BatchResetPasswordDto {
  @ApiProperty({ description: '用户ID列表', type: [Number] })
  @IsArray()
  @ArrayMinSize(1, { message: '用户ID列表至少需要包含1个用户' })
  @IsNumber({}, { each: true })
  userIds: number[]
}

export class ChangeStatusDto {
  @ApiProperty({ description: '用户ID列表', type: [Number] })
  @IsArray()
  @ArrayMinSize(1, { message: '用户ID列表至少需要包含1个用户' })
  @IsNumber({}, { each: true })
  userIds: number[]

  @ApiProperty({ description: '状态', enum: [0, 1] })
  @IsEnum([0, 1])
  status: 0 | 1
}
