import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNotificationDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  userId: string = '';

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string = '';

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  content: string = '';

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  type?: string;
}
