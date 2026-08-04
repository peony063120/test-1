import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { UserService } from './user.service';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(AuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'List users' })
  findAll(@Query() query: UserQueryDto) {
    return this.userService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by id' })
  async findOne(@Param('id') id: string, @Req() req: Request & { user?: any }) {
    if (req.user?.id !== id && !req.user?.roles?.includes('admin')) {
      throw new Error('Access denied');
    }
    return this.userService.findById(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Create user' })
  create(@Body() dto: CreateUserDto, @Req() req: Request & { user?: any }) {
    return this.userService.create(dto, req.user?.id);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update user' })
  update(@Param('id') id: string, @Body() dto: UpdateUserDto, @Req() req: Request & { user?: any }) {
    return this.userService.update(id, dto, req.user?.id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Soft delete user' })
  delete(@Param('id') id: string, @Req() req: Request & { user?: any }) {
    return this.userService.delete(id, req.user?.id);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Change user status' })
  changeStatus(@Param('id') id: string, @Body('status') status: string, @Req() req: Request & { user?: any }) {
    return this.userService.changeStatus(id, status, req.user?.id);
  }

  @Post(':id/roles')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Assign roles to user' })
  assignRoles(@Param('id') id: string, @Body('roleIds') roleIds: string[], @Req() req: Request & { user?: any }) {
    return this.userService.assignRoles(id, roleIds, req.user?.id);
  }
}
