import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TransactionResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  inventoryId!: string;

  @ApiProperty()
  transactionType!: string;

  @ApiProperty()
  quantity!: number;

  @ApiProperty()
  beforeQuantity!: number;

  @ApiProperty()
  afterQuantity!: number;

  @ApiPropertyOptional()
  referenceId?: string;

  @ApiPropertyOptional()
  createdBy?: string;

  @ApiPropertyOptional()
  createdAt?: Date;
}
