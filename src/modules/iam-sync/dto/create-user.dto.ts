import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty, IsOptional, IsString, Length, Matches } from 'class-validator'
import { BaseIamDto } from './base.dto'
import { IamUserCreate } from '../interfaces/user.interface'
import { DATE_PATTERN, EMAIL_PATTERN, GENDER, MOBILE_PATTERN, SEQUENCE_PATTERN, USER_TYPE } from '../constants/common'

export class CreateUserDto extends BaseIamDto implements IamUserCreate {
  @ApiProperty({ description: '姓名' })
  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  fullname: string

  @ApiProperty({ description: '性别', enum: Object.values(GENDER) })
  @IsOptional()
  @IsEnum(GENDER)
  gender?: string

  @ApiProperty({ description: '出生日期' })
  @IsOptional()
  @Matches(DATE_PATTERN, { message: '出生日期格式错误' })
  birthDate?: string

  @ApiProperty({ description: '用户类型', enum: Object.values(USER_TYPE) })
  @IsNotEmpty()
  @IsEnum(USER_TYPE)
  userType: string

  @ApiProperty({ description: '用户名' })
  @IsNotEmpty()
  @IsString()
  @Length(1, 30)
  username: string

  @ApiProperty({ description: '工号' })
  @IsNotEmpty()
  @IsString()
  @Length(1, 50)
  employeeNumber: string

  @ApiProperty({ description: '手机号' })
  @IsOptional()
  @Matches(MOBILE_PATTERN, { message: '手机号格式错误' })
  mobile?: string

  @ApiProperty({ description: '组织机构ID' })
  @IsOptional()
  @IsString()
  organizationId?: string

  @ApiProperty({ description: '序号' })
  @IsOptional()
  @Matches(SEQUENCE_PATTERN, { message: '序号格式错误' })
  sequence?: string

  @ApiProperty({ description: '企业邮箱' })
  @IsOptional()
  @Matches(EMAIL_PATTERN, { message: '邮箱格式错误' })
  enterpriseEmail?: string

  @ApiProperty({ description: 'AD域账号' })
  @IsOptional()
  @IsString()
  adAccount?: string

  @ApiProperty({ description: '入职时间' })
  @IsOptional()
  @Matches(DATE_PATTERN, { message: '入职时间格式错误' })
  entryTime?: string

  @ApiProperty({ description: '显示名称' })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  displayName?: string

  @ApiProperty({ description: '密码' })
  @IsOptional()
  @IsString()
  @Length(6, 20)
  password?: string
}
