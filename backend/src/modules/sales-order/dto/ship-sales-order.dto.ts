import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ShipSalesOrderDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}
