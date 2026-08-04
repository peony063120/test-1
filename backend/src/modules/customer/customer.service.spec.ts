import { Test, TestingModule } from '@nestjs/testing';
import { CustomerService } from './customer.service';
import { CUSTOMER_REPOSITORY } from './repositories/customer.repository.interface';
import { AuditLogService } from '../../infrastructure/audit/audit-log.service';

describe('CustomerService', () => {
  let service: CustomerService;
  const repository = {
    save: jest.fn(),
    update: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn(),
    findByPhone: jest.fn(),
    findAll: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerService,
        { provide: CUSTOMER_REPOSITORY, useValue: repository },
        { provide: AuditLogService, useValue: { log: jest.fn().mockResolvedValue(true) } },
      ],
    }).compile();

    service = module.get<CustomerService>(CustomerService);
    jest.clearAllMocks();
  });

  it('creates a customer', async () => {
    repository.save.mockResolvedValue({ id: '1', name: 'Alice' });
    await expect(service.create({ name: 'Alice' })).resolves.toEqual({ id: '1', name: 'Alice' });
  });
});
