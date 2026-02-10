import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { DatabaseService } from '@database/database.service'
import { AssignMenusDto, CreateRoleDto, QueryRoleDto, UpdateRoleDto } from './dto/role.dto'
import { RoleVo } from './vo/role.vo'
import { MenuType } from '@prisma/client'
import { RedisService } from '@database/redis.service'

@Injectable()
export class RolesService {
  constructor(
    private readonly db: DatabaseService,
    private readonly redisService: RedisService,
  ) {}

  async create(dto: CreateRoleDto, user: JwtUser) {
    // 检查编码是否已存在
    const exists = await this.db.role.findUnique({
      where: { code: dto.code },
    })
    if (exists) {
      throw new BadRequestException('角色编码已存在')
    }

    const role = await this.db.role.create({
      data: {
        name: dto.name,
        code: dto.code,
        description: dto.description,
        createBy: user.username,
      },
    })

    return this.toVo(role)
  }

  async update(id: number, dto: UpdateRoleDto, user: JwtUser): Promise<RoleVo> {
    const role = await this.db.role.findUnique({ where: { id } })
    if (!role) {
      throw new NotFoundException('角色不存在')
    }

    const updated = await this.db.role.update({
      where: { id },
      data: {
        name: dto.name,
        code: dto.code,
        description: dto.description,
        updateTime: new Date(),
        updateBy: user.username,
      },
    })

    return this.toVo(updated)
  }

  async delete(id: number): Promise<void> {
    const role = await this.db.role.findUnique({ where: { id } })
    if (!role) {
      throw new NotFoundException('角色不存在')
    }

    await this.db.role.delete({ where: { id } })
  }

  async findById(id: number): Promise<RoleVo> {
    const role = await this.db.role.findUnique({
      where: { id },
      include: {
        roleMenu: true,
      },
    })
    if (!role) {
      throw new NotFoundException('角色不存在')
    }

    return this.toVo(role)
  }

  async findAll(query: QueryRoleDto) {
    const { current = 1, size = 10, name, code } = query || {}

    const where = {
      AND: [name ? { name: { contains: name } } : {}, code ? { code: { contains: code } } : {}],
    }

    const [items, total] = await Promise.all([
      this.db.role.findMany({
        where,
        skip: (current - 1) * size,
        take: size,
        include: {
          roleMenu: true,
        },
      }),
      this.db.role.count({ where }),
    ])

    return {
      items: items.map((role) => this.toVo(role)),
      total,
      current,
      size,
    }
  }

  async assignMenus(id: number, dto: AssignMenusDto): Promise<void> {
    const role = await this.db.role.findUnique({ where: { id } })
    if (!role) {
      throw new NotFoundException('角色不存在')
    }

    // 更新或创建角色菜单关联
    await this.db.roleMenu.upsert({
      where: { roleId: id },
      create: {
        roleId: id,
        menuIds: dto.menuIds.join(','),
      },
      update: {
        menuIds: dto.menuIds.join(','),
      },
    })

    // 保存当前角色的按钮权限到redis
    const menuIds = dto.menuIds
    const buttons = await this.db.adminMenu.findMany({
      where: { id: { in: menuIds.map(Number) }, menuType: MenuType.BUTTON },
    })
    const permissions = buttons.map((button) => button.permission)
    await this.redisService.setRolePermissions(Number(role.id), permissions)
  }

  private toVo(role: any): RoleVo {
    return {
      id: role.id,
      name: role.name,
      code: role.code,
      description: role.description,
      createTime: role.createTime,
      updateTime: role.updateTime,
      createBy: role.createBy,
      updateBy: role.updateBy,
      menuIds: role.roleMenu?.menuIds?.split(',').map(Number) || [],
    }
  }
}
