import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { PurchaseOrderQueryDto } from './dto/purchase-order-query.dto';
import { ApprovePurchaseOrderDto } from './dto/approve-purchase-order.dto';
import { ReceivePurchaseOrderDto } from './dto/receive-purchase-order.dto';
import { PurchaseOrderService } from './purchase-order.service';

@ApiTags('purchase-orders')
@ApiBearerAuth()
@Controller('purchase-orders')
@UseGuards(AuthGuard)
export class PurchaseOrderController {
  constructor(private readonly purchaseOrderService: PurchaseOrderService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles('purchase.read')
  @ApiOperation({ summary: 'List purchase orders' })
  @ApiResponse({ status: 200, description: 'Purchase orders retrieved successfully' })
  findAll(@Query() query: PurchaseOrderQueryDto) {
    return this.purchaseOrderService.findAll(query);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('purchase.read')
  @ApiOperation({ summary: 'Get purchase order' })
  findOne(@Param('id') id: string) {
    return this.purchaseOrderService.findById(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('purchase.create')
  @ApiOperation({ summary: 'Create purchase order' })
  create(@Body() dto: CreatePurchaseOrderDto, @Req() req: Request & { user?: any }) {
    return this.purchaseOrderService.create(dto, req.user?.id);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('purchase.update')
  @ApiOperation({ summary: 'Update purchase order' })
  update(@Param('id') id: string, @Body() dto: UpdatePurchaseOrderDto, @Req() req: Request & { user?: any }) {
    return this.purchaseOrderService.update(id, dto, req.user?.id);
  }

  @Put(':id/approve')
  @UseGuards(RolesGuard)
  @Roles('purchase.approve')
  @ApiOperation({ summary: 'Approve purchase order' })
  approve(@Param('id') id: string, @Body() dto: ApprovePurchaseOrderDto, @Req() req: Request & { user?: any }) {
    return this.purchaseOrderService.approve(id, req.user?.id, dto);
  }

  @Post(':id/receive')
  @UseGuards(RolesGuard)
  @Roles('purchase.receive')
  @ApiOperation({ summary: 'Receive purchase order into inventory' })
  receive(@Param('id') id: string, @Body() dto: ReceivePurchaseOrderDto, @Req() req: Request & { user?: any }) {
    return this.purchaseOrderService.receive(id, req.user?.id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('purchase.delete')
  @ApiOperation({ summary: 'Delete purchase order' })
  delete(@Param('id') id: string, @Req() req: Request & { user?: any }) {
    return this.purchaseOrderService.cancel(id, req.user?.id);
  }
}
