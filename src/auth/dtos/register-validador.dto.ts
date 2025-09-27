import { IsString } from 'class-validator';
import { RegisterUserDto } from './register-user.dto';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterValidadorDto extends RegisterUserDto {
  @ApiProperty()
  @IsString()
  nombre: string;
}
