import { Public } from '@core/guards/jwt-auth.guard'
import { Controller, Get } from '@nestjs/common'
import { HealthCheck, HealthCheckService } from '@nestjs/terminus'
import { ApiHealthIndicator, DatabaseHealthIndicator, RedisHealthIndicator } from './health.indicator'
import { ApiOperation } from '@nestjs/swagger'
import { RateLimit } from '@core/decorators/rate-limit.decorator'

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private apiHealthIndicator: ApiHealthIndicator,
    private databaseHealthIndicator: DatabaseHealthIndicator,
    private redisHealthIndicator: RedisHealthIndicator, // private elasticsearchHealthIndicator: ElasticsearchHealthIndicator,
  ) {}

  @ApiOperation({
    summary: '健康检查',
    tags: ['健康检查'],
  })
  @Public()
  @Get()
  @RateLimit({ ttl: 60, limit: 30 }) // 每分钟最多30次请求
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.apiHealthIndicator.isHealthy(),
      () => this.databaseHealthIndicator.isHealthy(),
      () => this.redisHealthIndicator.isHealthy(),
      // () => this.elasticsearchHealthIndicator.isHealthy(),
    ])
  }
}
