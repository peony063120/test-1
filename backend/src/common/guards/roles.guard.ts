import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { RedisService } from '../../infrastructure/cache/redis.service';
import { PrismaService } from '../../database/prisma/prisma.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly redisService: RedisService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [context.getHandler(), context.getClass()]);
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const req = context.switchToHttp().getRequest<any>();
    const user = req.user;
    if (!user?.id) throw new ForbiddenException('Authentication required');

    // Try to get from Redis cache first
    let permissions = await this.redisService.get<string[]>(`permissions:${user.id}`);
    
    // If not cached, query Prisma directly
    if (!permissions) {
      const userData = await this.prisma.user.findUnique({
        where: { id: user.id },
        include: { roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } } },
      });
      permissions = userData?.roles?.flatMap((ur: any) => ur.role?.permissions?.map((rp: any) => rp.permission?.code).filter((code: any) => code) || []) || [];
      if (permissions.length > 0) {
        await this.redisService.set(`permissions:${user.id}`, permissions, 3600);
      }
    }

    if (!permissions?.length) throw new ForbiddenException('No permissions assigned');
    const hasAccess = requiredRoles.every((role) => permissions.includes(role));
    if (!hasAccess) throw new ForbiddenException('Insufficient permissions');
    return true;
  }
}
