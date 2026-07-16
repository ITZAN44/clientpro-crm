/**
 * Resolves the JWT signing secret from the environment.
 *
 * Throws at startup if the secret is missing instead of silently falling back
 * to a hardcoded default. A weak, known default in one place and a different
 * default in another would let the login module, the JWT strategy and the
 * WebSocket gateway sign and verify tokens with mismatched keys — breaking auth
 * in a way that fails silently. Failing loudly forces the secret to be set.
 */
export function getJwtSecret(secret: string | undefined): string {
  if (!secret || secret.trim() === '') {
    throw new Error(
      'JWT_SECRET is not set. Refusing to start with an insecure default. ' +
        'Set JWT_SECRET in the environment (min 32 chars).',
    );
  }
  return secret;
}
