import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAuditLogDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  action: string = '';

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  entity: string = '';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  entityId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  oldValue?: any;

  @ApiPropertyOptional()
  @IsOptional()
  newValue?: any;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ip?: string;
}
