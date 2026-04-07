import {
  Controller,
  Get,
  Post,
  Patch,         
  Param,
  Body,
  Query,         
  UseGuards,
} from "@nestjs/common";
import { VendorsService } from "./vendors.service";
import { ApplyVendorDto, UpdateVendorDto } from "./dtos/vendor.dto";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Public } from "../common/decorators/public.decorator";      
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";           
import { Roles } from "../common/decorators/roles.decorator";
import { Role, VendorStatus } from "@prisma/client";


@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("vendors")
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Roles(Role.BUYER)
  @Post("apply")
  async applyForVendor(@CurrentUser() user, @Body() data: ApplyVendorDto) {
    return this.vendorsService.applyForVendor(user.id, data);
  }

  @Roles(Role.VENDOR)
  @Get("me")
  async getMyVendorProfile(@CurrentUser() user) {
    return this.vendorsService.getMyVendorProfile(user.id);
  }

  
  @Public()
  @Get(":id")
  async getVendorById(@Param("id") id: string) {  // ✅ @Param('id') not @Param()
    return this.vendorsService.getVendorById(id);
  }

  @Roles(Role.VENDOR)
  @Patch("me")
  async updateMyVendorProfile(
    @CurrentUser() user,
    @Body() data: UpdateVendorDto
  ) {
    return this.vendorsService.updateMyVendorProfile(user.id, data);
  }

 
  @Roles(Role.ADMIN)
  @Get()
  async listVendors(@Query("status") status?: VendorStatus) {
    return this.vendorsService.listVendors(status);
  }

  @Roles(Role.ADMIN)
  @Patch(":id/approve")
  async approveVendor(@Param("id") id: string) {
    return this.vendorsService.approveVendor(id);
  }

  @Roles(Role.ADMIN)
  @Patch(":id/suspend")
  async suspendVendor(@Param("id") id: string) {
    return this.vendorsService.suspendVendor(id);
  }
}