import { Controller, Post, Body, HttpCode, HttpStatus, UnauthorizedException, ConflictException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: any) {
    if (!body.email || !body.password) {
      throw new BadRequestException({
        error: { code: 'BAD_REQUEST', message: 'Email and password are required' }
      });
    }
    
    const result = await this.authService.login(body.email, body.password);
    if (!result) {
      throw new UnauthorizedException({
        error: { code: 'UNAUTHORIZED', message: 'Invalid credentials' }
      });
    }

    if (result.user.status === 'suspended') {
      throw new ForbiddenException({
        error: { code: 'FORBIDDEN', message: 'Account suspended' }
      });
    }

    return result;
  }

  @Post('register')
  @HttpCode(HttpStatus.OK)
  async register(@Body() body: any) {
    if (!body.email || !body.password || !body.name) {
      throw new BadRequestException({
        error: { code: 'BAD_REQUEST', message: 'Email, name, and password are required' }
      });
    }

    try {
      const result = await this.authService.register(body.email, body.password, body.name);
      return result;
    } catch (e) {
      if (e.message === 'Email exists') {
        throw new ConflictException({
          error: { code: 'CONFLICT', message: 'Email already exists' }
        });
      }
      throw e;
    }
  }
}
