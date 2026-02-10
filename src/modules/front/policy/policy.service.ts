import { Injectable, NotFoundException } from '@nestjs/common'
import { DatabaseService } from '@database/database.service'
import { QueryPolicyDto } from './dto/query-policy.dto'
import { ConfigService } from '@nestjs/config'
import { OBS_DOMAIN_KEY } from '@common/constants'
@Injectable()
export class PolicyService {
  constructor(
    private readonly db: DatabaseService,
    private readonly configService: ConfigService,
  ) {}

  private getDomain(siteCode = 'chery_xt') {
    return this.configService.get(`obs.${siteCode}.domain`) || this.configService.get('obs.default.domain')
  }

  async getCurrentPrivacyPolicy(query: QueryPolicyDto) {
    const { siteCode } = query

    // 查找站点
    const site = await this.db.site.findFirst({
      where: { code: siteCode },
    })

    if (!site) {
      throw new NotFoundException(`未找到编码为 ${siteCode} 的站点`)
    }

    const policy = await this.db.privacyPolicy.findFirst({
      where: {
        siteId: site.id,
        isCurrent: true,
      },
      select: {
        id: true,
        content: true,
        version: true,
        createTime: true,
      },
    })

    if (!policy) {
      throw new NotFoundException('未找到当前版本的隐私政策')
    }

    return {
      ...policy,
      content: policy.content?.replace(new RegExp(OBS_DOMAIN_KEY, 'g'), this.getDomain(siteCode)),
    }
  }

  async getCurrentLegalPolicy(query: QueryPolicyDto) {
    const { siteCode } = query

    // 查找站点
    const site = await this.db.site.findFirst({
      where: { code: siteCode },
    })

    if (!site) {
      throw new NotFoundException(`未找到编码为 ${siteCode} 的站点`)
    }

    const policy = await this.db.legalPolicy.findFirst({
      where: {
        siteId: site.id,
        isCurrent: true,
      },
      select: {
        id: true,
        content: true,
        version: true,
        createTime: true,
      },
    })

    if (!policy) {
      throw new NotFoundException('未找到当前版本的法律政策')
    }

    return {
      ...policy,
      content: policy.content?.replace(new RegExp(OBS_DOMAIN_KEY, 'g'), this.getDomain(siteCode)),
    }
  }
}
