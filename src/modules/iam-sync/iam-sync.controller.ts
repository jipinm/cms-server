import { Body, Controller, Logger, Post } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { IamSyncService } from './iam-sync.service'
import { BaseIamDto } from './dto/base.dto'
import { DeleteUserDto, UpdateUserDto } from './dto/user.dto'
import { CreateUserDto } from './dto/create-user.dto'

@ApiTags('用户同步')
@Controller('iam-sync')
export class IamSyncController {
  private readonly logger = new Logger(IamSyncController.name)

  constructor(private readonly iamSyncService: IamSyncService) {}

  @ApiOperation({ summary: '获取Schema定义' })
  @Post('SchemaService')
  async getSchema(@Body() params: BaseIamDto) {
    this.logger.log(`获取Schema定义: ${JSON.stringify(params)}`)
    return this.iamSyncService.getSchema(params)
  }

  @ApiOperation({ summary: '获取所有用户ID' })
  @Post('QueryAllUserIdsService')
  async queryAllUserIds(@Body() params: BaseIamDto) {
    this.logger.log(`获取所有用户ID: ${JSON.stringify(params)}`)
    return this.iamSyncService.getAllUserIds(params)
  }

  @ApiOperation({ summary: '根据ID获取用户信息' })
  @Post('QueryUserByIdService')
  async queryUserById(@Body() params: BaseIamDto & { bimUid: string }) {
    this.logger.log(`获取用户信息: ${JSON.stringify(params)}`)
    return this.iamSyncService.getUserById(params)
  }

  @ApiOperation({ summary: '创建用户' })
  @Post('UserCreateService')
  async createUser(@Body() params: CreateUserDto) {
    this.logger.log(`创建用户: ${JSON.stringify(params)}`)
    return this.iamSyncService.createUser(params)
  }

  @ApiOperation({ summary: '更新用户' })
  @Post('UserUpdateService')
  async updateUser(@Body() params: UpdateUserDto) {
    this.logger.log(`更新用户: ${JSON.stringify(params)}`)
    return this.iamSyncService.updateUser(params)
  }

  @ApiOperation({ summary: '删除用户' })
  @Post('UserDeleteService')
  async deleteUser(@Body() params: DeleteUserDto) {
    this.logger.log(`删除用户: ${JSON.stringify(params)}`)
    return this.iamSyncService.deleteUser(params)
  }
}
