import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { SupplierEntity } from '../entities/supplier.entity';
import { ISupplierRepository } from './supplier.repository.interface';

@Injectable()
export class SupplierRepositoryImpl implements ISupplierRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(supplier: SupplierEntity): Promise<SupplierEntity> {
    return (await this.prisma.supplier.create({
      data: {
        companyName: supplier.companyName,
        contactName: supplier.contactName,
        phone: supplier.phone,
        email: supplier.email,
        address: supplier.address,
        taxCode: supplier.taxCode,
      },
    })) as SupplierEntity;
  }

  async update(id: string, supplier: Partial<SupplierEntity>): Promise<SupplierEntity> {
    return (await this.prisma.supplier.update({
      where: { id },
      data: {
        companyName: supplier.companyName,
        contactName: supplier.contactName,
        phone: supplier.phone,
        email: supplier.email,
        address: supplier.address,
        taxCode: supplier.taxCode,
      },
    })) as SupplierEntity;
  }

  async findById(id: string): Promise<SupplierEntity | null> {
    return (await this.prisma.supplier.findFirst({ where: { id, deletedAt: null } })) as SupplierEntity | null;
  }

  async findByCompanyName(companyName: string): Promise<SupplierEntity | null> {
    return (await this.prisma.supplier.findFirst({ where: { companyName, deletedAt: null } })) as SupplierEntity | null;
  }

  async findByEmail(email: string): Promise<SupplierEntity | null> {
    return (await this.prisma.supplier.findFirst({ where: { email, deletedAt: null } })) as SupplierEntity | null;
  }

  async findAll(query: any): Promise<{ data: SupplierEntity[]; total: number }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: any = { deletedAt: null };
    if (query.filter?.search) where.companyName = { contains: query.filter.search, mode: 'insensitive' };
    if (query.filter?.contactName) where.contactName = { contains: query.filter.contactName, mode: 'insensitive' };
    if (query.filter?.email) where.email = { contains: query.filter.email, mode: 'insensitive' };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.supplier.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: query.sort ? { [query.sort]: 'desc' } : { createdAt: 'desc' } }),
      this.prisma.supplier.count({ where }),
    ]);

    return { data: data as SupplierEntity[], total };
  }

  async softDelete(id: string): Promise<SupplierEntity> {
    return (await this.prisma.supplier.update({ where: { id }, data: { deletedAt: new Date() } })) as SupplierEntity;
  }
}
