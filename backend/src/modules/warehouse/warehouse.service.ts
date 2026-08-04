import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AuditLogService } from '../../infrastructure/audit/audit-log.service';
import { WarehouseEntity } from './entities/warehouse.entity';
import { WAREHOUSE_REPOSITORY, IWarehouseRepository } from './repositories/warehouse.repository.interface';

@Injectable()
export class WarehouseService {
  constructor(
    @Inject(WAREHOUSE_REPOSITORY) private readonly warehouseRepository: IWarehouseRepository,
    private readonly auditLogService: AuditLogService,
  ) {}

  async create(dto: Partial<WarehouseEntity>, currentUserId?: string) {
    const existing = await this.warehouseRepository.findByName(dto.name!);
    if (existing) {
      throw new BadRequestException('Warehouse name already exists');
    }

    const warehouse = await this.warehouseRepository.save(dto as WarehouseEntity);
    await this.auditLogService.log(currentUserId, 'create', 'warehouse', warehouse.id, null, warehouse, undefined);
    return warehouse;
  }

  async update(id: string, dto: Partial<WarehouseEntity>, currentUserId?: string) {
    const current = await this.warehouseRepository.findById(id);
    if (!current) {
      throw new NotFoundException('Warehouse not found');
    }

    if (dto.name && dto.name !== current.name) {
      const existing = await this.warehouseRepository.findByName(dto.name);
      if (existing) {
        throw new BadRequestException('Warehouse name already exists');
      }
    }

    const warehouse = await this.warehouseRepository.update(id, dto);
    await this.auditLogService.log(currentUserId, 'update', 'warehouse', id, current, warehouse, undefined);
    return warehouse;
  }

  async delete(id: string, currentUserId?: string) {
    const current = await this.warehouseRepository.findById(id);
    if (!current) {
      throw new NotFoundException('Warehouse not found');
    }

    const warehouse = await this.warehouseRepository.softDelete(id);
    await this.auditLogService.log(currentUserId, 'delete', 'warehouse', id, current, warehouse, undefined);
    return warehouse;
  }

  async findById(id: string) {
    return this.warehouseRepository.findById(id);
  }

  async findAll(query: any) {
    return this.warehouseRepository.findAll(query);
  }
}
