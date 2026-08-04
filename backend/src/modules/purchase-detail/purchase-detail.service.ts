import { Injectable } from '@nestjs/common';
import { PurchaseDetailEntity } from './entities/purchase-detail.entity';
import { PURCHASE_DETAIL_REPOSITORY, IPurchaseDetailRepository } from './repositories/purchase-detail.repository.interface';
import { Inject } from '@nestjs/common';

@Injectable()
export class PurchaseDetailService {
  constructor(
    @Inject(PURCHASE_DETAIL_REPOSITORY) private readonly purchaseDetailRepository: IPurchaseDetailRepository,
  ) {}

  async create(dto: Partial<PurchaseDetailEntity>) {
    return this.purchaseDetailRepository.save(dto as PurchaseDetailEntity);
  }

  async update(id: string, dto: Partial<PurchaseDetailEntity>) {
    return this.purchaseDetailRepository.update(id, dto);
  }

  async delete(id: string) {
    return this.purchaseDetailRepository.delete(id);
  }

  async findByPurchaseOrder(purchaseOrderId: string) {
    return this.purchaseDetailRepository.findByPurchaseOrder(purchaseOrderId);
  }
}
