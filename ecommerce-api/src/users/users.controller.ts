import { Controller, Get, Patch, Req, UseGuards } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UpdateUserDto } from "./dtos/user.dto";
import { Body } from "@nestjs/common";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@UseGuards(JwtAuthGuard)
@Controller("users")
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get("profile")
    async getProfile(@CurrentUser() user) {
        return this.usersService.getProfile(user.id);
    }

    @Patch("profile")
    async updateProfile(@CurrentUser() user, @Body() data: UpdateUserDto) {
        return this.usersService.updateProfile(user.id, data);
    }
}