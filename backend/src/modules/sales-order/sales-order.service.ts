import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { AuditLogService } from '../../infrastructure/audit/audit-log.service';
import { InventoryService } from '../inventory/inventory.service';
import { ProductService } from '../product/product.service';
import { CustomerService } from '../customer/customer.service';
import { WarehouseService } from '../warehouse/warehouse.service';
import { SALES_ORDER_REPOSITORY, ISalesOrderRepository } from './repositories/sales-order.repository.interface';
import { CreateSalesOrderDto } from './dto/create-sales-order.dto';
import { UpdateSalesOrderDto } from './dto/update-sales-order.dto';
import { SalesOrderQueryDto } from './dto/sales-order-query.dto';
import { ShipSalesOrderDto } from './dto/ship-sales-order.dto';
import { SalesDetailService } from '../sales-detail/sales-detail.service';

@Injectable()
export class SalesOrderService {
  constructor(
    @Inject(SALES_ORDER_REPOSITORY) private readonly salesOrderRepository: ISalesOrderRepository,
    private readonly prisma: PrismaService,
    private readonly auditLogService: AuditLogService,
    private readonly inventoryService: InventoryService,
    private readonly productService: ProductService,
    private readonly customerService: CustomerService,
    private readonly warehouseService: WarehouseService,
    private readonly salesDetailService: SalesDetailService,
  ) {}

  async create(dto: CreateSalesOrderDto, userId?: string) {
    await this.validateReferences(dto.customerId, dto.warehouseId);
    await this.validateProducts(dto.details);

    const totalAmount = this.calculateOrderTotal(dto.details);
    const created = await this.prisma.$transaction(async (tx) => {
      const order = await tx.salesOrder.create({
        data: {
          customerId: dto.customerId,
          warehouseId: dto.warehouseId,
          createdBy: userId ?? 'system',
          status: 'DRAFT',
          totalAmount,
        },
      });

      await Promise.all(
        dto.details.map((detail) =>
          tx.salesDetail.create({
            data: {
              salesOrderId: order.id,
              productId: detail.productId,
              quantity: detail.quantity,
              price: detail.price,
            },
          }),
        ),
      );

      return tx.salesOrder.findUniqueOrThrow({ where: { id: order.id }, include: { details: true } });
    });

    await this.auditLogService.log(userId, 'create', 'salesOrder', created.id, null, created, undefined);
    return created;
  }

  async update(id: string, dto: UpdateSalesOrderDto, userId?: string) {
    const current = await this.salesOrderRepository.findById(id, true);
    if (!current) throw new NotFoundException('Sales order not found');
    if (current.status !== 'DRAFT') throw new BadRequestException('Only draft sales orders can be updated');

    await this.validateReferences(dto.customerId ?? current.customerId, dto.warehouseId ?? current.warehouseId);
    if (dto.details) await this.validateProducts(dto.details);

    const totalAmount = dto.details ? this.calculateOrderTotal(dto.details) : current.totalAmount;
    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.salesDetail.deleteMany({ where: { salesOrderId: id } });
      if (dto.details?.length) {
        await Promise.all(
          dto.details.map((detail) =>
            tx.salesDetail.create({
              data: {
                salesOrderId: id,
                productId: detail.productId,
                quantity: detail.quantity,
                price: detail.price,
              },
            }),
          ),
        );
      }

      return tx.salesOrder.update({
        where: { id },
        data: {
          customerId: dto.customerId ?? current.customerId,
          warehouseId: dto.warehouseId ?? current.warehouseId,
          totalAmount,
        },
        include: { details: true },
      });
    });

    await this.auditLogService.log(userId, 'update', 'salesOrder', id, current, updated, undefined);
    return updated;
  }

  async findById(id: string) {
    return this.salesOrderRepository.findById(id, true);
  }

  async findAll(query: SalesOrderQueryDto) {
    return this.salesOrderRepository.findAll(query);
  }

  async ship(id: string, userId?: string, dto?: ShipSalesOrderDto) {
    const current = await this.salesOrderRepository.findById(id, true);
    if (!current) throw new NotFoundException('Sales order not found');
    if (current.status !== 'DRAFT') throw new BadRequestException('Only draft sales orders can be shipped');

    const details = current.details ?? [];
    const tx = await this.prisma.$transaction(async (connection) => {
      for (const detail of details) {
        const available = await this.inventoryService.checkAvailable(detail.productId, current.warehouseId, Number(detail.quantity), connection as any);
        if (!available) {
          throw new BadRequestException(`Insufficient stock for product ${detail.productId}`);
        }
      }

      for (const detail of details) {
        await this.inventoryService.adjustStock(
          detail.productId,
          current.warehouseId,
          -Number(detail.quantity),
          'EXPORT',
          `SO-${current.id}`,
          userId,
          `Ship sales order ${current.id}`,
          connection as any,
        );
      }

      const updated = await this.salesOrderRepository.updateStatus(id, 'SHIPPED');
      await this.auditLogService.log(userId, 'ship', 'salesOrder', id, current, updated, undefined);
      return updated;
    });

    return tx;
  }

  async cancel(id: string, userId?: string) {
    const current = await this.salesOrderRepository.findById(id, false);
    if (!current) throw new NotFoundException('Sales order not found');
    if (current.status === 'SHIPPED') {
      await this.prisma.$transaction(async (connection) => {
        const details = await connection.salesDetail.findMany({ where: { salesOrderId: id } });
        for (const detail of details) {
          await this.inventoryService.adjustStock(detail.productId, current.warehouseId, Number(detail.quantity), 'RETURN', `SO-${current.id}`, userId, 'Cancel shipped sales order', connection as any);
        }
      });
    }
    if (current.status !== 'DRAFT' && current.status !== 'SHIPPED') throw new BadRequestException('Only draft or shipped sales orders can be canceled');

    const updated = await this.salesOrderRepository.updateStatus(id, 'CANCELED');
    await this.auditLogService.log(userId, 'cancel', 'salesOrder', id, current, updated, undefined);
    return updated;
  }

  async recalculateTotal(id: string) {
    const order = await this.salesOrderRepository.findById(id, true);
    if (!order) throw new NotFoundException('Sales order not found');
    const totalAmount = this.calculateOrderTotal(order.details ?? []);
    return this.salesOrderRepository.update(id, { totalAmount });
  }

  private calculateOrderTotal(details: Array<{ quantity: number; price: number }>): number {
    return details.reduce((total, detail) => total + Number(detail.quantity) * Number(detail.price), 0);
  }

  private async validateReferences(customerId: string, warehouseId: string) {
    const [customer, warehouse] = await Promise.all([
      this.customerService.findById(customerId),
      this.warehouseService.findById(warehouseId),
    ]);
    if (!customer) throw new NotFoundException('Customer not found');
    if (!warehouse) throw new NotFoundException('Warehouse not found');
  }

  private async validateProducts(details: Array<{ productId: string }>) {
    for (const detail of details) {
      const product = await this.productService.findOne(detail.productId);
      if (!product) throw new NotFoundException(`Product ${detail.productId} not found`);
    }
  }
}
