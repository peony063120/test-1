export const CUSTOMER_REPOSITORY = Symbol('CUSTOMER_REPOSITORY');

export interface ICustomerRepository {
  save(customer: any): Promise<any>;
  update(id: string, data: Partial<any>): Promise<any>;
  findById(id: string): Promise<any | null>;
  findByEmail(email: string): Promise<any | null>;
  findByPhone(phone: string): Promise<any | null>;
  findAll(query: any): Promise<{ data: any[]; total: number }>;
  softDelete(id: string): Promise<any>;
}
