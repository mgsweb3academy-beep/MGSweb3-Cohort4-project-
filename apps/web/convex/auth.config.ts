import type { AuthConfig } from 'convex/server';

export default {
  providers: [{
    type: 'customJwt', applicationID: 'corridor', algorithm: 'RS256',
    issuer: process.env.AUTH_URL!,
    jwks: process.env.CONVEX_AUTH_JWKS!,
  }],
} satisfies AuthConfig;
