import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { STOCK_TRANSACTION_REPOSITORY, IStockTransactionRepository } from './repositories/stock-transaction.repository.interface';

@Injectable()
export class StockTransactionService {
  constructor(
    @Inject(STOCK_TRANSACTION_REPOSITORY) private readonly transactionRepository: IStockTransactionRepository,
    private readonly prisma: PrismaService,
  ) {}

  async create(transactionData: any, tx?: any) {
    const repo = tx ?? this.prisma;
    return repo.stockTransaction.create({ data: transactionData });
  }

  async findByInventory(inventoryId: string, query: any) {
    return this.transactionRepository.findByInventory(inventoryId, query);
  }

  async findByProduct(productId: string, query: any) {
    return this.transactionRepository.findByProduct(productId, query);
  }

  async findByReference(referenceId: string) {
    return this.transactionRepository.findByReference(referenceId);
  }

  async findById(id: string) {
    return this.transactionRepository.findById(id);
  }

  async getSummary(productId: string, startDate?: Date, endDate?: Date) {
    return this.transactionRepository.getSummary(productId, startDate, endDate);
  }
}
