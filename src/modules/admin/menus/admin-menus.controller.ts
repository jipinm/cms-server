import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, Req } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { AdminMenusService } from './admin-menus.service'
import { RequestUser } from '@core/decorators/request-user.decorator'
import { CreateAdminMenuDto, UpdateAdminMenuDto } from './dto/admin-menu.dto'
import { Permissions } from '@core/decorators/permissions.decorator'
import { ApiResult, SuccessVo } from '@common/swagger/api-result-decorator'
import { ValidationPipe } from '@core/pipes/validation.pipe'
import { AdminMenuVo } from './vo/admin-menu.vo'

@ApiTags('后台菜单管理')
@Controller('admin/menus')
export class AdminMenusController {
  constructor(private readonly adminMenusService: AdminMenusService) {}

  @Get()
  @ApiOperation({ summary: '获取菜单树' })
  @Permissions('menu:list')
  @ApiResult(AdminMenuVo, { isArray: true })
  async findAll(@Query('buttonVisible') buttonVisible, @Query('name') name?: string) {
    return this.adminMenusService.findAll(buttonVisible, name)
  }

  @Get('role-menu-ids/:roleId')
  @ApiOperation({ summary: '获取角色所有菜单ID' })
  @ApiResult(Number, { isArray: true })
  @Permissions('menu:read')
  async getRoleMenuIds(@Param('roleId', ParseIntPipe) roleId: number) {
    return this.adminMenusService.getRoleMenuIds(roleId)
  }

  @Get('user-menus')
  @ApiOperation({ summary: '获取用户菜单权限' })
  @ApiResult(AdminMenuVo, { isArray: true })
  // @Permissions('menu:read')
  async getUserMenus(@Req() req) {
    const userId = req.user.id
    return this.adminMenusService.getUserMenus(userId)
  }

  @Get(':id')
  @ApiOperation({ summary: '获取菜单详情' })
  @Permissions('menu:read')
  @ApiResult(AdminMenuVo)
  async findOne(@Param('id') id: number) {
    return this.adminMenusService.findOne(id)
  }

  @Post()
  @ApiOperation({ summary: '创建菜单' })
  @Permissions('menu:create')
  @ApiResult(AdminMenuVo)
  async create(@Body(ValidationPipe) createMenuDto: CreateAdminMenuDto, @RequestUser() user: JwtUser) {
    return this.adminMenusService.create(createMenuDto, user)
  }

  @Put()
  @ApiOperation({ summary: '更新菜单' })
  @Permissions('menu:update')
  @ApiResult(AdminMenuVo)
  async update(@Body(ValidationPipe) updateMenuDto: UpdateAdminMenuDto, @RequestUser() user: JwtUser) {
    return this.adminMenusService.update(updateMenuDto, user)
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除菜单' })
  @Permissions('menu:delete')
  @ApiResult(SuccessVo)
  async remove(@Param('id') id: number) {
    return this.adminMenusService.remove(id)
  }
}
