import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { CreateSalesDetailDto } from '../../sales-detail/dto/create-sales-detail.dto';

export class CreateSalesOrderDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  customerId!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  warehouseId!: string;

  @ApiProperty({ type: [CreateSalesDetailDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSalesDetailDto)
  details!: CreateSalesDetailDto[];
}
