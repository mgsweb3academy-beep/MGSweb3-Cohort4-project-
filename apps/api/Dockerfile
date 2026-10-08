FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY packages/types ./packages/types
COPY apps/api ./apps/api

WORKDIR /app/apps/api
RUN npm install
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
COPY --from=builder /app/apps/api/package*.json ./
COPY --from=builder /app/apps/api/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/prisma ./prisma

EXPOSE 3001
CMD ["node", "dist/main.js"]
