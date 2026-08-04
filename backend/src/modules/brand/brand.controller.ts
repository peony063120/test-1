import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { BrandQueryDto } from './dto/brand-query.dto';
import { BrandService } from './brand.service';

@ApiTags('brands')
@ApiBearerAuth()
@Controller('brands')
@UseGuards(AuthGuard)
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles('brand.read')
  @ApiOperation({ summary: 'List brands' })
  @ApiResponse({ status: 200, description: 'Brands retrieved successfully' })
  findAll(@Query() query: BrandQueryDto) {
    return this.brandService.findAll(query);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('brand.read')
  @ApiOperation({ summary: 'Get brand' })
  findOne(@Param('id') id: string) {
    return this.brandService.findById(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('brand.create')
  @ApiOperation({ summary: 'Create brand' })
  create(@Body() dto: CreateBrandDto, @Req() req: Request & { user?: any }) {
    return this.brandService.create(dto, req.user?.id);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('brand.update')
  @ApiOperation({ summary: 'Update brand' })
  update(@Param('id') id: string, @Body() dto: UpdateBrandDto, @Req() req: Request & { user?: any }) {
    return this.brandService.update(id, dto, req.user?.id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('brand.delete')
  @ApiOperation({ summary: 'Delete brand' })
  delete(@Param('id') id: string, @Req() req: Request & { user?: any }) {
    return this.brandService.delete(id, req.user?.id);
  }
}
