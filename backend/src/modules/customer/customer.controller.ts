import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomerQueryDto } from './dto/customer-query.dto';
import { CustomerService } from './customer.service';

@ApiTags('customers')
@ApiBearerAuth()
@Controller('customers')
@UseGuards(AuthGuard)
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles('customer.read')
  @ApiOperation({ summary: 'List customers' })
  @ApiResponse({ status: 200, description: 'Customers retrieved successfully' })
  findAll(@Query() query: CustomerQueryDto) {
    return this.customerService.findAll(query);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('customer.read')
  @ApiOperation({ summary: 'Get customer' })
  findOne(@Param('id') id: string) {
    return this.customerService.findById(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('customer.create')
  @ApiOperation({ summary: 'Create customer' })
  create(@Body() dto: CreateCustomerDto, @Req() req: Request & { user?: any }) {
    return this.customerService.create(dto, req.user?.id);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('customer.update')
  @ApiOperation({ summary: 'Update customer' })
  update(@Param('id') id: string, @Body() dto: UpdateCustomerDto, @Req() req: Request & { user?: any }) {
    return this.customerService.update(id, dto, req.user?.id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('customer.delete')
  @ApiOperation({ summary: 'Delete customer' })
  delete(@Param('id') id: string, @Req() req: Request & { user?: any }) {
    return this.customerService.delete(id, req.user?.id);
  }
}
