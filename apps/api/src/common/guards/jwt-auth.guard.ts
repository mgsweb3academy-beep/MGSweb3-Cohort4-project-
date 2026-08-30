// apps/api/src/common/guards/jwt-auth.guard.ts
import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any) {
    if (err || !user) {
      throw err || new UnauthorizedException({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
    }
    if (user.status === 'suspended') {
      throw new UnauthorizedException({ error: { code: 'ACCOUNT_SUSPENDED', message: 'Account is suspended' } });
    }
    return user;
  }
}
