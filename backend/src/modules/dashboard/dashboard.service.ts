import { Injectable } from '@nestjs/common';

@Injectable()
export class DashboardService {
  async getStats() {
    return {
      products: 0,
      orders: 0,
      inventory: 0,
      revenue: 0,
      profit: 0,
    };
  }

  async getCharts() {
    return {
      sales: [],
      categories: [],
      trend: [],
    };
  }

  async getLowStock() {
    return [];
  }
}
