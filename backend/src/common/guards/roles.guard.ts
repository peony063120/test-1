import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserService } from '../../modules/user/user.service';
import { RedisService } from '../../infrastructure/cache/redis.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly userService: UserService,
    private readonly redisService: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [context.getHandler(), context.getClass()]);
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const req = context.switchToHttp().getRequest<any>();
    const user = req.user;
    if (!user?.id) throw new ForbiddenException('Authentication required');

    const cached = await this.redisService.get<string[]>(`permissions:${user.id}`);
    const permissions = cached || (await this.userService.findPermissionsByUserId(user.id));
    if (!permissions?.length) throw new ForbiddenException('No permissions assigned');

    const hasAccess = requiredRoles.every((role) => permissions.includes(role));
    if (!hasAccess) throw new ForbiddenException('Insufficient permissions');
    return true;
  }
}
