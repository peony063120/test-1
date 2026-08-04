import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class AdjustInventoryDto {
  @ApiProperty({ example: 10 })
  @IsInt()
  @Min(1)
  quantity!: number;

  @ApiProperty({ example: 'Restocked from supplier' })
  reason?: string;
}
