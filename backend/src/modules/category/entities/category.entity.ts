export class CategoryEntity {
  id?: string;
  parentId?: string | null;
  name!: string;
  description?: string | null;
  image?: string | null;
  status!: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
  parent?: CategoryEntity | null;
  children?: CategoryEntity[];
  products?: any[];
}
