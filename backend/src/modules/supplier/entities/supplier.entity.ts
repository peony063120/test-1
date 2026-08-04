export class SupplierEntity {
  id?: string;
  companyName!: string;
  contactName?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  taxCode?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
  products?: any[];
  purchaseOrders?: any[];
}
