import { Test, TestingModule } from '@nestjs/testing';
import { FileUploadService } from './file-upload.service';
import { FILE_UPLOAD_REPOSITORY } from './repositories/file-upload.repository.interface';
import { StorageService } from '../../infrastructure/storage/storage.service';

describe('FileUploadService', () => {
  let service: FileUploadService;
  let repository: { save: jest.Mock; findById: jest.Mock; findAll: jest.Mock; delete: jest.Mock };
  let storage: { upload: jest.Mock; delete: jest.Mock; getSignedUrl: jest.Mock };

  beforeEach(async () => {
    repository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      delete: jest.fn(),
    };
    storage = {
      upload: jest.fn(),
      delete: jest.fn(),
      getSignedUrl: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileUploadService,
        { provide: FILE_UPLOAD_REPOSITORY, useValue: repository },
        { provide: StorageService, useValue: storage },
      ],
    }).compile();

    service = module.get<FileUploadService>(FileUploadService);
  });

  it('uploads a file', async () => {
    storage.upload.mockResolvedValue('http://example.com/file');
    repository.save.mockResolvedValue({ id: 'f1' });
    const file = { originalname: 'a.txt', mimetype: 'text/plain', size: 12 } as any;
    await expect(service.upload(file, 'u1')).resolves.toEqual({ id: 'f1' });
  });
});
