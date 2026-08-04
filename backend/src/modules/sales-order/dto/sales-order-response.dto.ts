import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SalesDetailResponseDto } from '../../sales-detail/dto/sales-detail-response.dto';

export class SalesOrderResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  customerId!: string;

  @ApiProperty()
  warehouseId!: string;

  @ApiProperty()
  status!: string;

  @ApiPropertyOptional()
  totalAmount?: number;

  @ApiPropertyOptional()
  createdBy?: string;

  @ApiPropertyOptional()
  createdAt?: Date;

  @ApiProperty({ type: [SalesDetailResponseDto] })
  details!: SalesDetailResponseDto[];
}
