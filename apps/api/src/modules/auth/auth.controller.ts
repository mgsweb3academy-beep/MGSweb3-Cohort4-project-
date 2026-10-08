// apps/api/src/modules/auth/auth.controller.ts
import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() body: { name: string; email: string; password?: string; role?: any }) {
    return this.authService.register(body);
  }

  @Post('login')
  async login(@Body() body: { email: string; password?: string }) {
    return this.authService.login(body);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: any) {
    return user;
  }

  @Post('github')
  async githubOAuth(@Body() body: { code: string }) {
    return this.authService.handleGithubOAuth(body.code);
  }

  @Post('wallet/link')
  @UseGuards(JwtAuthGuard)
  async linkWallet(@CurrentUser() user: any, @Body() body: { address: string }) {
    return this.authService.linkWallet(user.id, body.address);
  }
}
