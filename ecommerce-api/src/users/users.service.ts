
import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateUserDto } from "./dtos/user.dto";


@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService,
    ) {}
        
  // get user profile by id
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });
    if (!user) {
        throw new NotFoundException("User not found");
    }
    return user;

  }

  async updateProfile(userId: string, data: UpdateUserDto) {
  const user = await this.prisma.user.findUnique({ where: { id: userId } });
  
  if (!user) throw new NotFoundException("User not found");

  return this.prisma.user.update({
    where: { id: userId },
    data: {
      firstName: data.firstName ?? user.firstName,
      lastName: data.lastName ?? user.lastName,
      phone: data.phone ?? user.phone,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
    }
  });
}
}