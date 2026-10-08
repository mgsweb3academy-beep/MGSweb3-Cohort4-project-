// apps/api/src/modules/auth/auth.service.ts
import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UserRole } from 'types';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(data: { name: string; email: string; password?: string; role?: UserRole }) {
    const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new BadRequestException({ error: { code: 'EMAIL_EXISTS', message: 'Email address is already in use' } });
    }

    const passwordHash = data.password ? await bcrypt.hash(data.password, 10) : undefined;
    const user = await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        role: data.role || 'student',
      },
    });

    const token = this.generateToken(user.id, user.email, user.role);
    return { user: this.sanitizeUser(user), token };
  }

  async login(data: { email: string; password?: string }) {
    const user = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } });
    }

    const isMatch = await bcrypt.compare(data.password || '', user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } });
    }

    if (user.status === 'suspended') {
      throw new UnauthorizedException({ error: { code: 'ACCOUNT_SUSPENDED', message: 'Account has been suspended' } });
    }

    const token = this.generateToken(user.id, user.email, user.role);
    return { user: this.sanitizeUser(user), token };
  }

  async handleGithubOAuth(code: string) {
    // Simulated GitHub OAuth flow for contract completeness
    const mockGithubUser = {
      githubUsername: 'web3developer',
      email: 'dev@github.com',
      name: 'GitHub Dev',
      avatarUrl: 'https://github.com/identicons/web3developer.png',
    };

    let user = await this.prisma.user.findFirst({
      where: { OR: [{ email: mockGithubUser.email }, { githubUsername: mockGithubUser.githubUsername }] },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          name: mockGithubUser.name,
          email: mockGithubUser.email,
          githubUsername: mockGithubUser.githubUsername,
          avatarUrl: mockGithubUser.avatarUrl,
          role: 'student',
        },
      });
    }

    const token = this.generateToken(user.id, user.email, user.role);
    return { user: this.sanitizeUser(user), token };
  }

  async linkWallet(userId: string, address: string) {
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { walletAddress: address.toLowerCase() },
    });

    return { user: this.sanitizeUser(updatedUser) };
  }

  private generateToken(userId: string, email: string, role: string) {
    return this.jwtService.sign({ sub: userId, email, role });
  }

  private sanitizeUser(user: any) {
    const { passwordHash, ...sanitized } = user;
    return sanitized;
  }
}
