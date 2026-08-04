export class UserEntity {
  id?: string;
  username!: string;
  password!: string;
  email!: string;
  phone?: string;
  avatar?: string;
  status!: string;
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  roles?: any[];
}
