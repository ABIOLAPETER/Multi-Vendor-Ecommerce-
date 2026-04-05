import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import * as bcrypt from "bcryptjs";
import * as crypto from "crypto";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService
  ) {}

  async register(data: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictException("User with this email already exists");
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const newUser = await this.prisma.user.create({
      data: {
        email:     data.email,
        passwordHash,
        firstName: data.firstName,
        lastName:  data.lastName,
        phone:     data.phone,
        role:      data.role,
      },
      select: {
        id:        true,
        email:     true,
        firstName: true,
        lastName:  true,
        phone:     true,
        role:      true,
      },
    });

    return newUser;
  }

  async login(data: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid email or password");
    }

    // Revoke all existing refresh tokens
    await this.prisma.refreshToken.updateMany({
      where: { userId: user.id, revoked: false },
      data:  { revoked: true },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      user: {
        id:        user.id,
        email:     user.email,
        firstName: user.firstName,
        lastName:  user.lastName,
        role:      user.role,
      },
      ...tokens,
    };
  }

  async refreshTokens(rawToken: string) {
    const hashedToken = this.hashToken(rawToken);

    const storedToken = await this.prisma.refreshToken.findUnique({
      where:   { token: hashedToken },
      include: { user: true },
    });

    if (!storedToken || storedToken.revoked || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException("Invalid or expired refresh token");
    }

    // Revoke used token
    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data:  { revoked: true },
    });

    const tokens = await this.generateTokens(
      storedToken.user.id,
      storedToken.user.email,
      storedToken.user.role
    );

    return tokens;
  }

  async logout(rawToken: string) {
    const hashedToken = this.hashToken(rawToken);

    await this.prisma.refreshToken.updateMany({
      where: { token: hashedToken },
      data:  { revoked: true },
    });

    return { message: "Logged out successfully" };
  }

  // ── Private helpers ────────────────────────────────────────────────────

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const accessToken = this.jwtService.sign({ sub: userId, email, role });

    const refreshToken       = crypto.randomBytes(64).toString('hex');
    const hashedRefreshToken = this.hashToken(refreshToken);

    await this.prisma.refreshToken.create({
      data: {
        token:     hashedRefreshToken,
        userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { accessToken, refreshToken };
  }
}