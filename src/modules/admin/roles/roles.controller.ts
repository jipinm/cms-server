import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, Query } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { RolesService } from './roles.service'
import { AssignMenusDto, CreateRoleDto, QueryRoleDto, UpdateRoleDto } from './dto/role.dto'
import { RoleVo } from './vo/role.vo'
import { ValidationPipe } from '@core/pipes/validation.pipe'
import { RequestUser } from '@core/decorators/request-user.decorator'
import { ApiResult } from '@common/swagger/api-result-decorator'
import { Permissions } from '@core/decorators/permissions.decorator'

@ApiTags('角色管理')
@Controller('admin/roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @ApiOperation({ summary: '创建角色' })
  @ApiResult(RoleVo)
  @Permissions('roles:create')
  async create(@Body(ValidationPipe) dto: CreateRoleDto, @RequestUser() user): Promise<RoleVo> {
    return this.rolesService.create(dto, user)
  }

  @Put(':id')
  @ApiOperation({ summary: '更新角色' })
  @ApiResult(RoleVo)
  @Permissions('roles:update')
  async update(@Param('id', ParseIntPipe) id: number, @Body(ValidationPipe) dto: UpdateRoleDto, @RequestUser() user) {
    return this.rolesService.update(id, dto, user)
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除角色' })
  @ApiResult(null)
  @Permissions('roles:delete')
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.rolesService.delete(id)
  }

  // 此方法必须放到Get(':id')上面，否则会被拦截
  @Get('list')
  @ApiOperation({ summary: '获取角色列表' })
  @ApiResult(RoleVo, { isArray: true })
  @Permissions('roles:list')
  async findAll(@Query(ValidationPipe) query: QueryRoleDto) {
    return this.rolesService.findAll(query)
  }

  @Get(':id')
  @ApiOperation({ summary: '获取角色详情' })
  @ApiResult(RoleVo)
  @Permissions('roles:read')
  async findById(@Param('id', ParseIntPipe) id: number): Promise<RoleVo> {
    return this.rolesService.findById(id)
  }

  @Patch(':id/menus')
  @ApiOperation({ summary: '分配角色菜单' })
  @ApiResult(null)
  @Permissions('roles:assign')
  async assignMenus(@Param('id', ParseIntPipe) id: number, @Body(ValidationPipe) dto: AssignMenusDto): Promise<void> {
    await this.rolesService.assignMenus(id, dto)
  }
}
