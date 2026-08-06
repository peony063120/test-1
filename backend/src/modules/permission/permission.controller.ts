import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { PermissionQueryDto } from './dto/permission-query.dto';
import { PermissionService } from './permission.service';

@ApiTags('permissions')
@ApiBearerAuth()
@Controller('permissions')
@UseGuards(AuthGuard)
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles('permission.manage')
  @ApiOperation({ summary: 'List permissions' })
  findAll(@Query() query: PermissionQueryDto) {
    return this.permissionService.findAll(query);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('permission.manage')
  @ApiOperation({ summary: 'Create permission' })
  create(@Body() dto: CreatePermissionDto, @Req() req: Request & { user?: any }) {
    return this.permissionService.create(dto, req.user?.id);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('permission.manage')
  @ApiOperation({ summary: 'Get permission by id' })
  findOne(@Param('id') id: string) {
    return this.permissionService.findById(id);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('permission.manage')
  @ApiOperation({ summary: 'Update permission' })
  update(@Param('id') id: string, @Body() dto: UpdatePermissionDto, @Req() req: Request & { user?: any }) {
    return this.permissionService.update(id, dto, req.user?.id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('permission.manage')
  @ApiOperation({ summary: 'Delete permission' })
  delete(@Param('id') id: string, @Req() req: Request & { user?: any }) {
    return this.permissionService.delete(id, req.user?.id);
  }
}
