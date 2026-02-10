import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { DatabaseService } from '@database/database.service'
import { Prisma } from '@prisma/client'
import { CreateArticleDto, QueryArticleDto, UpdateArticleDto, UpdateArticleStatusDto } from './dto/article.dto'
import { ListOrder } from '@common/constants/list'
import { OBS_DOMAIN_KEY } from '@common/constants'
import { ConfigService } from '@nestjs/config'
import { generateRandomString } from '@utils/tools'

@Injectable()
export class ArticlesService {
  constructor(
    private readonly db: DatabaseService,
    private readonly configService: ConfigService,
  ) {}

  private getDomain(user: JwtUser) {
    return this.configService.get(`obs.${user.siteCode}.domain`) || this.configService.get('obs.default.domain')
  }

  async findAll(query: QueryArticleDto, user: JwtUser) {
    const { current, size, title, status, publishTimeStart, publishTimeEnd, tagIds, categoryIds } = query
    const skip = (current - 1) * size

    const where: Prisma.ArticleWhereInput = {
      siteId: user.siteId,
    }

    if (title) {
      where.title = { contains: title }
    }
    if (status === 0 || status === 1) {
      where.status = status
    }
    if (publishTimeStart && publishTimeEnd) {
      where.publishTime = { gte: publishTimeStart, lte: publishTimeEnd }
    }
    if (tagIds) {
      where.tags = { some: { tagId: { in: tagIds } } }
    }
    if (categoryIds) {
      where.categories = { some: { categoryId: { in: categoryIds } } }
    }

    const [total, items] = await Promise.all([
      this.db.article.count({ where }),
      this.db.article.findMany({
        where,
        skip,
        take: size,
        include: {
          tags: {
            include: { tag: true },
          },
          categories: {
            include: { category: true },
          },
        },
        orderBy: [{ id: ListOrder.Desc }],
      }),
    ])

    return {
      items: items.map((item) => ({
        ...item,
        imageUrl: item.imageUrl ? item.imageUrl.replace(OBS_DOMAIN_KEY, this.getDomain(user)) : null,
        imageMobileUrl: item.imageMobileUrl ? item.imageMobileUrl.replace(OBS_DOMAIN_KEY, this.getDomain(user)) : null,
        videoUrl: item.videoUrl ? item.videoUrl.replace(OBS_DOMAIN_KEY, this.getDomain(user)) : null,
        content: item.content?.replace(new RegExp(OBS_DOMAIN_KEY, 'g'), this.getDomain(user)),
      })),
      total,
      current,
      size,
    }
  }
  async findOne(id: number, user: JwtUser) {
    const article = await this.db.article.findFirst({
      where: { id, siteId: user.siteId },
      include: {
        tags: { include: { tag: true } },
        categories: { include: { category: true } },
      },
    })

    if (!article) {
      throw new NotFoundException(`Article #${id} not found`)
    }

    return {
      ...article,
      imageUrl: article.imageUrl ? article.imageUrl.replace(OBS_DOMAIN_KEY, this.getDomain(user)) : null,
      imageMobileUrl: article.imageMobileUrl ? article.imageMobileUrl.replace(OBS_DOMAIN_KEY, this.getDomain(user)) : null,
      videoUrl: article.videoUrl ? article.videoUrl.replace(OBS_DOMAIN_KEY, this.getDomain(user)) : null,
      content: article.content?.replace(new RegExp(OBS_DOMAIN_KEY, 'g'), this.getDomain(user)),
    }
  }

  async create(createArticleDto: CreateArticleDto, user: JwtUser) {
    // 检查同级分类下slug是否唯一
    // const exists = await this.db.article.findFirst({
    //   where: {
    //     slug: createArticleDto.slug,
    //     siteId: user.siteId,
    //   },
    // })

    // if (exists) {
    //   throw new BadRequestException('Article slug already exists')
    // }
    if (!createArticleDto.slug) {
      createArticleDto.slug = generateRandomString(6)
    }

    let { imageUrl, imageMobileUrl, videoUrl } = createArticleDto
    if (imageUrl) {
      imageUrl = imageUrl.replace(this.getDomain(user), OBS_DOMAIN_KEY)
    }
    if (imageMobileUrl) {
      imageMobileUrl = imageMobileUrl.replace(this.getDomain(user), OBS_DOMAIN_KEY)
    }
    if (videoUrl) {
      videoUrl = videoUrl.replace(this.getDomain(user), OBS_DOMAIN_KEY)
    }

    const article = await this.db.article.create({
      data: {
        siteId: user.siteId,
        title: createArticleDto.title,
        slug: createArticleDto.slug,
        summary: createArticleDto.summary,
        content: createArticleDto.content.replace(new RegExp(this.getDomain(user), 'g'), OBS_DOMAIN_KEY),
        imageUrl,
        imageMobileUrl,
        videoUrl,
        status: createArticleDto.status,
        sort: createArticleDto.sort || 0,
        seoTitle: createArticleDto.seoTitle,
        seoKeywords: createArticleDto.seoKeywords,
        seoDescription: createArticleDto.seoDescription,
        createBy: user.username,
        publishTime: createArticleDto.publishTime || new Date(),
        tags: {
          create: createArticleDto.tagIds?.map((tagId) => ({
            tag: { connect: { id: tagId } },
          })),
        },
        categories: {
          create: createArticleDto.categoryIds?.map((categoryId) => ({
            category: { connect: { id: categoryId } },
          })),
        },
      },
      include: {
        tags: { include: { tag: true } },
        categories: { include: { category: true } },
      },
    })

    return {
      ...article,
      imageUrl: article.imageUrl.replace(OBS_DOMAIN_KEY, this.getDomain(user)),
      imageMobileUrl: article.imageMobileUrl.replace(OBS_DOMAIN_KEY, this.getDomain(user)),
      videoUrl: article.videoUrl.replace(OBS_DOMAIN_KEY, this.getDomain(user)),
      content: article.content?.replace(new RegExp(OBS_DOMAIN_KEY, 'g'), this.getDomain(user)),
    }
  }

  async update(id: number, updateArticleDto: UpdateArticleDto, user: JwtUser) {
    // 检查同级分类下slug是否唯一
    // const exists = await this.db.article.findFirst({
    //   where: {
    //     slug: updateArticleDto.slug,
    //     siteId: user.siteId,
    //     id: { not: id },
    //   },
    // })

    // if (exists) {
    //   throw new BadRequestException('Article slug already exists')
    // }
    if (!updateArticleDto.slug) {
      updateArticleDto.slug = generateRandomString(6)
    }

    let { imageUrl, imageMobileUrl, videoUrl } = updateArticleDto
    if (imageUrl) {
      imageUrl = imageUrl.replace(this.getDomain(user), OBS_DOMAIN_KEY)
    }
    if (imageMobileUrl) {
      imageMobileUrl = imageMobileUrl.replace(this.getDomain(user), OBS_DOMAIN_KEY)
    }
    if (videoUrl) {
      videoUrl = videoUrl.replace(this.getDomain(user), OBS_DOMAIN_KEY)
    }

    const article = await this.db.article.update({
      where: { id },
      data: {
        title: updateArticleDto.title,
        slug: updateArticleDto.slug,
        summary: updateArticleDto.summary,
        content: updateArticleDto.content?.replace(new RegExp(this.getDomain(user), 'g'), OBS_DOMAIN_KEY),
        imageUrl,
        imageMobileUrl,
        videoUrl,
        status: updateArticleDto.status,
        sort: updateArticleDto.sort,
        seoTitle: updateArticleDto.seoTitle,
        seoKeywords: updateArticleDto.seoKeywords,
        seoDescription: updateArticleDto.seoDescription,
        publishTime: updateArticleDto.publishTime || new Date(),
        updateBy: user.username,
        updateTime: new Date(),
        tags: {
          deleteMany: {},
          create: updateArticleDto.tagIds?.map((tagId) => ({
            tag: { connect: { id: tagId } },
          })),
        },
        categories: {
          deleteMany: {},
          create: updateArticleDto.categoryIds?.map((categoryId) => ({
            category: { connect: { id: categoryId } },
          })),
        },
      },
      include: {
        tags: { include: { tag: true } },
        categories: { include: { category: true } },
      },
    })

    return {
      ...article,
      imageUrl: article.imageUrl ? article.imageUrl.replace(OBS_DOMAIN_KEY, this.getDomain(user)) : null,
      imageMobileUrl: article.imageMobileUrl ? article.imageMobileUrl.replace(OBS_DOMAIN_KEY, this.getDomain(user)) : null,
      videoUrl: article.videoUrl ? article.videoUrl.replace(OBS_DOMAIN_KEY, this.getDomain(user)) : null,
      content: article.content?.replace(new RegExp(OBS_DOMAIN_KEY, 'g'), this.getDomain(user)),
    }
  }

  async remove(id: number, user: JwtUser) {
    await this.db.article.delete({
      where: { id, siteId: user.siteId },
    })

    return { success: true }
  }

  async updateStatus(id: number, updateStatusDto: UpdateArticleStatusDto, user: JwtUser) {
    const { status } = updateStatusDto

    const article = await this.db.article.update({
      where: { id },
      data: {
        status,
        updateBy: user.username,
        updateTime: new Date(),
      },
      include: {
        tags: { include: { tag: true } },
        categories: { include: { category: true } },
      },
    })

    return {
      ...article,
      imageUrl: article.imageUrl ? article.imageUrl.replace(OBS_DOMAIN_KEY, this.getDomain(user)) : null,
      imageMobileUrl: article.imageMobileUrl ? article.imageMobileUrl.replace(OBS_DOMAIN_KEY, this.getDomain(user)) : null,
      videoUrl: article.videoUrl ? article.videoUrl.replace(OBS_DOMAIN_KEY, this.getDomain(user)) : null,
      content: article.content?.replace(new RegExp(OBS_DOMAIN_KEY, 'g'), this.getDomain(user)),
    }
  }
}
