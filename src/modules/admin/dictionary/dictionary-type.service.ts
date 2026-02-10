import { BadRequestException, Injectable } from '@nestjs/common'
import { DatabaseService } from '@database/database.service'
import { CreateDictionaryTypeDto, DictionaryTypeQuery, UpdateDictionaryTypeDto } from './dto/dictionary-type.dto'

@Injectable()
export class DictionaryTypeService {
  constructor(private readonly db: DatabaseService) {}

  async create(siteId: number, dto: CreateDictionaryTypeDto) {
    const { systemFlag, dictType, description, remarks } = dto
    const dict = await this.db.dictionaryType.findFirst({
      where: {
        dictType,
        siteId,
      },
    })
    if (dict) {
      throw new BadRequestException('字典类型已存在')
    }
    return this.db.dictionaryType.create({
      data: {
        systemFlag,
        dictType,
        description,
        remarks,
        siteId,
      },
    })
  }

  async update(id: number, dto: UpdateDictionaryTypeDto) {
    // 系统字典不能删除
    const dictionaryType = await this.db.dictionaryType.findUnique({
      where: { id },
    })
    if (dictionaryType.systemFlag === 1) {
      throw new Error('系统字典不能删除')
    }
    const { systemFlag, description, remarks } = dto
    return this.db.dictionaryType.update({
      where: { id },
      data: {
        systemFlag,
        description,
        remarks,
      },
    })
  }

  async delete(id: number) {
    return this.db.dictionaryType.delete({
      where: { id },
      include: {
        items: true,
      },
    })
  }

  async findById(id: number) {
    return this.db.dictionaryType.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
    })
  }

  async findAll(siteId: number, query: DictionaryTypeQuery) {
    const { keyword } = query

    const where = {
      siteId,
      ...(keyword && { OR: [{ dictType: { contains: keyword } }, { description: { contains: keyword } }] }),
    }

    return this.db.dictionaryType.findMany({
      where,
    })
  }
}
