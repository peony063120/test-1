import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateProductDto) {
    return this.prisma.product.create({
      data: {
        sku: dto.sku,
        barcode: dto.barcode,
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        costPrice: dto.costPrice,
        salePrice: dto.salePrice,
        status: (dto.status as any) || 'ACTIVE',
        unit: dto.unit,
        categoryId: dto.categoryId,
        brandId: dto.brandId,
        supplierId: dto.supplierId,
      },
    });
  }

  findAll() {
    return this.prisma.product.findMany({
      include: {
        category: true,
        brand: true,
        supplier: true,
      },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true, brand: true, supplier: true },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findOne(id);
    return this.prisma.product.update({
      where: { id },
      data: {
        sku: dto.sku,
        barcode: dto.barcode,
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        costPrice: dto.costPrice,
        salePrice: dto.salePrice,
        status: dto.status as any,
        unit: dto.unit,
        categoryId: dto.categoryId,
        brandId: dto.brandId,
        supplierId: dto.supplierId,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.product.delete({ where: { id } });
  }
}
