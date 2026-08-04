import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AuditLogService } from '../../infrastructure/audit/audit-log.service';
import { BrandEntity } from './entities/brand.entity';
import { BRAND_REPOSITORY, IBrandRepository } from './repositories/brand.repository.interface';

@Injectable()
export class BrandService {
  constructor(
    @Inject(BRAND_REPOSITORY) private readonly brandRepository: IBrandRepository,
    private readonly auditLogService: AuditLogService,
  ) {}

  async create(dto: Partial<BrandEntity>, currentUserId?: string) {
    const existing = await this.brandRepository.findByName(dto.name!);
    if (existing) throw new BadRequestException('Brand name already exists');

    const created = await this.brandRepository.save(dto as BrandEntity);
    await this.auditLogService.log(currentUserId, 'create', 'brand', created.id, null, created, undefined);
    return created;
  }

  async update(id: string, dto: Partial<BrandEntity>, currentUserId?: string) {
    const current = await this.brandRepository.findById(id);
    if (!current) throw new NotFoundException('Brand not found');

    if (dto.name && dto.name !== current.name) {
      const existing = await this.brandRepository.findByName(dto.name);
      if (existing) throw new BadRequestException('Brand name already exists');
    }

    const updated = await this.brandRepository.update(id, dto);
    await this.auditLogService.log(currentUserId, 'update', 'brand', id, current, updated, undefined);
    return updated;
  }

  async delete(id: string, currentUserId?: string) {
    const current = await this.brandRepository.findById(id);
    if (!current) throw new NotFoundException('Brand not found');

    const deleted = await this.brandRepository.softDelete(id);
    await this.auditLogService.log(currentUserId, 'delete', 'brand', id, current, deleted, undefined);
    return deleted;
  }

  async findById(id: string) {
    return this.brandRepository.findById(id);
  }

  async findAll(query: any) {
    return this.brandRepository.findAll(query);
  }
}
