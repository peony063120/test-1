import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { RedisService } from '../../infrastructure/cache/redis.service';
import { AuditLogService } from '../../infrastructure/audit/audit-log.service';
import { PrismaService } from '../../database/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

const REGISTRATION_ROLE_PERMISSIONS: Record<string, string[]> = {
  ADMIN: [
    // Dashboard permissions
    'dashboard.read',
    'dashboard.admin',
    // Product permissions
    'product.read',
    'product.create',
    'product.update',
    'product.delete',
    // Inventory permissions
    'inventory.read',
    'inventory.adjust',
    'inventory.transfer',
    'inventory.export',
    // Purchase permissions
    'purchase.read',
    'purchase.create',
    'purchase.update',
    'purchase.delete',
    'purchase.approve',
    'purchase.receive',
    // Sales permissions
    'sales.read',
    'sales.create',
    'sales.update',
    'sales.delete',
    'sales.ship',
    'sales.cancel',
    // Customer permissions
    'customer.read',
    'customer.create',
    'customer.update',
    'customer.delete',
    // Supplier permissions
    'supplier.read',
    'supplier.create',
    'supplier.update',
    'supplier.delete',
    // Category and Brand permissions
    'category.read',
    'category.create',
    'category.update',
    'category.delete',
    'brand.read',
    'brand.create',
    'brand.update',
    'brand.delete',
    // Warehouse permissions
    'warehouse.read',
    'warehouse.create',
    'warehouse.update',
    'warehouse.delete',
    // Stock and transaction permissions
    'stock-transaction.read',
    'stock-transaction.export',
    // Report permissions
    'report.view',
    'report.export',
    // Role and permission management
    'role.manage',
    'permission.manage',
    'user.manage',
    // Audit permissions
    'audit.read',
    'audit.export',
    // Notification permissions
    'notification.read',
    'notification.create',
    // System settings
    'setting.read',
    'setting.write',
  ],
  SALES_STAFF: [
    'dashboard.read',
    'product.read',
    'inventory.read',
    'sales.read',
    'sales.create',
    'sales.update',
    'customer.read',
    'customer.create',
    'notification.read',
  ],
  WAREHOUSE_STAFF: [
    'dashboard.read',
    'product.read',
    'inventory.read',
    'inventory.adjust',
    'purchase.read',
    'purchase.create',
    'purchase.update',
    'purchase.receive',
    'supplier.read',
    'supplier.create',
    'supplier.update',
    'warehouse.read',
    'stock-transaction.read',
    'notification.read',
  ],
  MANAGER: [
    'dashboard.read',
    'report.view',
    'product.read',
    'inventory.read',
    'purchase.read',
    'sales.read',
    'stock-transaction.read',
    'supplier.read',
    'warehouse.read',
    'category.read',
    'brand.read',
    'customer.read',
    'audit.read',
    'notification.read',
    'setting.read',
  ],
};

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly auditLogService: AuditLogService,
    private readonly prisma: PrismaService,
  ) {}

  async initializeRolePermissions() {
    for (const [roleName, permissionCodes] of Object.entries(REGISTRATION_ROLE_PERMISSIONS)) {
      try {
        await this.getRegistrationRoleId(roleName);
      } catch (error) {
        console.error(`Failed to initialize permissions for role ${roleName}:`, error);
      }
    }
  }

  async register(dto: RegisterDto) {
    const existingByUsername = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });
    if (existingByUsername) {
      throw new BadRequestException('Username already exists');
    }

    const existingByEmail = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingByEmail) {
      throw new BadRequestException('Email already exists');
    }

    const roleId = await this.getRegistrationRoleId(dto.roleName || 'SALES_STAFF');
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const created = await this.prisma.user.create({
      data: {
        username: dto.username,
        passwordHash,
        email: dto.email,
        phone: dto.phone,
        roles: {
          create: [{ roleId }],
        },
      },
      include: { roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } } },
    });

    if (!created?.id) {
      throw new UnauthorizedException('Registration failed');
    }

    return this.buildAuthResponse(created as any);
  }

  async validateUser(username: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: username.includes('@') ? { email: username } : { username },
      include: { roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } } },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const isValid = await this.verifyPassword(password, user.passwordHash || '');
    if (!isValid) throw new UnauthorizedException('Invalid credentials');
    return user;
  }

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto.username, dto.password);
    return this.buildAuthResponse(user as any);
  }

  async refreshToken(token: string) {
    const payload = this.jwtService.verify(token, { secret: this.configService.get<string>('JWT_REFRESH_SECRET') || 'default-secret-refresh' });
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } } },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const authPayload = await this.buildAuthResponse(user as any);
    return { accessToken: authPayload.accessToken, user: authPayload.user };
  }

  async logout(userId: string) {
    await this.redisService.del(`permissions:${userId}`);
    return { success: true };
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new UnauthorizedException('User not found');
    const isValid = await this.verifyPassword(oldPassword, user.passwordHash || '');
    if (!isValid) throw new UnauthorizedException('Current password is incorrect');
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
    await this.auditLogService.log(userId, 'change_password', 'user', userId, null, { passwordChanged: true }, undefined);
    return { success: true };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user) return { success: true };
    const token = this.jwtService.sign({ sub: user.id, purpose: 'reset-password' }, { secret: this.configService.get<string>('JWT_SECRET') || 'default-secret', expiresIn: '1h' });
    return { success: true, token };
  }

  async resetPassword(token: string, newPassword: string) {
    const payload = this.jwtService.verify(token, { secret: this.configService.get<string>('JWT_SECRET') || 'default-secret' });
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: payload.sub },
      data: { passwordHash },
    });
    return { success: true };
  }

  private async getUserPermissions(userId: string) {
    const cached = await this.redisService.get<string[]>(`permissions:${userId}`);
    if (cached) return cached;
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } } },
    });
    if (!user) return [];
    const permissions = (user as any)?.roles?.flatMap((ur: any) => ur.role?.permissions?.map((rp: any) => rp.permission?.code).filter((code: any) => code) || []) || [];
    if (!permissions.length) {
      return [];
    }
    await this.redisService.set(`permissions:${userId}`, permissions, 3600);
    return permissions;
  }

  private async verifyPassword(password: string, storedHash: string) {
    if (!storedHash) return false;

    return bcrypt.compare(password, storedHash);
  }

  private async buildAuthResponse(user: any) {
    const permissions = await this.getUserPermissions(user.id || '');
    const roles = user.roles?.map((ur: any) => ur.role?.name) || [];
    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      roles,
    };
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET') || 'default-secret',
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') || '15m',
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET') || 'default-secret-refresh',
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d',
    });

    await this.redisService.set(`permissions:${user.id}`, permissions, 3600);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        roles,
        permissions,
      },
    };
  }

  private async getRegistrationRoleId(roleName: string) {
    const permissionCodes = REGISTRATION_ROLE_PERMISSIONS[roleName];
    if (!permissionCodes?.length) {
      throw new BadRequestException(`Role ${roleName} is not available for registration`);
    }

    const role = await this.prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: {
        name: roleName,
        description: roleName.split('_').join(' ').toLowerCase(),
      },
    });

    for (const permissionCode of permissionCodes) {
      const permission = await this.prisma.permission.upsert({
        where: { code: permissionCode },
        update: {},
        create: {
          code: permissionCode,
          name: permissionCode,
        },
      });

      await this.prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: role.id,
          permissionId: permission.id,
        },
      });
    }

    return role.id;
  }
}
