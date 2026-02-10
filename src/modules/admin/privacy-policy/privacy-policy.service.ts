import { Injectable } from '@nestjs/common'
import { DatabaseService } from '@database/database.service'
import { CreatePrivacyPolicyDto, PrivacyPolicyQueryDto } from './dto/privacy-policy.dto'
import { Prisma } from '@prisma/client'
import { PrivacyPolicyVo } from './vo/privacy-policy.vo'
import { ListOrder } from '@common/constants/list'

const PRIVACY_POLICY_SELECT = Prisma.validator<Prisma.PrivacyPolicySelect>()({
  id: true,
  siteId: true,
  content: true,
  version: true,
  isCurrent: true,
  createBy: true,
  createTime: true,
  updateBy: true,
  updateTime: true,
})

@Injectable()
export class PrivacyPolicyService {
  constructor(private readonly db: DatabaseService) {}

  async create(dto: CreatePrivacyPolicyDto, user: JwtUser): Promise<PrivacyPolicyVo> {
    // 获取最新版本号
    const latestPolicy = await this.db.privacyPolicy.findFirst({
      where: { siteId: user.siteId },
      orderBy: { version: ListOrder.Desc },
    })
    const newVersion = latestPolicy ? latestPolicy.version + 1 : 1

    // 将所有政策设置为非当前版本
    await this.db.privacyPolicy.updateMany({
      where: { siteId: user.siteId },
      data: { isCurrent: false },
    })

    // 创建新政策
    return this.db.privacyPolicy.create({
      data: {
        version: newVersion,
        isCurrent: true,
        createBy: user.username,
        content: dto.content,
        siteId: user.siteId,
      },
      select: PRIVACY_POLICY_SELECT,
    })
  }

  async getCurrentPolicy(siteId: number): Promise<PrivacyPolicyVo> {
    return this.db.privacyPolicy.findFirst({
      where: { siteId, isCurrent: true },
      select: PRIVACY_POLICY_SELECT,
    })
  }

  async findAll(query: PrivacyPolicyQueryDto, user: JwtUser) {
    const { current, size } = query
    const skip = (current - 1) * size

    const [total, items] = await Promise.all([
      this.db.privacyPolicy.count({ where: { siteId: user.siteId } }),
      this.db.privacyPolicy.findMany({
        where: { siteId: user.siteId },
        skip,
        take: size,
        orderBy: { version: ListOrder.Desc },
        select: PRIVACY_POLICY_SELECT,
      }),
    ])

    return { items, total, current, size }
  }

  async deleteAll(user: JwtUser) {
    await this.db.privacyPolicy.deleteMany({ where: { siteId: user.siteId } })
  }
}
