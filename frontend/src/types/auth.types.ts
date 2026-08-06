export interface Role {
  id?: string;
  name: 'ADMIN' | 'MANAGER' | 'WAREHOUSE_STAFF' | 'SALES_STAFF' | string;
}

export interface AuthUser {
  id: string;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  roles?: Role[];
  permissions: string[];
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  phone?: string;
  roleName: 'MANAGER' | 'WAREHOUSE_STAFF' | 'SALES_STAFF';
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: AuthUser;
}
