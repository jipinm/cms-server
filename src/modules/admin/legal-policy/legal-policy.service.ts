import { Injectable } from '@nestjs/common'
import { DatabaseService } from '@database/database.service'
import { CreateLegalPolicyDto, LegalPolicyQueryDto } from './dto/legal-policy.dto'
import { Prisma } from '@prisma/client'
import { LegalPolicyVo } from './vo/legal-policy.vo'
import { ListOrder } from '@common/constants/list'
const LEGAL_POLICY_SELECT = Prisma.validator<Prisma.LegalPolicySelect>()({
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
export class LegalPolicyService {
  constructor(private readonly db: DatabaseService) {}

  async create(dto: CreateLegalPolicyDto, user: JwtUser): Promise<LegalPolicyVo> {
    const latestPolicy = await this.db.legalPolicy.findFirst({
      where: { siteId: user.siteId },
      orderBy: { version: ListOrder.Desc },
    })
    const newVersion = latestPolicy ? latestPolicy.version + 1 : 1

    await this.db.legalPolicy.updateMany({
      where: { siteId: user.siteId },
      data: { isCurrent: false },
    })

    return this.db.legalPolicy.create({
      data: {
        ...dto,
        siteId: user.siteId,
        version: newVersion,
        isCurrent: true,
        createBy: user.username,
      },
      select: LEGAL_POLICY_SELECT,
    })
  }

  async getCurrentPolicy(siteId: number): Promise<LegalPolicyVo> {
    return this.db.legalPolicy.findFirst({
      where: { siteId, isCurrent: true },
      select: LEGAL_POLICY_SELECT,
    })
  }

  async findAll(query: LegalPolicyQueryDto, user: JwtUser) {
    const { current, size } = query
    const skip = (current - 1) * size

    const where: Prisma.LegalPolicyWhereInput = {}

    const [total, items] = await Promise.all([
      this.db.legalPolicy.count({ where: { siteId: user.siteId } }),
      this.db.legalPolicy.findMany({
        where: { siteId: user.siteId },
        skip,
        take: size,
        orderBy: { version: ListOrder.Desc },
        select: LEGAL_POLICY_SELECT,
      }),
    ])

    return { items, total, current, size }
  }

  async deleteAll(user: JwtUser) {
    await this.db.legalPolicy.deleteMany({ where: { siteId: user.siteId } })
  }
}
