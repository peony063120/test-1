import { SupplierEntity } from '../entities/supplier.entity';

export const SUPPLIER_REPOSITORY = Symbol('SUPPLIER_REPOSITORY');

export interface ISupplierRepository {
  save(supplier: SupplierEntity): Promise<SupplierEntity>;
  update(id: string, supplier: Partial<SupplierEntity>): Promise<SupplierEntity>;
  findById(id: string): Promise<SupplierEntity | null>;
  findByCompanyName(companyName: string): Promise<SupplierEntity | null>;
  findByEmail(email: string): Promise<SupplierEntity | null>;
  findAll(query: any): Promise<{ data: SupplierEntity[]; total: number }>;
  softDelete(id: string): Promise<SupplierEntity>;
}
