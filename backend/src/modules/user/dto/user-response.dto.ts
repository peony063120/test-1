import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RoleResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiPropertyOptional() description?: string;
}

export class UserResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() username!: string;
  @ApiProperty() email!: string;
  @ApiPropertyOptional() phone?: string;
  @ApiPropertyOptional() avatar?: string;
  @ApiProperty() status!: string;
  @ApiPropertyOptional() lastLogin?: Date;
  @ApiProperty({ type: [RoleResponseDto] }) roles!: RoleResponseDto[];
}
