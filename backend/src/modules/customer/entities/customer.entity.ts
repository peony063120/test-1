export class CustomerEntity {
  id?: string;
  name!: string;
  phone?: string;
  email?: string;
  address?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}
