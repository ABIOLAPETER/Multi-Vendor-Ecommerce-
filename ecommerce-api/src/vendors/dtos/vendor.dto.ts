// vendor.dto.ts
import { IsString, IsOptional, IsUrl } from "class-validator";

export class ApplyVendorDto {
  @IsString()
  shopName!: string;

  @IsOptional()
  @IsString()
  shopDescription?: string;

  @IsOptional()
  @IsUrl()
  shopLogo?: string;
}

export class UpdateVendorDto {
  @IsOptional()
  @IsString()
  shopName?: string;

  @IsOptional()
  @IsString()
  shopDescription?: string;

  @IsOptional()
  @IsUrl()
  shopLogo?: string;
}