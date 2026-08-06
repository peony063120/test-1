import { Test, TestingModule } from '@nestjs/testing';
import { SystemSettingService } from './system-setting.service';
import { SYSTEM_SETTING_REPOSITORY } from './repositories/system-setting.repository.interface';

describe('SystemSettingService', () => {
  let service: SystemSettingService;
  let repository: { save: jest.Mock; update: jest.Mock; findByKey: jest.Mock; findAll: jest.Mock; delete: jest.Mock };

  beforeEach(async () => {
    repository = {
      save: jest.fn(),
      update: jest.fn(),
      findByKey: jest.fn(),
      findAll: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [SystemSettingService, { provide: SYSTEM_SETTING_REPOSITORY, useValue: repository }],
    }).compile();

    service = module.get<SystemSettingService>(SystemSettingService);
  });

  it('gets a setting', async () => {
    repository.findByKey.mockResolvedValue({ key: 'siteName', value: 'Demo' });
    await expect(service.get('siteName')).resolves.toEqual({ key: 'siteName', value: 'Demo' });
  });

  it('sets a setting', async () => {
    repository.findByKey.mockResolvedValue(null);
    repository.save.mockResolvedValue({ id: 's1' });
    await expect(service.set('siteName', 'Demo')).resolves.toEqual({ id: 's1' });
  });

  it('creates default settings when repository is empty', async () => {
    repository.findAll
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ key: 'system.name', value: 'Product Management System' }]);

    const result = await service.findAll();

    expect(repository.save).toHaveBeenCalled();
    expect(result).toEqual([{ key: 'system.name', value: 'Product Management System' }]);
  });
});
