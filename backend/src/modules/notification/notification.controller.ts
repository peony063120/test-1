import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationQueryDto } from './dto/notification-query.dto';
import { RequestUser } from '../../common/decorators/request-user.decorator';

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
@UseGuards(AuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles('notification.read')
  @ApiOperation({ summary: 'Get notifications for the current user' })
  findByUser(@RequestUser() user: any, @Query() query: NotificationQueryDto) {
    return this.notificationService.findByUser(user.id, query);
  }

  @Get('unread-count')
  @UseGuards(RolesGuard)
  @Roles('notification.read')
  @ApiOperation({ summary: 'Count unread notifications' })
  countUnread(@RequestUser() user: any) {
    return this.notificationService.countUnread(user.id);
  }

  @Patch(':id/read')
  @UseGuards(RolesGuard)
  @Roles('notification.update')
  @ApiOperation({ summary: 'Mark a notification as read' })
  markAsRead(@Param('id') id: string, @RequestUser() user: any) {
    return this.notificationService.markAsRead(id, user.id);
  }

  @Patch('read-all')
  @UseGuards(RolesGuard)
  @Roles('notification.update')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  markAllAsRead(@RequestUser() user: any) {
    return this.notificationService.markAllAsRead(user.id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('notification.create')
  @ApiOperation({ summary: 'Create a notification for a user' })
  create(@Body() dto: CreateNotificationDto) {
    return this.notificationService.create(dto.userId, dto.title, dto.content);
  }
}
