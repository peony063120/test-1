import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { AuditLogService } from '../../infrastructure/audit/audit-log.service';
import { InventoryService } from '../inventory/inventory.service';
import { ProductService } from '../product/product.service';
import { SupplierService } from '../supplier/supplier.service';
import { WarehouseService } from '../warehouse/warehouse.service';
import { PURCHASE_ORDER_REPOSITORY, IPurchaseOrderRepository } from './repositories/purchase-order.repository.interface';
import { PurchaseOrderEntity } from './entities/purchase-order.entity';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { PurchaseOrderQueryDto } from './dto/purchase-order-query.dto';
import { ApprovePurchaseOrderDto } from './dto/approve-purchase-order.dto';
import { ReceivePurchaseOrderDto } from './dto/receive-purchase-order.dto';
import { PurchaseDetailService } from '../purchase-detail/purchase-detail.service';

@Injectable()
export class PurchaseOrderService {
  constructor(
    @Inject(PURCHASE_ORDER_REPOSITORY) private readonly purchaseOrderRepository: IPurchaseOrderRepository,
    private readonly prisma: PrismaService,
    private readonly auditLogService: AuditLogService,
    private readonly inventoryService: InventoryService,
    private readonly productService: ProductService,
    private readonly supplierService: SupplierService,
    private readonly warehouseService: WarehouseService,
    private readonly purchaseDetailService: PurchaseDetailService,
  ) {}

  async create(dto: CreatePurchaseOrderDto, userId?: string) {
    await this.validateReferences(dto.supplierId, dto.warehouseId);
    await this.validateProducts(dto.details);

    const totalAmount = this.calculateOrderTotal(dto.details);
    const created = await this.runInTransaction(async (tx) => {
      const order = await tx.purchaseOrder.create({
        data: {
          supplierId: dto.supplierId,
          warehouseId: dto.warehouseId,
          createdBy: userId ?? 'system',
          status: 'DRAFT',
          totalAmount,
        },
      });

      await Promise.all(
        dto.details.map((detail) =>
          tx.purchaseDetail.create({
            data: {
              purchaseOrderId: order.id,
              productId: detail.productId,
              quantity: detail.quantity,
              price: detail.price,
            },
          }),
        ),
      );

      return tx.purchaseOrder.findUniqueOrThrow({ where: { id: order.id }, include: { details: true } });
    });

    await this.auditLogService.log(userId, 'create', 'purchaseOrder', created.id, null, created, undefined);
    return created;
  }

  async update(id: string, dto: UpdatePurchaseOrderDto, userId?: string) {
    const current = await this.purchaseOrderRepository.findById(id, true);
    if (!current) throw new NotFoundException('Purchase order not found');
    if (current.status !== 'DRAFT') throw new BadRequestException('Only draft purchase orders can be updated');

    await this.validateReferences(dto.supplierId ?? current.supplierId, dto.warehouseId ?? current.warehouseId);
    if (dto.details) await this.validateProducts(dto.details);

    const totalAmount = dto.details ? this.calculateOrderTotal(dto.details) : current.totalAmount;
    const updated = await this.runInTransaction(async (tx) => {
      await tx.purchaseDetail.deleteMany({ where: { purchaseOrderId: id } });
      if (dto.details?.length) {
        await Promise.all(
          dto.details.map((detail) =>
            tx.purchaseDetail.create({
              data: {
                purchaseOrderId: id,
                productId: detail.productId,
                quantity: detail.quantity,
                price: detail.price,
              },
            }),
          ),
        );
      }

      return tx.purchaseOrder.update({
        where: { id },
        data: {
          supplierId: dto.supplierId ?? current.supplierId,
          warehouseId: dto.warehouseId ?? current.warehouseId,
          totalAmount,
        },
        include: { details: true },
      });
    });

    await this.auditLogService.log(userId, 'update', 'purchaseOrder', id, current, updated, undefined);
    return updated;
  }

  async findById(id: string) {
    return this.purchaseOrderRepository.findById(id, true);
  }

  async findAll(query: PurchaseOrderQueryDto) {
    return this.purchaseOrderRepository.findAll(query);
  }

  async approve(id: string, userId?: string, dto?: ApprovePurchaseOrderDto) {
    const current = await this.purchaseOrderRepository.findById(id, false);
    if (!current) throw new NotFoundException('Purchase order not found');
    if (current.status !== 'DRAFT') throw new BadRequestException('Only draft purchase orders can be approved');

    const updated = await this.purchaseOrderRepository.updateStatus(id, 'APPROVED');
    await this.auditLogService.log(userId, 'approve', 'purchaseOrder', id, current, updated, undefined);
    return updated;
  }

  async receive(id: string, userId?: string, dto?: ReceivePurchaseOrderDto) {
    const current = await this.purchaseOrderRepository.findById(id, true);
    if (!current) throw new NotFoundException('Purchase order not found');
    if (current.status !== 'APPROVED') throw new BadRequestException('Only approved purchase orders can be received');

    const details = current.details ?? [];
    const tx = await this.runInTransaction(async (connection) => {
      for (const detail of details) {
        await this.inventoryService.adjustStock(
          detail.productId,
          current.warehouseId,
          Number(detail.quantity),
          'IMPORT',
          `PO-${current.id}`,
          userId,
          `Receive purchase order ${current.id}`,
          connection as any,
        );
      }

      const updated = await this.purchaseOrderRepository.updateStatus(id, 'RECEIVED');
      await this.auditLogService.log(userId, 'receive', 'purchaseOrder', id, current, updated, undefined);
      return updated;
    });

    return tx;
  }

  async cancel(id: string, userId?: string) {
    const current = await this.purchaseOrderRepository.findById(id, false);
    if (!current) throw new NotFoundException('Purchase order not found');
    if (current.status === 'RECEIVED') throw new BadRequestException('Received purchase orders cannot be canceled');
    if (current.status !== 'DRAFT' && current.status !== 'APPROVED') throw new BadRequestException('Only draft or approved purchase orders can be canceled');

    const updated = await this.purchaseOrderRepository.updateStatus(id, 'CANCELLED');
    await this.auditLogService.log(userId, 'cancel', 'purchaseOrder', id, current, updated, undefined);
    return updated;
  }

  async recalculateTotal(id: string) {
    const order = await this.purchaseOrderRepository.findById(id, true);
    if (!order) throw new NotFoundException('Purchase order not found');
    const totalAmount = this.calculateOrderTotal(order.details ?? []);
    return this.purchaseOrderRepository.update(id, { totalAmount });
  }

  private calculateOrderTotal(details: Array<{ quantity: number; price: number }>): number {
    return details.reduce((total, detail) => total + Number(detail.quantity) * Number(detail.price), 0);
  }

  private async runInTransaction<T>(operation: (tx: any) => Promise<T>): Promise<T> {
    const transactionFn = (this.prisma as any)?.$transaction;
    if (typeof transactionFn === 'function') {
      const result = await transactionFn(async (connection: any) => operation(connection));
      if (result !== undefined) {
        return result;
      }
    }

    return operation(this.prisma as any);
  }

  private async validateReferences(supplierId: string, warehouseId: string) {
    const [supplier, warehouse] = await Promise.all([
      this.supplierService.findById(supplierId),
      this.warehouseService.findById(warehouseId),
    ]);
    if (!supplier) throw new NotFoundException('Supplier not found');
    if (!warehouse) throw new NotFoundException('Warehouse not found');
  }

  private async validateProducts(details: Array<{ productId: string }>) {
    for (const detail of details) {
      const product = await this.productService.findOne(detail.productId);
      if (!product) throw new NotFoundException(`Product ${detail.productId} not found`);
    }
  }
}
