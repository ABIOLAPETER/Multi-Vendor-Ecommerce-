import { IsEmail, IsString, Length, IsOptional, IsEnum } from 'class-validator';
import { Role } from '@prisma/client';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @Length(6, 100)
  password!: string;

  @IsString()
  @Length(2, 100)
  firstName!: string;

  @IsString()
  @Length(2, 100)
  lastName!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}