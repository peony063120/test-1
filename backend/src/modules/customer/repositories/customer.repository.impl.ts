import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { ICustomerRepository } from './customer.repository.interface';

@Injectable()
export class CustomerRepositoryImpl implements ICustomerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(customer: any) {
    return this.prisma.customer.create({ data: customer });
  }

  async update(id: string, data: Partial<any>) {
    return this.prisma.customer.update({ where: { id }, data });
  }

  async findById(id: string) {
    return this.prisma.customer.findFirst({ where: { id, deletedAt: null } });
  }

  async findByEmail(email: string) {
    return this.prisma.customer.findFirst({ where: { email, deletedAt: null } });
  }

  async findByPhone(phone: string) {
    return this.prisma.customer.findFirst({ where: { phone, deletedAt: null } });
  }

  async findAll(query: any) {
    const page = Number(query?.page ?? 1);
    const limit = Number(query?.limit ?? 20);
    const skip = (page - 1) * limit;
    const filter = query?.filter;
    const where: any = { deletedAt: null };

    if (filter) {
      where.OR = [
        { name: { contains: filter, mode: 'insensitive' } },
        { email: { contains: filter, mode: 'insensitive' } },
        { phone: { contains: filter, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.customer.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.customer.count({ where }),
    ]);

    return { data, total };
  }

  async softDelete(id: string) {
    return this.prisma.customer.update({ where: { id }, data: { deletedAt: new Date(), updatedAt: new Date() } });
  }
}
