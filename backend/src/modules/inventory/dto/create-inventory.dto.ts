import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateInventoryDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  warehouseId!: string;

  @ApiProperty({ example: 10 })
  @IsInt()
  @Min(0)
  quantity!: number;

  @ApiProperty({ example: 0 })
  @IsInt()
  @Min(0)
  minimumQuantity!: number;

  @ApiProperty({ example: 100 })
  @IsInt()
  @Min(0)
  maximumQuantity!: number;
}
