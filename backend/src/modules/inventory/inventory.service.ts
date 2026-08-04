import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { AuditLogService } from '../../infrastructure/audit/audit-log.service';
import { RedisService } from '../../infrastructure/cache/redis.service';
import { StockTransactionService } from '../stock-transaction/stock-transaction.service';
import { INVENTORY_REPOSITORY, IInventoryRepository } from './repositories/inventory.repository.interface';
import { InventoryEntity } from './entities/inventory.entity';

@Injectable()
export class InventoryService {
  constructor(
    @Inject(INVENTORY_REPOSITORY) private readonly inventoryRepository: IInventoryRepository,
    private readonly prisma: PrismaService,
    private readonly auditLogService: AuditLogService,
    private readonly redisService: RedisService,
    private readonly stockTransactionService: StockTransactionService,
  ) {}

  async create(dto: Partial<InventoryEntity>, currentUserId?: string) {
    const existing = await this.inventoryRepository.findByProductAndWarehouse(dto.productId!, dto.warehouseId!);
    if (existing) {
      throw new BadRequestException('Inventory already exists for this product and warehouse');
    }

    if (dto.minimumQuantity! > dto.maximumQuantity!) {
      throw new BadRequestException('minimumQuantity cannot be greater than maximumQuantity');
    }

    const inventory = await this.inventoryRepository.save(dto as InventoryEntity);
    await this.auditLogService.log(currentUserId, 'create', 'inventory', inventory.id, null, inventory, undefined);
    return inventory;
  }

  async update(id: string, dto: Partial<InventoryEntity>, currentUserId?: string) {
    const current = await this.inventoryRepository.findById(id);
    if (!current) {
      throw new NotFoundException('Inventory not found');
    }

    if (dto.minimumQuantity !== undefined && dto.maximumQuantity !== undefined && dto.minimumQuantity > dto.maximumQuantity) {
      throw new BadRequestException('minimumQuantity cannot be greater than maximumQuantity');
    }

    const inventory = await this.inventoryRepository.update(id, dto);
    await this.auditLogService.log(currentUserId, 'update', 'inventory', id, current, inventory, undefined);
    return inventory;
  }

  async findById(id: string) {
    return this.inventoryRepository.findById(id);
  }

  async findByProduct(productId: string) {
    return this.inventoryRepository.findByProduct(productId);
  }

  async findByWarehouse(warehouseId: string) {
    return this.inventoryRepository.findByWarehouse(warehouseId);
  }

  async findAll(query: any) {
    return this.inventoryRepository.findAll(query);
  }

  async getLowStock() {
    return this.inventoryRepository.findLowStock();
  }

  async getOverStock() {
    return this.inventoryRepository.findOverStock();
  }

  async initializeInventory(productId: string, warehouseId: string, initialQuantity: number) {
    const existing = await this.inventoryRepository.findByProductAndWarehouse(productId, warehouseId);
    if (existing) {
      return existing;
    }

    return this.inventoryRepository.save({
      productId,
      warehouseId,
      quantity: initialQuantity,
      minimumQuantity: 0,
      maximumQuantity: 999999,
    });
  }

  async checkAvailable(productId: string, warehouseId: string, requiredQuantity: number, tx?: any) {
    const inventory = await (tx ?? this.prisma).inventory.findFirst({
      where: { productId, warehouseId },
    });

    if (!inventory) {
      return null;
    }

    const available = Number(inventory.quantity);
    return available >= requiredQuantity ? inventory : null;
  }

  async adjustStockById(id: string, quantity: number, note?: string, userId?: string, tx?: any) {
    const inventory = await this.inventoryRepository.findById(id);
    if (!inventory) {
      throw new NotFoundException('Inventory not found');
    }

    const transactionType = quantity > 0 ? 'IMPORT' : 'EXPORT';
    if (quantity === 0) {
      throw new BadRequestException('Quantity must be non-zero');
    }

    const work = async (connection: any) => {
      const lockedInventory = await connection.inventory.findUnique({ where: { id } });
      if (!lockedInventory) {
        throw new NotFoundException('Inventory not found');
      }

      const beforeQuantity = Number(lockedInventory.quantity);
      const afterQuantity = beforeQuantity + quantity;

      if (quantity < 0 && afterQuantity < 0) {
        throw new BadRequestException(`Insufficient stock. Current: ${beforeQuantity}, Required: ${Math.abs(quantity)}`);
      }

      const updatedInventory = await connection.inventory.update({
        where: { id },
        data: { quantity: afterQuantity },
      });

      await this.stockTransactionService.create(
        {
          inventoryId: id,
          transactionType,
          quantity,
          beforeQuantity,
          afterQuantity,
          referenceId: `adjust-${id}`,
          createdBy: userId,
          note,
        },
        connection as any,
      );

      await this.redisService.del(`inventory:${inventory.productId}:${inventory.warehouseId}`);
      await this.redisService.del(`product:${inventory.productId}`);

      return updatedInventory;
    };

    if (tx) {
      return work(tx);
    }

    return this.prisma.$transaction(async (connection) => work(connection), {
      isolationLevel: 'Serializable',
    });
  }

  async adjustStock(
    productId: string,
    warehouseId: string,
    quantity: number,
    transactionType: 'IMPORT' | 'EXPORT' | 'ADJUSTMENT' | 'RETURN' | 'CANCEL',
    referenceId: string,
    userId?: string,
    note?: string,
    tx?: any,
  ): Promise<any> {
    if (quantity === 0) {
      throw new BadRequestException('Quantity must be non-zero');
    }

    const inventory = await this.inventoryRepository.findByProductAndWarehouse(productId, warehouseId);
    if (!inventory) {
      const created = await this.initializeInventory(productId, warehouseId, 0);
      if (!created) {
        throw new NotFoundException('Inventory not found');
      }
      return this.adjustStock(productId, warehouseId, quantity, transactionType, referenceId, userId, note);
    }

    const work = async (connection: any) => {
      const lockedInventory = await connection.inventory.findUnique({ where: { id: inventory.id } });
      if (!lockedInventory) {
        throw new NotFoundException('Inventory not found');
      }

      const beforeQuantity = Number(lockedInventory.quantity);
      const afterQuantity = beforeQuantity + quantity;

      if (quantity < 0 && afterQuantity < 0) {
        throw new BadRequestException(`Insufficient stock. Current: ${beforeQuantity}, Required: ${Math.abs(quantity)}`);
      }

      const updatedInventory = await connection.inventory.update({
        where: { id: inventory.id },
        data: { quantity: afterQuantity },
      });

      await this.stockTransactionService.create(
        {
          inventoryId: inventory.id,
          transactionType,
          quantity,
          beforeQuantity,
          afterQuantity,
          referenceId,
          createdBy: userId,
          note,
        },
        connection as any,
      );

      await this.redisService.del(`inventory:${productId}:${warehouseId}`);
      await this.redisService.del(`product:${productId}`);

      return updatedInventory;
    };

    if (tx) {
      return work(tx);
    }

    return this.prisma.$transaction(async (connection) => work(connection), {
      isolationLevel: 'Serializable',
    });
  }
}
