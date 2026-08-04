import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PurchaseOrdersService } from './purchase-orders.service';

@ApiTags('purchase-orders')
@Controller('purchase-orders')
export class PurchaseOrdersController {
  constructor(private readonly purchaseOrdersService: PurchaseOrdersService) {}

  @Get()
  @ApiOperation({ summary: 'List purchase orders' })
  findAll() {
    return this.purchaseOrdersService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Create purchase order' })
  create(@Body() data: any) {
    return this.purchaseOrdersService.create(data);
  }
}
