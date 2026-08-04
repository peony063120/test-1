import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { FILE_UPLOAD_REPOSITORY, IFileUploadRepository } from './repositories/file-upload.repository.interface';
import { StorageService } from '../../infrastructure/storage/storage.service';
import { FileQueryDto } from './dto/file-query.dto';

type MulterFile = {
  originalname: string;
  mimetype: string;
  size: number;
};

@Injectable()
export class FileUploadService {
  constructor(
    @Inject(FILE_UPLOAD_REPOSITORY) private readonly fileUploadRepository: IFileUploadRepository,
    private readonly storageService: StorageService,
  ) {}

  async upload(file: MulterFile, userId?: string) {
    if (!file) throw new NotFoundException('File is required');
    if (file.size > 5 * 1024 * 1024) throw new Error('File too large');

    const storedPath = `uploads/${Date.now()}-${file.originalname}`;
    const url = await this.storageService.upload(file, storedPath);
    const record = await this.fileUploadRepository.save({
      fileName: file.originalname,
      originalName: file.originalname,
      url,
      storageKey: storedPath,
      type: file.mimetype,
      size: file.size,
      mimeType: file.mimetype,
      uploadedBy: userId,
    });

    return record;
  }

  async delete(id: string) {
    const record = await this.fileUploadRepository.findById(id);
    if (!record) throw new NotFoundException('File not found');
    await this.storageService.delete(record.storageKey);
    await this.fileUploadRepository.delete(id);
    return { success: true };
  }

  async findById(id: string) {
    const record = await this.fileUploadRepository.findById(id);
    if (!record) throw new NotFoundException('File not found');
    return record;
  }

  async findAll(query: FileQueryDto) {
    return this.fileUploadRepository.findAll(query);
  }

  async getPublicUrl(fileId: string) {
    const record = await this.fileUploadRepository.findById(fileId);
    if (!record) throw new NotFoundException('File not found');
    return this.storageService.getSignedUrl(record.storageKey);
  }
}
