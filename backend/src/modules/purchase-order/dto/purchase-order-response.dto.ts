import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PurchaseDetailResponseDto } from '../../purchase-detail/dto/purchase-detail-response.dto';

export class PurchaseOrderResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  supplierId!: string;

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

  @ApiProperty({ type: [PurchaseDetailResponseDto] })
  details!: PurchaseDetailResponseDto[];
}
