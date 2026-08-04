import { ApiPropertyOptional } from '@nestjs/swagger';

export class ReportQueryDto {
  @ApiPropertyOptional()
  startDate?: string;

  @ApiPropertyOptional()
  endDate?: string;

  @ApiPropertyOptional()
  productId?: string;

  @ApiPropertyOptional()
  categoryId?: string;

  @ApiPropertyOptional()
  warehouseId?: string;

  @ApiPropertyOptional()
  supplierId?: string;

  @ApiPropertyOptional()
  customerId?: string;
}
