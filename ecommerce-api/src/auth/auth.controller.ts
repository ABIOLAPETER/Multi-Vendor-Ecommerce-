import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterDto} from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";



@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('signup')
    async register(@Body() registerDto: RegisterDto ) {
        const user = await this.authService.register(registerDto);
        return{
            success: true,
            message: 'User registered successfully',
            data: user,
        }
    }

    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        const response = await this.authService.login(loginDto);
        return {
            success: true,
            message: 'Login successful',
            data: response,
        }
    }

    @Post('refresh')
    async refresh(@Body('token') rawToken: string) {
        const tokens = await this.authService.refreshTokens(rawToken);
        return {
            success: true,
            message: 'Token refreshed successfully',
            data: tokens
        }
    }

    @Post('logout')
    async logout(@Body('token') rawToken: string) {
        await this.authService.logout(rawToken);
        return {
            success: true,
            message: 'Logout successful',
        }
    }
    
}