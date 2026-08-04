import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AuditLogService } from '../../infrastructure/audit/audit-log.service';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CategoryEntity } from './entities/category.entity';
import { CATEGORY_REPOSITORY, ICategoryRepository } from './repositories/category.repository.interface';

@Injectable()
export class CategoryService {
  constructor(
    @Inject(CATEGORY_REPOSITORY) private readonly categoryRepository: ICategoryRepository,
    private readonly prisma: PrismaService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async create(dto: Partial<CategoryEntity>, currentUserId?: string) {
    if (dto.parentId) {
      await this.ensureNoCircularReference(dto.parentId, undefined);
    }

    const existing = await this.categoryRepository.findByName(dto.name!);
    if (existing) throw new BadRequestException('Category name already exists');

    const created = await this.categoryRepository.save(dto as CategoryEntity);
    await this.auditLogService.log(currentUserId, 'create', 'category', created.id, null, created, undefined);
    return created;
  }

  async update(id: string, dto: Partial<CategoryEntity>, currentUserId?: string) {
    const current = await this.categoryRepository.findById(id);
    if (!current) throw new NotFoundException('Category not found');

    if (dto.parentId && dto.parentId !== current.parentId) {
      await this.ensureNoCircularReference(dto.parentId, id);
    }

    const updated = await this.categoryRepository.update(id, dto);
    await this.auditLogService.log(currentUserId, 'update', 'category', id, current, updated, undefined);
    return updated;
  }

  async delete(id: string, currentUserId?: string) {
    const current = await this.categoryRepository.findById(id);
    if (!current) throw new NotFoundException('Category not found');

    const children = await this.categoryRepository.findChildren(id);
    const products = await this.prisma.product.count({ where: { categoryId: id, deletedAt: null } });
    if (children.length || products) {
      throw new BadRequestException('Cannot delete category with children or products');
    }

    const deleted = await this.categoryRepository.softDelete(id);
    await this.auditLogService.log(currentUserId, 'delete', 'category', id, current, deleted, undefined);
    return deleted;
  }

  async findById(id: string) {
    return this.categoryRepository.findById(id);
  }

  async findAll(query: any) {
    return this.categoryRepository.findAll(query);
  }

  async getTree() {
    const categories = await this.categoryRepository.findTree();
    const map = new Map<string, CategoryEntity>();
    const roots: CategoryEntity[] = [];

    categories.forEach((category) => {
      const node = { ...category, children: [] as CategoryEntity[] };
      map.set(node.id!, node);
    });

    categories.forEach((category) => {
      if (category.parentId && map.has(category.parentId)) {
        map.get(category.parentId)?.children?.push(map.get(category.id!)!);
      } else {
        roots.push(map.get(category.id!)!);
      }
    });

    return roots;
  }

  async getParents(childId: string) {
    return this.categoryRepository.findParents(childId);
  }

  async getChildren(parentId: string) {
    return this.categoryRepository.findChildren(parentId);
  }

  private async ensureNoCircularReference(parentId: string, currentId?: string) {
    if (parentId === currentId) {
      throw new BadRequestException('Category cannot be its own parent');
    }

    const visited = new Set<string>();
    let current: CategoryEntity | null = await this.categoryRepository.findById(parentId);

    while (current) {
      if (visited.has(current.id!)) break;
      visited.add(current.id!);
      if (current.id === currentId) {
        throw new BadRequestException('Circular category reference detected');
      }
      current = current.parentId ? await this.categoryRepository.findById(current.parentId) : null;
    }
  }
}
