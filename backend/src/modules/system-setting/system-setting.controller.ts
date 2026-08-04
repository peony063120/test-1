import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { SystemSettingService } from './system-setting.service';
import { CreateSystemSettingDto } from './dto/create-system-setting.dto';
import { UpdateSystemSettingDto } from './dto/update-system-setting.dto';

@ApiTags('system-settings')
@ApiBearerAuth()
@Controller('system-settings')
@UseGuards(AuthGuard)
export class SystemSettingController {
  constructor(private readonly systemSettingService: SystemSettingService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles('setting.read')
  @ApiOperation({ summary: 'List system settings' })
  findAll() {
    return this.systemSettingService.findAll();
  }

  @Get(':key')
  @UseGuards(RolesGuard)
  @Roles('setting.read')
  @ApiOperation({ summary: 'Get a system setting by key' })
  get(@Param('key') key: string) {
    return this.systemSettingService.get(key);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('setting.create')
  @ApiOperation({ summary: 'Create a system setting' })
  set(@Body() dto: CreateSystemSettingDto) {
    return this.systemSettingService.set(dto.key, dto.value);
  }

  @Put(':key')
  @UseGuards(RolesGuard)
  @Roles('setting.update')
  @ApiOperation({ summary: 'Update a system setting' })
  update(@Param('key') key: string, @Body() dto: UpdateSystemSettingDto) {
    return this.systemSettingService.set(key, dto.value);
  }

  @Delete(':key')
  @UseGuards(RolesGuard)
  @Roles('setting.delete')
  @ApiOperation({ summary: 'Delete a system setting' })
  delete(@Param('key') key: string) {
    return this.systemSettingService.delete(key);
  }
}
