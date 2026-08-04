import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateTransactionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  inventoryId!: string;

  @ApiProperty({ example: 'IMPORT' })
  @IsString()
  @IsNotEmpty()
  transactionType!: string;

  @ApiProperty({ example: 10 })
  @IsInt()
  @Min(0)
  quantity!: number;

  @ApiProperty({ example: 5 })
  @IsInt()
  beforeQuantity!: number;

  @ApiProperty({ example: 15 })
  @IsInt()
  afterQuantity!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  referenceId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  createdBy?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}
