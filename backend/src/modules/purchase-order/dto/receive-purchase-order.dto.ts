import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ReceivePurchaseOrderDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}
