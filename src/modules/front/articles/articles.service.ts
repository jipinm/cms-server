import { Injectable, NotFoundException } from '@nestjs/common'
import { DatabaseService } from '@database/database.service'
import { QueryArticleDto } from './dto/query-article.dto'
import { Prisma } from '@prisma/client'
import { AllYesNo, ListOrder } from '@common/constants/list'
import { ConfigService } from '@nestjs/config'
import { OBS_DOMAIN_KEY } from '@common/constants'

@Injectable()
export class ArticlesService {
  constructor(
    private readonly db: DatabaseService,
    private readonly configService: ConfigService,
  ) {}

  private getDomain(siteCode = 'chery_xt') {
    return this.configService.get(`obs.${siteCode}.domain`) || this.configService.get('obs.default.domain')
  }

  async findAll(query: QueryArticleDto) {
    const { siteCode, category, tag, current, size } = query

    // 查找站点
    const site = await this.db.site.findFirst({
      where: { code: siteCode },
    })

    if (!site) {
      throw new NotFoundException(`未找到编码为 ${siteCode} 的站点`)
    }

    const where: Prisma.ArticleWhereInput = {
      siteId: site.id,
      status: AllYesNo.YES,
    }

    if (category) {
      where.categories = {
        some: {
          category: {
            slug: {
              in: category.split(','),
            },
          },
        },
      }
    }

    if (tag) {
      where.tags = {
        some: {
          tag: {
            slug: {
              in: tag.split(','),
            },
          },
        },
      }
    }

    const [total, items] = await Promise.all([
      this.db.article.count({ where }),
      this.db.article.findMany({
        where,
        skip: (current - 1) * size,
        take: size,
        include: {
          tags: {
            include: { tag: true },
          },
          categories: {
            include: { category: true },
          },
        },
        orderBy: [{ publishTime: ListOrder.Desc }],
      }),
    ])

    return {
      items: items.map((item) => ({
        ...item,
        imageUrl: item.imageUrl ? item.imageUrl.replace(OBS_DOMAIN_KEY, this.getDomain(siteCode)) : null,
        imageMobileUrl: item.imageMobileUrl ? item.imageMobileUrl.replace(OBS_DOMAIN_KEY, this.getDomain(siteCode)) : null,
        videoUrl: item.videoUrl ? item.videoUrl.replace(OBS_DOMAIN_KEY, this.getDomain(siteCode)) : null,
        content: item.content?.replace(new RegExp(OBS_DOMAIN_KEY, 'g'), this.getDomain(siteCode)),
        tags: item.tags.map((tag) => tag.tag),
        categories: item.categories.map((category) => category.category),
      })),
      total,
      current,
      size,
    }
  }

  async findCategories(siteCode: string) {
    const site = await this.db.site.findFirst({
      where: { code: siteCode },
    })

    if (!site) {
      throw new NotFoundException(`未找到编码为 ${siteCode} 的站点`)
    }

    return this.db.articleCategory.findMany({
      where: {
        siteId: site.id,
      },
    })
  }

  async findTags(siteCode: string) {
    const site = await this.db.site.findFirst({
      where: { code: siteCode },
    })

    if (!site) {
      throw new NotFoundException(`未找到编码为 ${siteCode} 的站点`)
    }

    return this.db.articleTag.findMany({
      where: {
        siteId: site.id,
      },
    })
  }

  async findOne(id: number) {
    const article = await this.db.article.findFirst({
      where: { id },
    })
    const site = await this.db.site.findFirst({
      where: { id: article.siteId },
    })
    if (!article) {
      throw new NotFoundException('文章不存在')
    }
    return {
      ...article,
      imageUrl: article.imageUrl ? article.imageUrl.replace(OBS_DOMAIN_KEY, this.getDomain(site.code)) : null,
      imageMobileUrl: article.imageMobileUrl ? article.imageMobileUrl.replace(OBS_DOMAIN_KEY, this.getDomain(site.code)) : null,
      videoUrl: article.videoUrl ? article.videoUrl.replace(OBS_DOMAIN_KEY, this.getDomain(site.code)) : null,
      content: article.content?.replace(new RegExp(OBS_DOMAIN_KEY, 'g'), this.getDomain(site.code)),
    }
  }

  async findBySlug(siteCode: string, slug: string) {
    const site = await this.db.site.findFirst({
      where: { code: siteCode },
    })
    if (!site) {
      throw new NotFoundException(`未找到编码为 ${siteCode} 的站点`)
    }
    const article = await this.db.article.findFirst({
      where: { siteId: site.id, slug },
    })
    if (!article) {
      throw new NotFoundException('文章不存在')
    }
    return {
      ...article,
      imageUrl: article.imageUrl ? article.imageUrl.replace(OBS_DOMAIN_KEY, this.getDomain(site.code)) : null,
      imageMobileUrl: article.imageMobileUrl ? article.imageMobileUrl.replace(OBS_DOMAIN_KEY, this.getDomain(site.code)) : null,
      videoUrl: article.videoUrl ? article.videoUrl.replace(OBS_DOMAIN_KEY, this.getDomain(site.code)) : null,
      content: article.content?.replace(new RegExp(OBS_DOMAIN_KEY, 'g'), this.getDomain(site.code)),
    }
  }

  async replaceUrlPrefix(body: { prefix: string; replacer: string; siteCode: string }) {
    const { prefix, replacer, siteCode } = body
    const site = await this.db.site.findFirst({
      where: { code: siteCode },
    })
    if (!site) {
      throw new NotFoundException(`未找到编码为 ${siteCode} 的站点`)
    }
    const articles = await this.db.article.findMany({
      where: { siteId: site.id },
    })

    const result = await Promise.all(
      articles.map(async (article) => {
        article.content = article.content?.replace(new RegExp(prefix, 'g'), replacer)
        return await this.db.article.update({
          where: { id: article.id },
          data: { content: article.content },
        })
      }),
    )
    return result
  }
}
