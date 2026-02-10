import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { DatabaseService } from '@database/database.service'
import { CreateBannerDto, QueryBannerDto, UpdateBannerDto } from './dto/banner.dto'
import { ListOrder } from '@common/constants/list'
import { Prisma } from '@prisma/client'
import { ObsService } from '@database/obs.service'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import { ConfigService } from '@nestjs/config'
import { OBS_DOMAIN_KEY } from '@common/constants'

@Injectable()
export class BannersService {
  constructor(
    private readonly db: DatabaseService,
    private readonly obsService: ObsService,
    private readonly configService: ConfigService,
  ) {}

  private getDomain(user: JwtUser) {
    return this.configService.get(`obs.${user.siteCode}.domain`)  || this.configService.get('obs.default.domain')
  }

  async findAll(query: QueryBannerDto, user: JwtUser) {
    const { current, size, positionId, title } = query
    const skip = (current - 1) * size

    const where: Prisma.SiteBannerWhereInput = {
      siteId: user.siteId,
    }
    if (positionId) {
      where.positionId = positionId
    }
    if (title) {
      where.title = { contains: title }
    }

    const [total, items] = await Promise.all([
      this.db.siteBanner.count({ where }),
      this.db.siteBanner.findMany({
        where,
        skip,
        take: size,
        orderBy: [{ sort: ListOrder.Asc }, { publishTime: ListOrder.Desc }, { id: ListOrder.Desc }],
        select: {
          id: true,
          title: true,
          image: true,
          imageMobile: true,
          video: true,
          url: true,
          sort: true,
          status: true,
          createBy: true,
          createTime: true,
          jsondef: true,
          updateBy: true,
          updateTime: true,
          publishTime: true,
          position: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
        },
      }),
    ])

    return {
      items: items.map((item) => ({
        ...item,
        positionName: item.position.name,
        positionCode: item.position.code,
        image: item.image ? item.image.replace(OBS_DOMAIN_KEY, this.getDomain(user)) : null,
        imageMobile: item.imageMobile ? item.imageMobile.replace(OBS_DOMAIN_KEY, this.getDomain(user)) : null,
        video: item.video ? item.video.replace(OBS_DOMAIN_KEY, this.getDomain(user)) : null,
      })),
      total,
      current,
      size,
    }
  }

  async findOne(id: number, user: JwtUser) {
    const banner = await this.db.siteBanner.findUnique({ where: { id } })
    if (!banner) {
      throw new NotFoundException('Banner不存在')
    }

    return {
      ...banner,
      image: banner.image ? banner.image.replace(OBS_DOMAIN_KEY, this.getDomain(user)) : null,
      video: banner.video ? banner.video.replace(OBS_DOMAIN_KEY, this.getDomain(user)) : null,
      imageMobile: banner.imageMobile ? banner.imageMobile.replace(OBS_DOMAIN_KEY, this.getDomain(user)) : null,
    }
  }

  async create(createBannerDto: CreateBannerDto, user: JwtUser) {
    const { positionId, status, endTime, startTime, title, url, sort, publishTime, jsondef } = createBannerDto
    let { image, video, imageMobile } = createBannerDto

    // 检查位置是否存在
    const position = await this.db.siteBannerPosition.findFirst({
      where: { id: positionId, siteId: user.siteId },
    })
    if (!position) {
      throw new BadRequestException('位置不存在')
    }

    if (image) {
      image = image.replace(this.getDomain(user), OBS_DOMAIN_KEY)
    }

    if (video) {
      video = video.replace(this.getDomain(user), OBS_DOMAIN_KEY)
    }

    if (imageMobile) {
      imageMobile = imageMobile.replace(this.getDomain(user), OBS_DOMAIN_KEY)
    }

    const banner = await this.db.siteBanner.create({
      data: {
        positionId,
        siteId: user.siteId,
        status,
        title,
        url,
        sort,
        image,
        video,
        imageMobile,
        jsondef,
        publishTime,
        createBy: user.username,
      },
    })
    // await this.syncObsJson(user.siteId)
    return {
      ...banner,
      image: banner.image ? banner.image.replace(OBS_DOMAIN_KEY, this.getDomain(user)) : null,
      video: banner.video ? banner.video.replace(OBS_DOMAIN_KEY, this.getDomain(user)) : null,
      imageMobile: banner.imageMobile ? banner.imageMobile.replace(OBS_DOMAIN_KEY, this.getDomain(user)) : null,
    }
  }

  async update(id: number, updateBannerDto: UpdateBannerDto, user: JwtUser) {
    const bannerExists = await this.db.siteBanner.findUnique({
      where: { id, siteId: user.siteId },
      select: {
        id: true,
        siteId: true,
      },
    })
    const { positionId, status, title, url, sort, jsondef, publishTime } = updateBannerDto
    let { image, video, imageMobile } = updateBannerDto
    if (!bannerExists) {
      throw new BadRequestException('id不存在')
    }
    if (image) {
      image = image.replace(this.getDomain(user), OBS_DOMAIN_KEY)
    }

    if (video) {
      video = video.replace(this.getDomain(user), OBS_DOMAIN_KEY)
    }

    if (imageMobile) {
      imageMobile = imageMobile.replace(this.getDomain(user), OBS_DOMAIN_KEY)
    }

    const banner = await this.db.siteBanner.update({
      where: { id, siteId: user.siteId },
      data: { positionId, status, title, url, sort, image, video, jsondef, imageMobile, publishTime },
    })
    // await this.syncObsJson(user.siteId)
    return {
      ...banner,
      image: banner.image ? banner.image.replace(OBS_DOMAIN_KEY, this.getDomain(user)) : null,
      video: banner.video ? banner.video.replace(OBS_DOMAIN_KEY, this.getDomain(user)) : null,
      imageMobile: banner.imageMobile ? banner.imageMobile.replace(OBS_DOMAIN_KEY, this.getDomain(user)) : null,
    }
  }

  async remove(id: number, user: JwtUser) {
    const banner = await this.db.siteBanner.findUnique({
      where: { id, siteId: user.siteId },
      select: {
        id: true,
        siteId: true,
      },
    })

    if (!banner) {
      throw new BadRequestException('id不存在')
    }

    await this.db.siteBanner.delete({
      where: { id, siteId: user.siteId },
    })
    // await this.syncObsJson(banner.siteId)
    return { success: true }
  }

  async syncObsJson(siteId: number | bigint) {
    // 获取所有banner位置
    const positions = await this.db.siteBannerPosition.findMany({
      where: {
        status: 1,
        siteId,
      },
    })
    console.log('debug---positions', positions)

    // 遍历每个位置
    await Promise.all(
      positions.map(async (position) => {
        // 获取该位置下的所有有效banner
        const banners = await this.db.siteBanner.findMany({
          where: {
            positionId: position.id,
            status: 1,
          },
          orderBy: {
            sort: 'asc',
          },
          select: {
            title: true,
            image: true,
            video: true,
            url: true,
            sort: true,
          },
        })

        console.log('debug---banners', banners)

        try {
          // 构建临时文件路径
          const tempFilePath = path.join(os.tmpdir(), `banners-${position.code}.json`)

          // 写入JSON文件
          await fs.promises.writeFile(tempFilePath, JSON.stringify(banners))

          // 上传到obs
          const key = `banners/${position.code}/banners.json`
          await this.obsService.uploadFile({ Key: key, SourceFile: tempFilePath })

          // 删除临时文件
          await fs.promises.unlink(tempFilePath)
        } catch (error) {
          console.error(`同步Banner位置 ${position.code} 失败:`, error)
          throw error
        }
      }),
    )

    return { success: true }
  }
}
