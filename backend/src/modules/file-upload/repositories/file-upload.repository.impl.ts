import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { IFileUploadRepository } from './file-upload.repository.interface';

@Injectable()
export class FileUploadRepositoryImpl implements IFileUploadRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(data: any) {
    return this.prisma.fileUpload.create({ data });
  }

  async findById(id: string) {
    return this.prisma.fileUpload.findUnique({ where: { id } });
  }

  async findAll(query: any = {}) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 20);
    const skip = (page - 1) * limit;
    const [items, total] = await this.prisma.$transaction([
      this.prisma.fileUpload.findMany({ skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.fileUpload.count(),
    ]);
    return { items, total, page, limit };
  }

  async delete(id: string) {
    await this.prisma.fileUpload.delete({ where: { id } });
  }
}
