import { Controller, Get, Query } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { PolicyService } from './policy.service'
import { QueryPolicyDto } from './dto/query-policy.dto'
import { ValidationPipe } from '@core/pipes/validation.pipe'
import { Public } from '@core/guards/jwt-auth.guard'
import { ApiResult } from '@common/swagger/api-result-decorator'
import { PolicyVo } from './vo/policy.vo'
import { RateLimit } from '@core/decorators/rate-limit.decorator'

@ApiTags('前台政策')
@Controller('front/policy')
@Public()
export class PolicyController {
  constructor(private readonly policyService: PolicyService) {}

  @Get('privacy')
  @RateLimit({ ttl: 60, limit: 30 }) // 每分钟最多30次请求
  @ApiOperation({ summary: '获取当前版本的隐私政策' })
  @ApiResult(PolicyVo)
  async getCurrentPrivacyPolicy(@Query(ValidationPipe) query: QueryPolicyDto) {
    return this.policyService.getCurrentPrivacyPolicy(query)
  }

  @Get('legal')
  @RateLimit({ ttl: 60, limit: 30 }) // 每分钟最多30次请求
  @ApiOperation({ summary: '获取当前版本的法律政策' })
  @ApiResult(PolicyVo)
  async getCurrentLegalPolicy(@Query(ValidationPipe) query: QueryPolicyDto) {
    return this.policyService.getCurrentLegalPolicy(query)
  }
}
