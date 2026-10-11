# Running and validating the fixes

The web app uses Convex. The NestJS API uses PostgreSQL independently; its GitHub webhooks currently update PostgreSQL tasks, not Convex tasks. This integration still needs a deliberate migration before deploying the full Git-driven product.

## Web configuration

From the repository root:

```powershell
npm install
node scripts/setup-web-auth.mjs
```

Set `NEXT_PUBLIC_CONVEX_URL` in `apps/web/.env.local`. The setup script creates a private signing key and Auth.js secret without printing them. Keep that file private. Set `AUTH_URL` to the exact application origin.

On the **Convex deployment**, configure the same `AUTH_URL` and the **public** `CONVEX_AUTH_JWKS` value from the local file. Never upload `CONVEX_AUTH_PRIVATE_KEY` to Convex. Then run `npx convex dev` from `apps/web` to regenerate bindings and push the schema, functions, and auth provider. Production and previews need matching issuer configuration; do not reuse a localhost issuer for production.

On the **web host**, configure `AUTH_URL`, `AUTH_SECRET`, `NEXT_PUBLIC_CONVEX_URL`, and `CONVEX_AUTH_PRIVATE_KEY`. Configure OAuth provider credentials if using GitHub or Google.

Credential registration creates an unverified student account. Configure `AUTH_EMAIL_DELIVERY_URL` and `AUTH_EMAIL_DELIVERY_SECRET` on Convex to deliver verification/reset emails. The webhook receives a JSON object with `email`, `kind` (`verify` or `reset`), a one-time `token`, and `expiresInMinutes`, with bearer authentication. The mail integration should send a link/form that POSTs the token to `/api/v1/auth/verify` or `/api/v1/auth/reset` (including `newPassword` for reset). Tokens are never returned to the requesting browser. Credential login requires verified email; OAuth proves email ownership and revokes any password attached to an unverified account.

Existing courses and cohorts without `instructorId` need admin assignment through `courses.assignOwner` / `cohorts.assignOwner`. Until assigned, only admins can manage them. On the task board, staff can create teams and invitation links; select a team before creating a link to assign the learner when accepting. Email-bound invitations require a verified email. Shared invitations remain reusable until expiry or admin revocation.

The seed is for development. Supply both `staffPasswordHash` and `studentPasswordHash`; no default student password is embedded. Do not seed production demo accounts.

```powershell
npm run test --workspace=web
npm run typecheck --workspace=web
npm run build --workspace=web
npm run dev --workspace=web
```

The tutor calls the real Python service when `AI_SERVICE_URL` is set. Unimplemented AI endpoints return 503; their demonstration behavior is available only outside production with `ENABLE_DEMO_AI=true`.

## NestJS / PostgreSQL

The SQLite package generates its Prisma client into `packages/db/prisma/generated/client`, preventing it from overwriting the API's PostgreSQL client.

```powershell
npm run prisma:generate --workspace=api
npm run build --workspace=api
```

For Docker, set `JWT_SECRET` and `GITHUB_WEBHOOK_SECRET` in the environment before starting Compose. An optional `OPENAI_API_KEY` enables the AI service. Compose uses `prisma db push` for local database initialization; production should use reviewed migrations.

No live deployment or external account changes are performed by these source fixes. Live sign-in, mail delivery, webhooks and database integration require the configured services above.
