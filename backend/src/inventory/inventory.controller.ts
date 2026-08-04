import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';

@ApiTags('inventory')
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @ApiOperation({ summary: 'List inventory' })
  findAll() {
    return this.inventoryService.findAll();
  }

  @Patch(':id/adjust')
  @ApiOperation({ summary: 'Adjust inventory quantity' })
  adjust(@Param('id') id: string, @Body('quantity') quantity: number) {
    return this.inventoryService.adjust(id, quantity);
  }
}
