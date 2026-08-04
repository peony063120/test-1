import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InventoryResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  productId!: string;

  @ApiProperty()
  warehouseId!: string;

  @ApiProperty()
  quantity!: number;

  @ApiPropertyOptional()
  minimumQuantity?: number;

  @ApiPropertyOptional()
  maximumQuantity?: number;
}
