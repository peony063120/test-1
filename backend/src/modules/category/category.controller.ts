import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryQueryDto } from './dto/category-query.dto';
import { CategoryService } from './category.service';

@ApiTags('categories')
@ApiBearerAuth()
@Controller('categories')
@UseGuards(AuthGuard)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles('category.read')
  @ApiOperation({ summary: 'List categories' })
  @ApiResponse({ status: 200, description: 'Categories retrieved successfully' })
  findAll(@Query() query: CategoryQueryDto) {
    return this.categoryService.findAll(query);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('category.read')
  @ApiOperation({ summary: 'Get category' })
  findOne(@Param('id') id: string) {
    return this.categoryService.findById(id);
  }

  @Get(':id/children')
  @UseGuards(RolesGuard)
  @Roles('category.read')
  @ApiOperation({ summary: 'Get direct children' })
  getChildren(@Param('id') id: string) {
    return this.categoryService.getChildren(id);
  }

  @Get(':id/parents')
  @UseGuards(RolesGuard)
  @Roles('category.read')
  @ApiOperation({ summary: 'Get ancestors' })
  getParents(@Param('id') id: string) {
    return this.categoryService.getParents(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('category.create')
  @ApiOperation({ summary: 'Create category' })
  create(@Body() dto: CreateCategoryDto, @Req() req: Request & { user?: any }) {
    return this.categoryService.create(dto, req.user?.id);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('category.update')
  @ApiOperation({ summary: 'Update category' })
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto, @Req() req: Request & { user?: any }) {
    return this.categoryService.update(id, dto, req.user?.id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('category.delete')
  @ApiOperation({ summary: 'Delete category' })
  delete(@Param('id') id: string, @Req() req: Request & { user?: any }) {
    return this.categoryService.delete(id, req.user?.id);
  }
}
