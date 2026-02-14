import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { LoginRequestDto } from '../dto/login-request.dto';
import { Public } from '../decorator/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  login(@Body() dto: LoginRequestDto) {
    return this.authService.login(dto);
  }
}

