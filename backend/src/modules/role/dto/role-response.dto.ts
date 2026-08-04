import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PermissionSummaryDto {
  @ApiProperty() id!: string;
  @ApiProperty() code!: string;
  @ApiProperty() name!: string;
}

export class RoleResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiPropertyOptional() description?: string;
  @ApiProperty({ type: [PermissionSummaryDto] }) permissions!: PermissionSummaryDto[];
}
