import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

const REGISTERABLE_ROLES = ['WAREHOUSE_STAFF', 'SALES_STAFF', 'MANAGER'] as const;

export class RegisterDto {
  @ApiProperty({ example: 'staff01' })
  @IsString()
  @MinLength(3)
  username!: string;

  @ApiProperty({ example: 'staff01@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'StrongPass123' })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiPropertyOptional({ example: '+84123456789' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ enum: REGISTERABLE_ROLES, example: 'SALES_STAFF' })
  @IsOptional()
  @IsString()
  @IsIn(REGISTERABLE_ROLES)
  roleName?: (typeof REGISTERABLE_ROLES)[number];
}
