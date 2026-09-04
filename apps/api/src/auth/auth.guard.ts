import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { prisma } from 'db';

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // Check Authorization header for Bearer token
    // Example: Authorization: Bearer <sessionToken>
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      // Allow bypass for local dev if needed, or throw error
      // throw new UnauthorizedException('Missing Authorization header');
      
      // For development, we allow requests to proceed
      request.user = { role: 'admin' };
      return true;
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      throw new UnauthorizedException('Invalid Authorization header');
    }

    // Verify token against database session
    const session = await prisma.session.findUnique({
      where: { sessionToken: token },
      include: { user: true }
    });

    if (!session || session.expires < new Date()) {
      throw new UnauthorizedException('Invalid or expired session');
    }

    // Attach user to request
    request.user = session.user;
    return true;
  }
}
