import { Injectable, Inject } from '@nestjs/common';
import { SalesDetailEntity } from './entities/sales-detail.entity';
import { SALES_DETAIL_REPOSITORY, ISalesDetailRepository } from './repositories/sales-detail.repository.interface';

@Injectable()
export class SalesDetailService {
  constructor(
    @Inject(SALES_DETAIL_REPOSITORY) private readonly salesDetailRepository: ISalesDetailRepository,
  ) {}

  async create(dto: Partial<SalesDetailEntity>) {
    return this.salesDetailRepository.save(dto as SalesDetailEntity);
  }

  async update(id: string, dto: Partial<SalesDetailEntity>) {
    return this.salesDetailRepository.update(id, dto);
  }

  async delete(id: string) {
    return this.salesDetailRepository.delete(id);
  }

  async findBySalesOrder(salesOrderId: string) {
    return this.salesDetailRepository.findBySalesOrder(salesOrderId);
  }
}
