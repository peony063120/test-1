import { Controller, Delete, Get, Param, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { FileUploadService } from './file-upload.service';
import { FileQueryDto } from './dto/file-query.dto';
import { RequestUser } from '../../common/decorators/request-user.decorator';

@ApiTags('files')
@ApiBearerAuth()
@Controller('files')
@UseGuards(AuthGuard)
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post('upload')
  @UseGuards(RolesGuard)
  @Roles('file.upload')
  @ApiOperation({ summary: 'Upload a file' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  upload(@UploadedFile() file: any, @RequestUser() user: any) {
    return this.fileUploadService.upload(file, user?.id);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('file.read')
  @ApiOperation({ summary: 'List files' })
  findAll(@Query() query: FileQueryDto) {
    return this.fileUploadService.findAll(query);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('file.read')
  @ApiOperation({ summary: 'Get file metadata by id' })
  findById(@Param('id') id: string) {
    return this.fileUploadService.findById(id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('file.delete')
  @ApiOperation({ summary: 'Delete a file' })
  delete(@Param('id') id: string) {
    return this.fileUploadService.delete(id);
  }
}
