import {
  Body,
  Controller,
  Delete,
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
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { WarehouseQueryDto } from './dto/warehouse-query.dto';
import { WarehouseService } from './warehouse.service';

@ApiTags('warehouses')
@ApiBearerAuth()
@Controller('warehouses')
@UseGuards(AuthGuard)
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles('warehouse.read')
  @ApiOperation({ summary: 'List warehouses' })
  findAll(@Query() query: WarehouseQueryDto) {
    return this.warehouseService.findAll(query);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('warehouse.read')
  @ApiOperation({ summary: 'Get warehouse' })
  findById(@Param('id') id: string) {
    return this.warehouseService.findById(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('warehouse.create')
  @ApiOperation({ summary: 'Create warehouse' })
  create(@Body() dto: CreateWarehouseDto, @Req() req: Request & { user?: any }) {
    return this.warehouseService.create(dto, req.user?.id);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('warehouse.update')
  @ApiOperation({ summary: 'Update warehouse' })
  update(@Param('id') id: string, @Body() dto: UpdateWarehouseDto, @Req() req: Request & { user?: any }) {
    return this.warehouseService.update(id, dto, req.user?.id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('warehouse.delete')
  @ApiOperation({ summary: 'Delete warehouse' })
  remove(@Param('id') id: string, @Req() req: Request & { user?: any }) {
    return this.warehouseService.delete(id, req.user?.id);
  }
}
