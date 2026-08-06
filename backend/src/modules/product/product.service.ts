import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { AuditLogService } from '../../infrastructure/audit/audit-log.service';
import { RedisService } from '../../infrastructure/cache/redis.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import {
  PRODUCT_REPOSITORY,
  ProductRepository,
} from './repositories/product.repository.interface';

@Injectable()
export class ProductService {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
    private readonly prisma: PrismaService,
    private readonly auditLogService: AuditLogService,
    private readonly redisService: RedisService,
  ) {}

  async create(dto: CreateProductDto) {
    const product = await this.productRepository.create(dto);
    await this.auditLogService.log(undefined, 'create', 'product', product.id, null, product, undefined);
    return product;
  }

  async findAll(query: QueryProductDto) {
    const page = Math.max(1, Number(query.page ?? 1));
    const limit = Math.max(1, Number(query.limit ?? 20));
    const search = query.search?.trim();

    const [items, total] = await Promise.all([
      this.productRepository.findMany({ page, limit, search }),
      this.productRepository.count(search),
    ]);

    return {
      items,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
  }

  async findOne(id: string) {
    const cached = await this.redisService.get<{ id: string; name: string }>(`product:${id}`);
    if (cached) return cached;

    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    await this.redisService.set(`product:${id}`, product, 300);
    return product;
  }

  async update(id: string, dto: UpdateProductDto) {
    const existing = await this.productRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Product not found');
    }

    const product = await this.productRepository.update(id, dto);
    await this.redisService.del(`product:${id}`);
    await this.auditLogService.log(undefined, 'update', 'product', id, existing, product, undefined);
    return product;
  }

  async remove(id: string) {
    const existing = await this.productRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Product not found');
    }

    await this.productRepository.softDelete(id);
    await this.redisService.del(`product:${id}`);
    await this.auditLogService.log(undefined, 'delete', 'product', id, existing, { deleted: true }, undefined);
    return { success: true };
  }

  async getByBarcode(barcode: string) {
    const cached = await this.redisService.get<any>(`barcode:${barcode}`);
    if (cached) return cached;

    const product = await this.prisma.product.findFirst({ where: { barcode, deletedAt: null } });
    if (product) {
      await this.redisService.set(`barcode:${barcode}`, product, 600);
    }
    return product;
  }
}
