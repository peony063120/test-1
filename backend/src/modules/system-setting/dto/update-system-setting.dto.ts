import { ApiProperty } from '@nestjs/swagger';

export class UpdateSystemSettingDto {
  @ApiProperty()
  value: any;
}
