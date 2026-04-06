import { IsOptional, IsString, Length } from "class-validator";

export class UpdateUserDto {
    @IsString()
    @IsOptional()
    @Length(2, 100)
    firstName?: string;

    @IsString()
    @IsOptional()
    @Length(2, 100)
    lastName?: string;

    @IsOptional()
    @IsString()
    phone?: string;

}