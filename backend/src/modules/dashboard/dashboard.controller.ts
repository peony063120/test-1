import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { DashboardService } from './dashboard.service';

@ApiTags('dashboard')
@ApiBearerAuth()
@Controller('dashboard')
@UseGuards(AuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles('dashboard.read')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  getStats() {
    return this.dashboardService.getStats();
  }

  @Get('charts')
  @UseGuards(RolesGuard)
  @Roles('dashboard.read')
  @ApiOperation({ summary: 'Get dashboard charts data' })
  getCharts() {
    return this.dashboardService.getCharts();
  }

  @Get('low-stock')
  @UseGuards(RolesGuard)
  @Roles('dashboard.read')
  @ApiOperation({ summary: 'Get low stock items' })
  getLowStock() {
    return this.dashboardService.getLowStock();
  }
}
