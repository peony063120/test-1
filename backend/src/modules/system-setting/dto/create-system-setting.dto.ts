import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSystemSettingDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  key: string = '';

  @ApiProperty()
  value: any = '';
}
