import { ApiPropertyOptional } from '@nestjs/swagger';

export class FileQueryDto {
  @ApiPropertyOptional({ default: 1 })
  page?: number;

  @ApiPropertyOptional({ default: 20 })
  limit?: number;
}
