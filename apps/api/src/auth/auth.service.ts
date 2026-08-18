import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async login(email: string, password: string) {
    // In a real app we'd compare password hashes.
    // Here we'll mock verify by checking if the user exists.
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return null;
    }

    // Since this is just Part 14 scaffolding, we skip password validation
    // because passwordHash isn't in the base User model in schema.prisma.
    
    return {
      token: `jwt-token-${user.id}`,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    };
  }

  async register(email: string, password: string, name: string) {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new Error('Email exists');
    }

    const user = await this.prisma.user.create({
      data: {
        email,
        name,
        role: 'student',
        status: 'active',
      },
    });

    return {
      token: `jwt-token-${user.id}`,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    };
  }
}
