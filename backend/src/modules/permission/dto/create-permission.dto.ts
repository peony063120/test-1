import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({ example: 'user.read' })
  @IsString()
  @MinLength(3)
  code!: string;

  @ApiProperty({ example: 'Read users' })
  @IsString()
  @MinLength(3)
  name!: string;

  @ApiPropertyOptional({ example: 'Permission to read users' })
  @IsOptional()
  @IsString()
  description?: string;
}
