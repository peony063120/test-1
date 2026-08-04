import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ReportService } from './report.service';
import { ReportQueryDto } from './dto/report-query.dto';

@ApiTags('reports')
@ApiBearerAuth()
@Controller('reports')
@UseGuards(AuthGuard)
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('inventory')
  @UseGuards(RolesGuard)
  @Roles('report.view')
  @ApiOperation({ summary: 'Get inventory report' })
  getInventoryReport(@Query() query: ReportQueryDto) {
    return this.reportService.getInventoryReport(query);
  }

  @Get('sales')
  @UseGuards(RolesGuard)
  @Roles('report.view')
  @ApiOperation({ summary: 'Get sales report' })
  getSalesReport(@Query() query: ReportQueryDto) {
    return this.reportService.getSalesReport(query);
  }

  @Get('purchase')
  @UseGuards(RolesGuard)
  @Roles('report.view')
  @ApiOperation({ summary: 'Get purchase report' })
  getPurchaseReport(@Query() query: ReportQueryDto) {
    return this.reportService.getPurchaseReport(query);
  }
}
