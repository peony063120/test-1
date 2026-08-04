import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TransactionQueryDto } from './dto/transaction-query.dto';
import { StockTransactionService } from './stock-transaction.service';

@ApiTags('stock-transactions')
@ApiBearerAuth()
@Controller('stock-transactions')
@UseGuards(AuthGuard)
export class StockTransactionController {
  constructor(private readonly stockTransactionService: StockTransactionService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles('stock-transaction.read')
  @ApiOperation({ summary: 'List stock transactions' })
  findAll(@Query() query: TransactionQueryDto) {
    return this.stockTransactionService.findByInventory(query.inventoryId as any, query as any);
  }

  @Get('summary')
  @UseGuards(RolesGuard)
  @Roles('stock-transaction.read')
  @ApiOperation({ summary: 'Get stock transaction summary' })
  getSummary(@Query('productId') productId: string, @Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return this.stockTransactionService.getSummary(productId, startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('stock-transaction.read')
  @ApiOperation({ summary: 'Get stock transaction' })
  findById(@Param('id') id: string) {
    return this.stockTransactionService.findById(id);
  }
}
