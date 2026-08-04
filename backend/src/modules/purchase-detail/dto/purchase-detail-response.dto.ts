import { ApiProperty } from '@nestjs/swagger';

export class PurchaseDetailResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  productId!: string;

  @ApiProperty()
  quantity!: number;

  @ApiProperty()
  price!: number;
}
