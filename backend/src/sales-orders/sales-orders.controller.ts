import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SalesOrdersService } from './sales-orders.service';

@ApiTags('sales-orders')
@Controller('sales-orders')
export class SalesOrdersController {
  constructor(private readonly salesOrdersService: SalesOrdersService) {}

  @Get()
  @ApiOperation({ summary: 'List sales orders' })
  findAll() {
    return this.salesOrdersService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Create sales order' })
  create(@Body() data: any) {
    return this.salesOrdersService.create(data);
  }
}
