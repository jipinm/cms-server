import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { DatabaseService } from '@database/database.service'
import { CreateTagDto, UpdateTagDto, QueryTagDto } from './dto/tag.dto'
import { Prisma } from '@prisma/client'
import { ListOrder } from '@common/constants/list'
const TAG_SELECT = Prisma.validator<Prisma.ArticleTagSelect>()({
  id: true,
  name: true,
  slug: true,
  createBy: true,
  createTime: true,
  updateBy: true,
  updateTime: true,
})

@Injectable()
export class TagsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createTagDto: CreateTagDto, user: JwtUser) {
    // 检查标签slug是否唯一
    const exists = await this.databaseService.articleTag.findFirst({
      where: {
        siteId: user.siteId,
        slug: createTagDto.slug,
      },
    })

    if (exists) {
      throw new HttpException('Tag slug already exists', HttpStatus.BAD_REQUEST)
    }

    return this.databaseService.articleTag.create({
      data: {
        ...createTagDto,
        site: {
          connect: { id: user.siteId },
        },
        createBy: user.username,
      },
      select: TAG_SELECT,
    })
  }

  async findAll(siteId: number, query: QueryTagDto) {
    const { current, size, name, slug } = query
    const skip = (current - 1) * size

    const where: Prisma.ArticleTagWhereInput = {
      siteId,
    }
    if (name) where.name = { contains: name }
    if (slug) where.slug = { contains: slug }

    const [total, items] = await Promise.all([
      this.databaseService.articleTag.count({ where }),
      this.databaseService.articleTag.findMany({
        where,
        select: TAG_SELECT,
        orderBy: { createTime: ListOrder.Desc },
        skip,
        take: size,
      }),
    ])

    return { items, total, current, size }
  }

  async update(id: number, updateTagDto: UpdateTagDto, user: JwtUser) {
    const tag = await this.databaseService.articleTag.findFirst({
      where: {
        id,
        siteId: user.siteId,
      },
    })

    if (!tag) {
      throw new HttpException('Tag not found', HttpStatus.NOT_FOUND)
    }

    // 检查标签slug是否唯一
    if (updateTagDto.slug) {
      const exists = await this.databaseService.articleTag.findFirst({
        where: {
          siteId: user.siteId,
          slug: updateTagDto.slug,
          id: { not: id },
        },
      })

      if (exists) {
        throw new HttpException('Tag slug already exists', HttpStatus.BAD_REQUEST)
      }
    }

    return this.databaseService.articleTag.update({
      where: { id },
      data: {
        ...updateTagDto,
        updateBy: user.username,
        updateTime: new Date(),
      },
      select: TAG_SELECT,
    })
  }

  async remove(id: number, user: JwtUser) {
    const tag = await this.databaseService.articleTag.findFirst({
      where: {
        id,
        siteId: user.siteId,
      },
      include: {
        articles: true,
      },
    })

    if (!tag) {
      throw new HttpException('标签不存在', HttpStatus.NOT_FOUND)
    }

    if (tag.articles.length > 0) {
      throw new HttpException('标签下有文章，不能删除', HttpStatus.BAD_REQUEST)
    }

    await this.databaseService.articleTag.delete({
      where: { id },
    })

    return { success: true }
  }
}
