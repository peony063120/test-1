import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AuditLogService } from '../../infrastructure/audit/audit-log.service';
import { SupplierEntity } from './entities/supplier.entity';
import { SUPPLIER_REPOSITORY, ISupplierRepository } from './repositories/supplier.repository.interface';

@Injectable()
export class SupplierService {
  constructor(
    @Inject(SUPPLIER_REPOSITORY) private readonly supplierRepository: ISupplierRepository,
    private readonly auditLogService: AuditLogService,
  ) {}

  async create(dto: Partial<SupplierEntity>, currentUserId?: string) {
    if (dto.companyName) {
      const existingCompany = await this.supplierRepository.findByCompanyName(dto.companyName);
      if (existingCompany) throw new BadRequestException('Company name already exists');
    }

    if (dto.email) {
      const existingEmail = await this.supplierRepository.findByEmail(dto.email);
      if (existingEmail) throw new BadRequestException('Email already exists');
    }

    const created = await this.supplierRepository.save(dto as SupplierEntity);
    await this.auditLogService.log(currentUserId, 'create', 'supplier', created.id, null, created, undefined);
    return created;
  }

  async update(id: string, dto: Partial<SupplierEntity>, currentUserId?: string) {
    const current = await this.supplierRepository.findById(id);
    if (!current) throw new NotFoundException('Supplier not found');

    if (dto.companyName && dto.companyName !== current.companyName) {
      const existing = await this.supplierRepository.findByCompanyName(dto.companyName);
      if (existing) throw new BadRequestException('Company name already exists');
    }

    if (dto.email && dto.email !== current.email) {
      const existingEmail = await this.supplierRepository.findByEmail(dto.email);
      if (existingEmail) throw new BadRequestException('Email already exists');
    }

    const updated = await this.supplierRepository.update(id, dto);
    await this.auditLogService.log(currentUserId, 'update', 'supplier', id, current, updated, undefined);
    return updated;
  }

  async delete(id: string, currentUserId?: string) {
    const current = await this.supplierRepository.findById(id);
    if (!current) throw new NotFoundException('Supplier not found');

    const deleted = await this.supplierRepository.softDelete(id);
    await this.auditLogService.log(currentUserId, 'delete', 'supplier', id, current, deleted, undefined);
    return deleted;
  }

  async findById(id: string) {
    return this.supplierRepository.findById(id);
  }

  async findAll(query: any) {
    return this.supplierRepository.findAll(query);
  }
}
