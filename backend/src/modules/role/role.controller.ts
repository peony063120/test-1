import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleQueryDto } from './dto/role-query.dto';
import { RoleService } from './role.service';

@ApiTags('roles')
@ApiBearerAuth()
@Controller('roles')
@UseGuards(AuthGuard)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles('role.manage')
  @ApiOperation({ summary: 'List roles' })
  findAll(@Query() query: RoleQueryDto) {
    return this.roleService.findAll(query);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('role.manage')
  @ApiOperation({ summary: 'Create role' })
  create(@Body() dto: CreateRoleDto, @Req() req: Request & { user?: any }) {
    return this.roleService.create(dto, req.user?.id);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('role.manage')
  @ApiOperation({ summary: 'Get role by id' })
  findOne(@Param('id') id: string) {
    return this.roleService.findById(id);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('role.manage')
  @ApiOperation({ summary: 'Update role' })
  update(@Param('id') id: string, @Body() dto: UpdateRoleDto, @Req() req: Request & { user?: any }) {
    return this.roleService.update(id, dto, req.user?.id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('role.manage')
  @ApiOperation({ summary: 'Delete role' })
  delete(@Param('id') id: string, @Req() req: Request & { user?: any }) {
    return this.roleService.delete(id, req.user?.id);
  }

  @Post(':id/permissions')
  @UseGuards(RolesGuard)
  @Roles('role.manage')
  @ApiOperation({ summary: 'Assign permissions to role' })
  assignPermissions(@Param('id') id: string, @Body('permissionIds') permissionIds: string[], @Req() req: Request & { user?: any }) {
    return this.roleService.assignPermissions(id, permissionIds, req.user?.id);
  }

  @Delete(':id/permissions/:permissionId')
  @UseGuards(RolesGuard)
  @Roles('role.manage')
  @ApiOperation({ summary: 'Remove permission from role' })
  removePermission(@Param('id') id: string, @Param('permissionId') permissionId: string, @Req() req: Request & { user?: any }) {
    return this.roleService.removePermission(id, permissionId, req.user?.id);
  }
}
