import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma/prisma.module';
import { FileUploadController } from './file-upload.controller';
import { FileUploadService } from './file-upload.service';
import { FILE_UPLOAD_REPOSITORY } from './repositories/file-upload.repository.interface';
import { FileUploadRepositoryImpl } from './repositories/file-upload.repository.impl';
import { StorageModule } from '../../infrastructure/storage/storage.module';

@Module({
  imports: [PrismaModule, StorageModule],
  controllers: [FileUploadController],
  providers: [
    FileUploadService,
    { provide: FILE_UPLOAD_REPOSITORY, useClass: FileUploadRepositoryImpl },
  ],
  exports: [FileUploadService],
})
export class FileUploadModule {}
