import { ForbiddenException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common'
import { DatabaseService } from '@database/database.service'
import { CreateCategoryDto, QueryCategoryDto, UpdateCategoryDto } from './dto'
import { Prisma } from '@prisma/client'
import { ListOrder } from '@common/constants/list'

const CATEGORY_SELECT = Prisma.validator<Prisma.ArticleCategorySelect>()({
  id: true,
  siteId: true,
  name: true,
  slug: true,
  description: true,
  seoTitle: true,
  seoKeywords: true,
  seoDescription: true,
  site: {
    select: {
      id: true,
      name: true,
    },
  },
})

@Injectable()
export class CategoriesService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createCategoryDto: CreateCategoryDto, user: JwtUser) {
    // 检查同级分类下slug是否唯一
    const exists = await this.databaseService.articleCategory.findFirst({
      where: {
        slug: createCategoryDto.slug,
        siteId: user.siteId,
      },
    })

    if (exists) {
      throw new HttpException('Category slug already exists', HttpStatus.BAD_REQUEST)
    }

    const createData = {
      name: createCategoryDto.name,
      slug: createCategoryDto.slug,
      description: createCategoryDto.description,
      seoTitle: createCategoryDto.seoTitle,
      seoKeywords: createCategoryDto.seoKeywords,
      seoDescription: createCategoryDto.seoDescription,
      siteId: user.siteId,
      createBy: user.username,
    }

    return this.databaseService.articleCategory.create({
      data: createData,
      select: CATEGORY_SELECT,
    })
  }

  async findAll(query: QueryCategoryDto, user: JwtUser) {
    const { current, size, slug, name } = query
    const skip = (current - 1) * size
    const where: Prisma.ArticleCategoryWhereInput = {
      siteId: user.siteId,
      ...(slug && {
        slug,
      }),
      ...(name && {
        name: { contains: name },
      }),
    }
    const [total, items] = await Promise.all([
      this.databaseService.articleCategory.count({ where }),
      this.databaseService.articleCategory.findMany({
        where,
        skip,
        take: size,
        orderBy: { id: ListOrder.Desc },
        select: CATEGORY_SELECT,
      }),
    ])
    return {
      items: items.map((item) => ({
        ...item,
        siteName: item.site?.name,
      })),
      total,
      current,
      size,
    }
  }

  async findOne(id: number, user: JwtUser) {
    const category = await this.databaseService.articleCategory.findFirst({
      where: {
        id,
        siteId: user.siteId,
      },
      select: {
        ...CATEGORY_SELECT,
      },
    })

    if (!category) {
      throw new HttpException('Category not found', HttpStatus.NOT_FOUND)
    }

    return category
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto, user: JwtUser) {
    const category = await this.databaseService.articleCategory.findFirst({
      where: {
        id,
        siteId: user.siteId,
      },
    })

    if (!category) {
      throw new HttpException('Category not found', HttpStatus.NOT_FOUND)
    }

    // 检查同级分类下slug是否唯一
    if (updateCategoryDto.slug) {
      const exists = await this.databaseService.articleCategory.findFirst({
        where: {
          slug: updateCategoryDto.slug,
          id: { not: id },
          siteId: user.siteId,
        },
      })

      if (exists) {
        throw new HttpException('Category slug already exists', HttpStatus.BAD_REQUEST)
      }
    }

    return this.databaseService.articleCategory.update({
      where: { id },
      data: updateCategoryDto,
      select: CATEGORY_SELECT,
    })
  }

  async remove(id: number, user: JwtUser) {
    const category = await this.databaseService.articleCategory.findFirst({
      where: {
        id,
        siteId: user.siteId,
      },
    })

    if (!category) {
      throw new HttpException('Category not found', HttpStatus.NOT_FOUND)
    }

    // 检查分类下是否有文章
    const articleCount = await this.databaseService.article.count({
      where: {
        categories: {
          some: {
            categoryId: id,
          },
        },
      },
    })

    if (articleCount > 0) {
      throw new HttpException('分类下有文章，不能删除', HttpStatus.BAD_REQUEST)
    }

    await this.databaseService.articleCategory.delete({
      where: { id },
    })

    return { success: true }
  }
}
