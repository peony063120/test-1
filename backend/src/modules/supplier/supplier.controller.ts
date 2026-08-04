import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { SupplierQueryDto } from './dto/supplier-query.dto';
import { SupplierService } from './supplier.service';

@ApiTags('suppliers')
@ApiBearerAuth()
@Controller('suppliers')
@UseGuards(AuthGuard)
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles('supplier.read')
  @ApiOperation({ summary: 'List suppliers' })
  @ApiResponse({ status: 200, description: 'Suppliers retrieved successfully' })
  findAll(@Query() query: SupplierQueryDto) {
    return this.supplierService.findAll(query);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('supplier.read')
  @ApiOperation({ summary: 'Get supplier' })
  findOne(@Param('id') id: string) {
    return this.supplierService.findById(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('supplier.create')
  @ApiOperation({ summary: 'Create supplier' })
  create(@Body() dto: CreateSupplierDto, @Req() req: Request & { user?: any }) {
    return this.supplierService.create(dto, req.user?.id);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('supplier.update')
  @ApiOperation({ summary: 'Update supplier' })
  update(@Param('id') id: string, @Body() dto: UpdateSupplierDto, @Req() req: Request & { user?: any }) {
    return this.supplierService.update(id, dto, req.user?.id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('supplier.delete')
  @ApiOperation({ summary: 'Delete supplier' })
  delete(@Param('id') id: string, @Req() req: Request & { user?: any }) {
    return this.supplierService.delete(id, req.user?.id);
  }
}
