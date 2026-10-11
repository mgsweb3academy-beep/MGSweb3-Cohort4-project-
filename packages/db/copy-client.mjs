import { cpSync } from 'node:fs';
cpSync('prisma/generated', 'dist/prisma/generated', { recursive: true });
