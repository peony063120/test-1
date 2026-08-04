import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AdjustInventoryDto } from './dto/adjust-inventory.dto';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { InventoryQueryDto } from './dto/inventory-query.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { InventoryService } from './inventory.service';

@ApiTags('inventories')
@ApiBearerAuth()
@Controller('inventories')
@UseGuards(AuthGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles('inventory.read')
  @ApiOperation({ summary: 'List inventories' })
  findAll(@Query() query: InventoryQueryDto) {
    return this.inventoryService.findAll(query);
  }

  @Get('low-stock')
  @UseGuards(RolesGuard)
  @Roles('inventory.read')
  @ApiOperation({ summary: 'Get low stock inventories' })
  getLowStock() {
    return this.inventoryService.getLowStock();
  }

  @Get('over-stock')
  @UseGuards(RolesGuard)
  @Roles('inventory.read')
  @ApiOperation({ summary: 'Get over stock inventories' })
  getOverStock() {
    return this.inventoryService.getOverStock();
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('inventory.read')
  @ApiOperation({ summary: 'Get inventory' })
  findById(@Param('id') id: string) {
    return this.inventoryService.findById(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('inventory.create')
  @ApiOperation({ summary: 'Create inventory' })
  create(@Body() dto: CreateInventoryDto, @Req() req: Request & { user?: any }) {
    return this.inventoryService.create(dto, req.user?.id);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('inventory.update')
  @ApiOperation({ summary: 'Update inventory thresholds' })
  update(@Param('id') id: string, @Body() dto: UpdateInventoryDto, @Req() req: Request & { user?: any }) {
    return this.inventoryService.update(id, dto, req.user?.id);
  }

  @Put(':id/adjust')
  @UseGuards(RolesGuard)
  @Roles('inventory.adjust')
  @ApiOperation({ summary: 'Adjust stock' })
  adjust(@Param('id') id: string, @Body() dto: AdjustInventoryDto, @Req() req: Request & { user?: any }) {
    return this.inventoryService.adjustStockById(id, dto.quantity, dto.reason, req.user?.id);
  }
}
