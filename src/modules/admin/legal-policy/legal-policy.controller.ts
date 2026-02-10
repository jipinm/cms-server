import { Body, Controller, Get, Post, Query, Delete } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { LegalPolicyService } from './legal-policy.service'
import { CreateLegalPolicyDto, LegalPolicyQueryDto } from './dto/legal-policy.dto'
import { RequestUser } from '@core/decorators/request-user.decorator'
import { ApiResult } from '@common/swagger/api-result-decorator'
import { ValidationPipe } from '@core/pipes/validation.pipe'
import { LegalPolicyVo } from './vo/legal-policy.vo'
import { Permissions } from '@core/decorators/permissions.decorator'

@ApiTags('法律政策')
@Controller('admin/legal-policy')
export class LegalPolicyController {
  constructor(private readonly policyService: LegalPolicyService) {}

  @Post()
  @ApiOperation({ summary: '创建新的法律政策' })
  @ApiResult(LegalPolicyVo)
  @Permissions('statute:create')
  async create(@Body(ValidationPipe) dto: CreateLegalPolicyDto, @RequestUser() user: JwtUser) {
    return this.policyService.create(dto, user)
  }

  @Get('current')
  @ApiOperation({ summary: '获取当前版本的法律政策' })
  @ApiResult(LegalPolicyVo)
  @Permissions('statute:read')
  async getCurrentPolicy(@RequestUser() user: JwtUser) {
    return this.policyService.getCurrentPolicy(user.siteId)
  }

  @Get()
  @ApiOperation({ summary: '获取所有法律政策版本' })
  @ApiResult(LegalPolicyVo, { isPager: true, isArray: true })
  @Permissions('statute:list')
  async findAll(@Query(ValidationPipe) query: LegalPolicyQueryDto, @RequestUser() user: JwtUser) {
    return this.policyService.findAll(query, user)
  }

  @Delete('deleteAll')
  @ApiOperation({ summary: '删除所有法律政策' })
  @Permissions('statute:delete')
  async deleteAll(@RequestUser() user: JwtUser) {
    return this.policyService.deleteAll(user)
  }
}
