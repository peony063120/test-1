import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AuditLogService } from '../../infrastructure/audit/audit-log.service';
import { CustomerEntity } from './entities/customer.entity';
import { CUSTOMER_REPOSITORY, ICustomerRepository } from './repositories/customer.repository.interface';

@Injectable()
export class CustomerService {
  constructor(
    @Inject(CUSTOMER_REPOSITORY) private readonly customerRepository: ICustomerRepository,
    private readonly auditLogService: AuditLogService,
  ) {}

  async create(dto: Partial<CustomerEntity>, currentUserId?: string) {
    if (dto.email) {
      const existing = await this.customerRepository.findByEmail(dto.email);
      if (existing) throw new BadRequestException('Customer email already exists');
    }
    if (dto.phone) {
      const existingPhone = await this.customerRepository.findByPhone(dto.phone);
      if (existingPhone) throw new BadRequestException('Customer phone already exists');
    }

    const customer = await this.customerRepository.save(dto as CustomerEntity);
    await this.auditLogService.log(currentUserId, 'create', 'customer', customer.id, null, customer, undefined);
    return customer;
  }

  async update(id: string, dto: Partial<CustomerEntity>, currentUserId?: string) {
    const current = await this.customerRepository.findById(id);
    if (!current) throw new NotFoundException('Customer not found');

    if (dto.email && dto.email !== current.email) {
      const existing = await this.customerRepository.findByEmail(dto.email);
      if (existing) throw new BadRequestException('Customer email already exists');
    }
    if (dto.phone && dto.phone !== current.phone) {
      const existingPhone = await this.customerRepository.findByPhone(dto.phone);
      if (existingPhone) throw new BadRequestException('Customer phone already exists');
    }

    const customer = await this.customerRepository.update(id, dto);
    await this.auditLogService.log(currentUserId, 'update', 'customer', id, current, customer, undefined);
    return customer;
  }

  async delete(id: string, currentUserId?: string) {
    const current = await this.customerRepository.findById(id);
    if (!current) throw new NotFoundException('Customer not found');

    const customer = await this.customerRepository.softDelete(id);
    await this.auditLogService.log(currentUserId, 'delete', 'customer', id, current, customer, undefined);
    return customer;
  }

  async findById(id: string) {
    return this.customerRepository.findById(id);
  }

  async findAll(query: any) {
    return this.customerRepository.findAll(query);
  }
}
