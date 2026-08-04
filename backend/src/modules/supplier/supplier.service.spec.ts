import { Test, TestingModule } from '@nestjs/testing';
import { SupplierService } from './supplier.service';
import { SUPPLIER_REPOSITORY } from './repositories/supplier.repository.interface';
import { AuditLogService } from '../../infrastructure/audit/audit-log.service';

describe('SupplierService', () => {
  let service: SupplierService;
  const repository = {
    save: jest.fn(),
    update: jest.fn(),
    findById: jest.fn(),
    findByCompanyName: jest.fn(),
    findByEmail: jest.fn(),
    findAll: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SupplierService,
        { provide: SUPPLIER_REPOSITORY, useValue: repository },
        { provide: AuditLogService, useValue: { log: jest.fn() } },
      ],
    }).compile();

    service = module.get<SupplierService>(SupplierService);
  });

  it('creates a supplier successfully', async () => {
    repository.findByCompanyName.mockResolvedValue(null);
    repository.findByEmail.mockResolvedValue(null);
    repository.save.mockResolvedValue({ id: '1', companyName: 'Acme Inc' });

    const result = await service.create({ companyName: 'Acme Inc' } as any);

    expect(result.companyName).toBe('Acme Inc');
    expect(repository.save).toHaveBeenCalled();
  });

  it('fails on duplicate company name', async () => {
    repository.findByCompanyName.mockResolvedValue({ id: '1', companyName: 'Acme Inc' });

    await expect(service.create({ companyName: 'Acme Inc' } as any)).rejects.toThrow('Company name already exists');
  });

  it('returns not found for missing supplier', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(service.findById('missing')).resolves.toBeNull();
  });
});
