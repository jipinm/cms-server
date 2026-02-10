import { Body, Controller, Delete, Get, Param, Post, Put, Query, Request } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { UsersService } from './users.service'
import { BatchResetPasswordDto, ChangeStatusDto, CreateUserDto, QueryUserDto, UpdateUserDto, UpdateBaseUserDto, UpdatePasswordDto } from './dto/user.dto'
import { Permissions } from '@core/decorators/permissions.decorator'
import { ApiResult, SuccessVo } from '@common/swagger/api-result-decorator'
import { UserVo } from './vo/user.vo'
import { ValidationPipe } from '@core/pipes/validation.pipe'
import { RequestUser } from '@core/decorators/request-user.decorator'

@ApiTags('用户管理')
@Controller('admin/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // 获取用户详情
  @Get(':id')
  @ApiOperation({ summary: '获取用户详情' })
  @ApiResult(UserVo)
  @Permissions('user:read')
  async findOne(@Param('id') id: number) {
    return this.usersService.findOne(id)
  }
  @Get()
  @ApiOperation({ summary: '获取用户列表' })
  @ApiResult(UserVo, { isPager: true, isArray: true })
  @Permissions('user:list')
  async findAll(@Query(ValidationPipe) query: QueryUserDto) {
    return this.usersService.findAll(query)
  }

  @Post()
  @ApiOperation({ summary: '创建用户' })
  @Permissions('user:create')
  @ApiResult(UserVo)
  async create(@Body(ValidationPipe) createUserDto: CreateUserDto, @RequestUser() user) {
    return this.usersService.create(createUserDto, user)
  }

  @Put(':id')
  @ApiOperation({ summary: '更新用户' })
  @Permissions('user:update')
  @ApiResult(UserVo)
  async update(@Param('id') id: number, @Body(ValidationPipe) updateUserDto: UpdateUserDto, @RequestUser() user) {
    return this.usersService.update(id, updateUserDto, user)
  }

  @Put('baseinfo/update')
  @ApiOperation({ summary: '个人中心:更新用户基本信息' })
  @ApiResult(UserVo)
  async updateBaseInfo(@Request() req, @Body(ValidationPipe) updateBaseUserDto: UpdateBaseUserDto, @RequestUser() user) {
    return this.usersService.updateBaseInfo(req.user.id, updateBaseUserDto, user)
  }

  @Put('baseinfo/updatepassword')
  @ApiOperation({ summary: '个人中心:重置密码' })
  @ApiResult(UserVo)
  async updatePassword(@Request() req, @Body(ValidationPipe) updatePasswordDto: UpdatePasswordDto, @RequestUser() user) {
    return this.usersService.updatePassword(req.user.id, updatePasswordDto, user)
  }
  

  @Delete(':id')
  @ApiOperation({ summary: '删除用户' })
  @ApiResult(SuccessVo)
  @Permissions('user:delete')
  async remove(@Param('id') id: number) {
    return this.usersService.remove(id)
  }

  @Post('batch-reset-password')
  @ApiOperation({ summary: '批量重置密码' })
  @ApiResult(SuccessVo)
  @Permissions('user:batch-reset-password')
  async batchResetPassword(@Body(ValidationPipe) body: BatchResetPasswordDto) {
    return this.usersService.batchResetPassword(body.userIds)
  }

  //   批量禁用/启用
  @Post('change-status')
  @ApiOperation({ summary: '批量禁用/启用' })
  @Permissions('user:batch-change-status')
  @ApiResult(SuccessVo)
  async changeStatus(@Body(ValidationPipe) body: ChangeStatusDto) {
    return this.usersService.changeStatus(body.userIds, body.status)
  }
}
