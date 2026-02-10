import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { DatabaseService } from '@database/database.service'
import { CreateBannerPositionDto, QueryBannerPositionDto, UpdateBannerPositionDto } from './dto/banner-position.dto'
import { Prisma } from '@prisma/client'
import { ListOrder } from '@common/constants/list'

@Injectable()
export class BannerPositionsService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(query: QueryBannerPositionDto, user: JwtUser) {
    const { current, size, name, code, searchText } = query
    const skip = (current - 1) * size

    let where: Prisma.SiteBannerPositionWhereInput = {
      siteId: user.siteId
    }

    if (name) {
      where.name = { contains: name }
    }
    if (code) {
      where.code = { contains: code }
    }

    if (searchText){
      where = {
        AND: [
          {siteId: user.siteId},
          {
            OR:[
              {code: {contains: searchText}},
              {name: {contains: searchText}}
            ]
          }
        ]
      }
    }

    const [total, items] = await Promise.all([
      this.db.siteBannerPosition.count({ where }),
      this.db.siteBannerPosition.findMany({
        where,
        skip,
        take: size,
        orderBy: { id: ListOrder.Desc },
      }),
    ])

    return { items, total, current, size }
  }

  async findOne(id: number, user: JwtUser) {
    const bannerPosition = await this.db.siteBannerPosition.findUnique({ where: { id, siteId: user.siteId } })
    if (!bannerPosition) {
      throw new NotFoundException('Banner位置不存在')
    }
    return bannerPosition
  }

  async create(createBannerPositionDto: CreateBannerPositionDto, user: JwtUser) {
    const { name, description, status, code } = createBannerPositionDto

    try {
      return await this.db.siteBannerPosition.create({
        data: {
          name,
          description,
          code,
          siteId: user.siteId,
          status,
          createBy: user.username,
        },
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException('位置编码已存在')
        }
      }
      throw error
    }
  }

  async update(updateBannerPositionDto: UpdateBannerPositionDto, user: JwtUser) {
    const { id, name, description, code, status } = updateBannerPositionDto
    const currentSiteBannerPosition = await this.db.siteBannerPosition.findUnique({
      where: { id, siteId: user.siteId },
      select: {
        siteId: true,
        id: true,
      },
    })
    if (!currentSiteBannerPosition) {
      throw new BadRequestException('id不存在')
    }

    return this.db.siteBannerPosition.update({
      where: { id, siteId: user.siteId },
      data: {
        name,
        description,
        code,
        status,
        updateBy: user.username,
        updateTime: new Date(),
      },
    })
  }

  async remove(id: number, user: JwtUser) {
    const currentSiteBannerPosition = await this.db.siteBannerPosition.findUnique({
      where: { id, siteId: user.siteId },
      select: {
        siteId: true,
        id: true,
      },
    })
    if (!currentSiteBannerPosition) {
      throw new BadRequestException('id不存在')
    }

    // 检查是否有关联的banner
    const bannerCount = await this.db.siteBanner.count({
      where: {
        positionId: id,
      },
    })

    if (bannerCount > 0) {
      throw new BadRequestException('该位置下存在Banner，无法删除')
    }

    await this.db.siteBannerPosition.delete({
      where: { id, siteId: user.siteId },
    })
    return { success: true }
  }
}
