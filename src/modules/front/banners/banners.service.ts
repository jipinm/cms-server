import { Injectable, NotFoundException } from '@nestjs/common'
import { DatabaseService } from '@database/database.service'
import { QueryBannerCodesDto, QueryBannerDto } from './dto/query-banner.dto'
import { ListOrder } from '@common/constants/list'
import { omit } from 'lodash'
import { ConfigService } from '@nestjs/config'
import { OBS_DOMAIN_KEY } from '@common/constants'

@Injectable()
export class BannersService {
  constructor(
    private readonly db: DatabaseService,
    private readonly configService: ConfigService,
  ) {}

  private getDomain(siteCode = 'chery_xt') {
    return this.configService.get(`obs.${siteCode}.domain`) || this.configService.get('obs.default.domain')
  }

  async findByPositionCode(query: QueryBannerDto) {
    const { code, siteCode } = query

    // 查找站点
    const site = await this.db.site.findFirst({
      where: {
        code: siteCode,
        status: 1,
      },
    })

    if (!site) {
      throw new NotFoundException(`未找到编码为 ${siteCode} 的站点`)
    }

    // 查找位置信息
    const position = await this.db.siteBannerPosition.findFirst({
      where: {
        code,
        siteId: site.id,
        status: 1,
      },
      select: {
        id: true,
        code: true,
        name: true,
      },
    })

    if (!position) {
      throw new NotFoundException(`未找到编码为 ${code}的配置分类`)
    }

    // 查找该位置下的所有 banner
    const banners = await this.db.siteBanner.findMany({
      where: {
        positionId: position.id,
        siteId: site.id,
        status: 1,
      },
      orderBy: [{ sort: ListOrder.Asc }, { publishTime: ListOrder.Desc }, { id: ListOrder.Desc }],
      select: {
        id: true,
        title: true,
        image: true,
        imageMobile: true,
        video: true,
        url: true,
        sort: true,
        jsondef: true,
        publishTime: true,
        position: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    })

    return banners.map((banner) => ({
      ...omit(banner, ['position']),
      image: banner.image ? banner.image.replace(OBS_DOMAIN_KEY, this.getDomain(siteCode)) : null,
      imageMobile: banner.imageMobile ? banner.imageMobile.replace(OBS_DOMAIN_KEY, this.getDomain(siteCode)) : null,
      video: banner.video ? banner.video.replace(OBS_DOMAIN_KEY, this.getDomain(siteCode)) : null,
      positionCode: banner.position.code,
      positionName: banner.position.name,
    }))
  }

  async findByPositionCodes(query: QueryBannerCodesDto) {
    const { codes, siteCode } = query

    // 查找站点
    const site = await this.db.site.findFirst({
      where: { code: siteCode },
    })

    if (!site) {
      throw new NotFoundException(`未找到编码为 ${siteCode} 的站点`)
    }

    const positions = await this.db.siteBannerPosition.findMany({
      where: {
        code: { in: codes },
        siteId: site.id,
        status: 1,
      },
      select: {
        id: true,
        code: true,
        name: true,
        banners: {
          select: {
            id: true,
            title: true,
            image: true,
            imageMobile: true,
            jsondef: true,
            video: true,
            url: true,
            sort: true,
          },
          where: {
            status: 1,
          },
          orderBy: [{ sort: ListOrder.Desc }, { id: ListOrder.Desc }],
        },
      },
    })

    // 根据codes参数排序positions
    return positions
      .sort((a, b) => codes.indexOf(a.code) - codes.indexOf(b.code))
      .map((position) => ({
        ...position,
        banners: position.banners.map((banner) => ({
          ...banner,
          imageMobile: banner.imageMobile ? banner.imageMobile.replace(OBS_DOMAIN_KEY, this.getDomain(siteCode)) : null,
          image: banner.image ? banner.image.replace(OBS_DOMAIN_KEY, this.getDomain(siteCode)) : null,
          video: banner.video ? banner.video.replace(OBS_DOMAIN_KEY, this.getDomain(siteCode)) : null,
        })),
      }))
  }
}
