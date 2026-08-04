import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UserQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional() 
  @IsOptional()
  @IsString()
  sort?: string;

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  filter?: {
    username?: string;
    email?: string;
    status?: string;
  };
}
