import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ApplyVendorDto, UpdateVendorDto } from "./dtos/vendor.dto";
import { VendorStatus } from "@prisma/client";

@Injectable()
export class VendorsService {
  constructor(private readonly prisma: PrismaService) {}

  async applyForVendor(userId: string, data: ApplyVendorDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    // Separate the "not found" case from the "wrong role" case
    if (!user) throw new NotFoundException("User not found");
    if (user.role !== "BUYER") {
      throw new ForbiddenException("Only buyers can apply to become a vendor");
    }

    const existingVendor = await this.prisma.vendorProfile.findUnique({
      where: { userId },
    });

    // ConflictException is correct here — the resource already exists
    if (existingVendor) {
      throw new ConflictException(
        "A vendor profile already exists for this user"
      );
    }

   
    await this.prisma.$transaction([
      this.prisma.vendorProfile.create({
        data: {
          userId,
          shopName: data.shopName,
          shopDescription: data.shopDescription,
          shopLogo: data.shopLogo,
        },
      }),
      this.prisma.user.update({
        where: { id: userId },
        data: { role: "VENDOR" },
      }),
    ]);

    return { message: "Vendor application submitted successfully" };
  }

  // ✅ This is for GET /vendors/me — looks up by userId (the logged-in user)
  async getMyVendorProfile(userId: string) {
    const vendorProfile = await this.prisma.vendorProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
      },
    });

    if (!vendorProfile) throw new NotFoundException("Vendor profile not found");
    return vendorProfile;
  }

  // ✅ This is for GET /vendors/:id — looks up by the vendor profile's own id (public route)
  async getVendorById(vendorId: string) {
    const vendorProfile = await this.prisma.vendorProfile.findUnique({
      where: { id: vendorId },
      include: {
        user: {
          select: { firstName: true, lastName: true },
        },
      },
    });

    if (!vendorProfile || !vendorProfile.isActive) {
      throw new NotFoundException("Vendor not found");
    }
    return vendorProfile;
  }

  // ✅ Separate UpdateVendorDto where all fields are optional
  async updateMyVendorProfile(userId: string, data: UpdateVendorDto) {
    const vendorProfile = await this.prisma.vendorProfile.findUnique({
      where: { userId },
    });

    if (!vendorProfile) throw new NotFoundException("Vendor profile not found");

    
    return this.prisma.vendorProfile.update({
      where: { userId },
      data: {
        shopName: data.shopName,
        shopDescription: data.shopDescription,
        shopLogo: data.shopLogo,
      },
    });
  }

  async listVendors(status?: VendorStatus) {
    return this.prisma.vendorProfile.findMany({
      where: status ? { status } : {},
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async approveVendor(vendorId: string) {
    const vendorProfile = await this.prisma.vendorProfile.findUnique({
      where: { id: vendorId },
    });

    if (!vendorProfile) throw new NotFoundException("Vendor profile not found");

    // ✅ Guard against redundant transitions
    if (vendorProfile.status === VendorStatus.APPROVED) {
      throw new BadRequestException("Vendor is already approved");
    }

    await this.prisma.vendorProfile.update({
      where: { id: vendorId },
      data: { status: VendorStatus.APPROVED },
    });

    return { message: "Vendor approved successfully" };
  }

  async suspendVendor(vendorId: string) {
    const vendorProfile = await this.prisma.vendorProfile.findUnique({
      where: { id: vendorId },
    });

    if (!vendorProfile) throw new NotFoundException("Vendor profile not found");

    // ✅ Guard against redundant transitions
    if (vendorProfile.status === VendorStatus.SUSPENDED) {
      throw new BadRequestException("Vendor is already suspended");
    }

    await this.prisma.vendorProfile.update({
      where: { id: vendorId },
      data: { status: VendorStatus.SUSPENDED },
    });

    return { message: "Vendor suspended successfully" };
  }
}