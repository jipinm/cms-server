import { Injectable } from '@nestjs/common'
import { DatabaseService } from '@database/database.service'
import { CreateAdminMenuDto, UpdateAdminMenuDto } from './dto/admin-menu.dto'
import { AdminMenu, MenuType, Prisma } from '@prisma/client'
import { omit } from 'lodash'
import { ListOrder } from '@common/constants/list'

interface MenuWithChildren extends AdminMenu {
  children: MenuWithChildren[]
}

@Injectable()
export class AdminMenusService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(buttonVisible, name?: string) {
    const childrenWhereField: Prisma.AdminMenuWhereInput = {}
    if (buttonVisible === 'false') {
      childrenWhereField.menuType = {
        in: [MenuType.MENU, MenuType.FOLDER],
      }
    }

    if (name) {
      // 返回不是树结构的菜单
      const menus = await this.db.adminMenu.findMany({
        where: {
          name: {
            contains: name,
          },
        },
        include: {
          children: false,
        },
      })
      return menus.map((menu) => {
        return {
          ...menu,
          meta: {
            title: menu.name,
            titleEn: menu.nameEn,
            icon: menu.icon,
            isLink: menu.isLink,
            isIframe: menu.isIframe,
            isKeepAlive: menu.isKeepAlive,
            isAffix: menu.isAffix,
            isHide: menu.isHide,
          },
        }
      })
    }

    // 修改为递归查询所有层级的菜单
    const menus = await this.db.adminMenu.findMany({
      where: {
        parentId: -1,
      },
      include: {
        children: {
          where: childrenWhereField,
          orderBy: { sortOrder: ListOrder.Asc },
          include: {
            children: {
              where: childrenWhereField,
              orderBy: { sortOrder: ListOrder.Asc },
              include: {
                children: {
                  where: childrenWhereField,
                  orderBy: { sortOrder: ListOrder.Asc },
                },
              },
            },
          },
        },
      },
      orderBy: {
        sortOrder: ListOrder.Asc,
      },
    })

    return this.formatMenuTree(menus)
  }

  async create(createMenuDto: CreateAdminMenuDto, user: JwtUser) {
    return this.db.adminMenu.create({
      data: {
        name: createMenuDto.name,
        nameEn: createMenuDto.nameEn,
        path: createMenuDto.path,
        url: createMenuDto.url,
        icon: createMenuDto.icon,
        sortOrder: createMenuDto.sortOrder,
        permission: createMenuDto.permission,
        parentId: createMenuDto.parentId,
        menuType: createMenuDto.menuType,
        isKeepAlive: !!createMenuDto.isKeepAlive,
        isAffix: !!createMenuDto.isAffix,
        isHide: !!createMenuDto.isHide,
        isLink: !!createMenuDto.isLink,
        isIframe: !!createMenuDto.isIframe,
        createBy: user.username,
      },
    })
  }

  async update(updateMenuDto: UpdateAdminMenuDto, user: JwtUser) {
    return this.db.adminMenu.update({
      where: { id: updateMenuDto.id },
      data: {
        nameEn: updateMenuDto.nameEn,
        path: updateMenuDto.path,
        url: updateMenuDto.url,
        name: updateMenuDto.name,
        icon: updateMenuDto.icon,
        sortOrder: updateMenuDto.sortOrder,
        permission: updateMenuDto.permission,
        parentId: updateMenuDto.parentId,
        menuType: updateMenuDto.menuType,
        isKeepAlive: !!updateMenuDto.isKeepAlive,
        isAffix: !!updateMenuDto.isAffix,
        isHide: !!updateMenuDto.isHide,
        isLink: !!updateMenuDto.isLink,
        isIframe: !!updateMenuDto.isIframe,
        updateBy: user.username,
        updateTime: new Date(),
      },
    })
  }

  async remove(id: number) {
    // 检查是否有子菜单
    const hasChildren = await this.db.adminMenu.findFirst({
      where: { parentId: id },
    })

    if (hasChildren) {
      throw new Error('请先删除子菜单')
    }

    await this.db.adminMenu.delete({
      where: { id },
    })
    return { success: true }
  }

  async getRoleMenuIds(roleId: number) {
    const role = await this.db.role.findUnique({ where: { id: roleId }, include: { roleMenu: true } })
    if (!role?.roleMenu?.menuIds) {
      return []
    }
    return role.roleMenu.menuIds.split(',').map(Number)
  }

  // 获取用户菜单权限
  async getUserMenus(userId: number) {
    const userRoles = await this.db.userRole.findMany({
      where: { userId },
      select: {
        role: {
          select: {
            roleMenu: {
              select: {
                menuIds: true,
              },
            },
          },
        },
      },
    })

    const userMenuIds = userRoles
      .map((ur) => {
        return ur.role.roleMenu.menuIds.split(',').map(Number)
      })
      .flat()

    // 修改为递归查询所有层级的菜单
    const allMenus = await this.db.adminMenu.findMany({
      orderBy: { sortOrder: ListOrder.Asc },
      where: {
        AND: [{ parentId: -1 }, { id: { in: userMenuIds } }],
      },
      include: {
        children: {
          where: {
            id: {
              in: userMenuIds,
            },
            menuType: {
              in: [MenuType.MENU, MenuType.FOLDER],
            },
          },
          orderBy: { sortOrder: ListOrder.Asc },
          include: {
            children: {
              where: {
                id: {
                  in: userMenuIds,
                },
                menuType: {
                  in: [MenuType.MENU, MenuType.FOLDER],
                },
              },
              orderBy: { sortOrder: ListOrder.Asc },
              include: {
                children: {
                  where: {
                    id: {
                      in: userMenuIds,
                    },
                    menuType: {
                      in: [MenuType.MENU, MenuType.FOLDER],
                    },
                  },
                  orderBy: { sortOrder: ListOrder.Asc },
                },
              },
            },
          },
        },
      },
    })

    return this.formatMenuTree(allMenus)
  }

  // 获取菜单详情
  async findOne(id: number) {
    const menu = await this.db.adminMenu.findUnique({
      where: { id },
    })

    return {
      ...menu,
      isKeepAlive: +menu.isKeepAlive,
      isAffix: +menu.isAffix,
      isHide: +menu.isHide,
      isLink: +menu.isLink,
      isIframe: +menu.isIframe,
    }
  }

  // 格式化菜单树,区分按钮和菜单
  private formatMenuTree(menus: MenuWithChildren[]) {
    return menus.map((menu) => {
      return {
        ...omit(menu, ['isLink', 'isIframe', 'isKeepAlive', 'icon', 'isAffix', 'isHide']),
        meta: {
          isLink: menu.isLink,
          isIframe: menu.isIframe,
          isKeepAlive: menu.isKeepAlive,
          icon: menu.icon,
          isAffix: menu.isAffix,
          title: menu.name,
          titleEn: menu.nameEn,
          isHide: menu.isHide,
        },
        children: menu.children && menu.children.length > 0 ? this.formatMenuTree(menu.children) : undefined,
      }
    })
  }
}
