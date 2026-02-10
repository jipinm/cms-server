import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty, IsOptional, IsString, Length, Matches } from 'class-validator'
import { BaseIamDto } from './base.dto'
import { DATE_PATTERN, EMAIL_PATTERN, GENDER, MOBILE_PATTERN, SEQUENCE_PATTERN, USER_TYPE } from '../constants/common'

export class UpdateUserDto extends BaseIamDto {
  @ApiProperty({ description: '用户ID' })
  @IsNotEmpty()
  @IsString()
  bimUid: string

  @ApiProperty({ description: '是否启用', required: false })
  @IsOptional()
  __ENABLE__?: boolean

  @ApiProperty({ description: '姓名', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  fullname?: string

  @ApiProperty({ description: '性别', enum: Object.values(GENDER), required: false })
  @IsOptional()
  @IsEnum(GENDER)
  gender?: string

  @ApiProperty({ description: '出生日期', required: false })
  @IsOptional()
  @Matches(DATE_PATTERN, { message: '出生日期格式错误' })
  birthDate?: string

  @ApiProperty({ description: '用户类型', enum: Object.values(USER_TYPE), required: false })
  @IsOptional()
  @IsEnum(USER_TYPE)
  userType?: string

  @ApiProperty({ description: '用户名', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 30)
  username?: string

  @ApiProperty({ description: '手机号', required: false })
  @IsOptional()
  @Matches(MOBILE_PATTERN, { message: '手机号格式错误' })
  mobile?: string

  @ApiProperty({ description: '组织机构ID', required: false })
  @IsOptional()
  @IsString()
  organizationId?: string

  @ApiProperty({ description: '序号', required: false })
  @IsOptional()
  @Matches(SEQUENCE_PATTERN, { message: '序号格式错误' })
  sequence?: string

  @ApiProperty({ description: '企业邮箱', required: false })
  @IsOptional()
  @Matches(EMAIL_PATTERN, { message: '邮箱格式错误' })
  enterpriseEmail?: string

  @ApiProperty({ description: 'AD域账号', required: false })
  @IsOptional()
  @IsString()
  adAccount?: string

  @ApiProperty({ description: '入职时间', required: false })
  @IsOptional()
  @Matches(DATE_PATTERN, { message: '入职时间格式错误' })
  entryTime?: string

  @ApiProperty({ description: '显示名称', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  displayName?: string
}

export class DeleteUserDto extends BaseIamDto {
  @ApiProperty({ description: '用户ID' })
  @IsNotEmpty()
  @IsString()
  bimUid: string
}
