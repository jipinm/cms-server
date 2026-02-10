import { BadRequestException, Injectable } from '@nestjs/common'
import {
  CreateDictionaryItemDto,
  DictionaryItemQuery,
  QueryDictionaryItemDto,
  UpdateDictionaryItemDto,
} from './dto/dictionary-item.dto'
import { DictionaryItemVo } from './vo/dictionary-item.vo'
import { DatabaseService } from '@database/database.service'
@Injectable()
export class DictionaryItemService {
  constructor(private readonly db: DatabaseService) {}

  async create(siteId: number, dto: CreateDictionaryItemDto) {
    // 检查字典类型是否存在且属于当前站点
    const dictType = await this.db.dictionaryType.findFirst({
      where: { id: dto.dictId, siteId },
    })
    if (!dictType) {
      throw new BadRequestException('字典类型不存在')
    }

    const { label, description, sortOrder, remarks, value } = dto

    // label或者value都不能重复
    const existingItem = await this.db.dictionaryItem.findFirst({
      where: {
        OR: [{ label }, { value }],
      },
    })

    if (existingItem) {
      throw new BadRequestException('字典项标签或值已存在')
    }

    return this.db.dictionaryItem.create({
      data: {
        label,
        description,
        sortOrder,
        remarks,
        value,
        dictId: dictType.id,
        dictType: dictType.dictType,
      },
    })
  }

  async update(id: number, dto: UpdateDictionaryItemDto) {
    const { label, description, sortOrder, remarks, value } = dto

    return this.db.dictionaryItem.update({
      where: { id },
      data: {
        label,
        description,
        sortOrder,
        remarks,
        value,
      },
    })
  }

  async delete(id: number) {
    return this.db.dictionaryItem.delete({
      where: { id },
    })
  }

  async findById(id: number) {
    return this.db.dictionaryItem.findUnique({
      where: { id },
    })
  }

  async findByLabelOrValue(query: QueryDictionaryItemDto) {
    console.log(query)
    const { dictId, label, value } = query

    const where = {
      dictId,
      ...(label && { label }),
      ...(value && { value }),
    }

    return this.db.dictionaryItem.findFirst({
      where,
    })
  }

  async findAll(siteId: number, query: DictionaryItemQuery) {
    const { current, size, dictId, dictType, label } = query

    const where = {
      ...(dictId && { dictId }),
      ...(dictType && { dictType }),
      ...(label && { label: { contains: label } }),
      dictTypeRef: {
        siteId,
      },
    }

    const [total, items] = await Promise.all([
      this.db.dictionaryItem.count({ where }),
      this.db.dictionaryItem.findMany({
        where,
        skip: (current - 1) * size,
        take: size,
        orderBy: {
          sortOrder: 'asc',
        },
      }),
    ])

    return { total, items, current, size }
  }
}
