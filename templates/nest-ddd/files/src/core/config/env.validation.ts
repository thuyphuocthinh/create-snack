// @infra:env-imports

/**
 * Fails fast at boot when a required environment variable is missing or malformed,
 * instead of letting a service crash later the first time it actually uses it.
 *
 * Infra modules add their own checks at the marker below (`create-my-stack add <infra>`).
 */
export function validateEnv(
  config: Record<string, unknown>,
): Record<string, unknown> {
  const errors: string[] = [];

  if (config.PORT !== undefined) {
    const port = Number(config.PORT);
    if (!Number.isInteger(port) || port <= 0 || port > 65535) {
      errors.push('PORT must be a valid integer between 1 and 65535');
    }
  }

  // @infra:env-checks

  if (errors.length > 0) {
    throw new Error(
      `Invalid environment configuration:\n- ${errors.join('\n- ')}`,
    );
  }

  return config;
}
