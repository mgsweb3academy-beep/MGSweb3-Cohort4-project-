# Build context is the repository root (see docker-compose.yml): the API is an npm workspace
# member that depends on packages/types, so the root manifests and lockfile are required.
FROM node:20-alpine AS builder
RUN apk add --no-cache openssl python3 make g++
WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/types ./packages/types
COPY packages/ui/package.json ./packages/ui/package.json
COPY packages/db/package.json ./packages/db/package.json
COPY apps/api ./apps/api
# apps/web is a workspace too; only its manifest is needed to resolve the lockfile.
COPY apps/web/package.json ./apps/web/package.json
COPY apps/ai-service/requirements.txt ./apps/ai-service/requirements.txt

# --ignore-scripts skips the root postinstall, which generates packages/db's SQLite Prisma client
# into the shared @prisma/client. The API's PostgreSQL client must be the last one generated.
RUN npm install --workspace=apps/api --ignore-scripts
# bcrypt needs its native binding; the skipped workspace lifecycle must not skip this dependency.
RUN npm rebuild bcrypt --workspace=apps/api
RUN npm run prisma:generate --workspace=apps/api
RUN npm run build --workspace=apps/api

FROM node:20-alpine AS runner
RUN apk add --no-cache openssl
WORKDIR /app/apps/api

ENV NODE_ENV=production
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/apps/api/node_modules ./node_modules
COPY --from=builder /app/packages/types /app/packages/types
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/prisma ./prisma
COPY --from=builder /app/apps/api/package.json ./package.json

EXPOSE 3001
CMD ["node", "dist/main.js"]
