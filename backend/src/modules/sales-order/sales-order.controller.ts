import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreateSalesOrderDto } from './dto/create-sales-order.dto';
import { UpdateSalesOrderDto } from './dto/update-sales-order.dto';
import { SalesOrderQueryDto } from './dto/sales-order-query.dto';
import { ShipSalesOrderDto } from './dto/ship-sales-order.dto';
import { SalesOrderService } from './sales-order.service';

@ApiTags('sales-orders')
@ApiBearerAuth()
@Controller('sales-orders')
@UseGuards(AuthGuard)
export class SalesOrderController {
  constructor(private readonly salesOrderService: SalesOrderService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles('sales.read')
  @ApiOperation({ summary: 'List sales orders' })
  @ApiResponse({ status: 200, description: 'Sales orders retrieved successfully' })
  findAll(@Query() query: SalesOrderQueryDto) {
    return this.salesOrderService.findAll(query);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('sales.read')
  @ApiOperation({ summary: 'Get sales order' })
  findOne(@Param('id') id: string) {
    return this.salesOrderService.findById(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('sales.create')
  @ApiOperation({ summary: 'Create sales order' })
  create(@Body() dto: CreateSalesOrderDto, @Req() req: Request & { user?: any }) {
    return this.salesOrderService.create(dto, req.user?.id);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('sales.update')
  @ApiOperation({ summary: 'Update sales order' })
  update(@Param('id') id: string, @Body() dto: UpdateSalesOrderDto, @Req() req: Request & { user?: any }) {
    return this.salesOrderService.update(id, dto, req.user?.id);
  }

  @Post(':id/ship')
  @UseGuards(RolesGuard)
  @Roles('sales.ship')
  @ApiOperation({ summary: 'Ship sales order' })
  ship(@Param('id') id: string, @Body() dto: ShipSalesOrderDto, @Req() req: Request & { user?: any }) {
    return this.salesOrderService.ship(id, req.user?.id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('sales.delete')
  @ApiOperation({ summary: 'Delete sales order' })
  delete(@Param('id') id: string, @Req() req: Request & { user?: any }) {
    return this.salesOrderService.cancel(id, req.user?.id);
  }
}
