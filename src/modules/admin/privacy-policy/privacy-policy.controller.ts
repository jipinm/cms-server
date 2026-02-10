import { Body, Controller, Get, Post, Query, Delete } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { PrivacyPolicyService } from './privacy-policy.service'
import { CreatePrivacyPolicyDto, PrivacyPolicyQueryDto } from './dto/privacy-policy.dto'
import { RequestUser } from '@core/decorators/request-user.decorator'
import { ApiResult } from '@common/swagger/api-result-decorator'
import { ValidationPipe } from '@core/pipes/validation.pipe'
import { PrivacyPolicyVo } from './vo/privacy-policy.vo'
import { Permissions } from '@core/decorators/permissions.decorator'

@ApiTags('隐私政策')
@Controller('admin/privacy-policy')
export class PrivacyPolicyController {
  constructor(private readonly policyService: PrivacyPolicyService) {}

  @Post()
  @ApiOperation({ summary: '创建新的隐私政策' })
  @ApiResult(PrivacyPolicyVo)
  @Permissions('privacy-policy:create')
  async create(@Body(ValidationPipe) dto: CreatePrivacyPolicyDto, @RequestUser() user: JwtUser) {
    return this.policyService.create(dto, user)
  }

  @Get('current')
  @ApiOperation({ summary: '获取当前版本的隐私政策' })
  @ApiResult(PrivacyPolicyVo)
  @Permissions('privacy-policy:read')
  async getCurrentPolicy(@RequestUser() user: JwtUser) {
    return this.policyService.getCurrentPolicy(user.siteId)
  }

  @Get()
  @ApiOperation({ summary: '获取所有隐私政策版本' })
  @ApiResult(PrivacyPolicyVo, { isPager: true, isArray: true })
  @Permissions('privacy-policy:list')
  async findAll(@Query(ValidationPipe) query: PrivacyPolicyQueryDto, @RequestUser() user: JwtUser) {
    return this.policyService.findAll(query, user)
  }

  @Delete('deleteAll')
  @ApiOperation({ summary: '删除所有隐私政策' })
  @Permissions('privacy-policy:delete')
  async deleteAll(@RequestUser() user: JwtUser) {
    return this.policyService.deleteAll(user)
  }
}
