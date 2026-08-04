export class BrandEntity {
  id?: string;
  name!: string;
  description?: string | null;
  logo?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
  products?: any[];
}
