/** DATABASE_URL must be a postgres:// connection string. */
export function validateDatabaseEnv(
  config: Record<string, unknown>,
  errors: string[],
): void {
  const databaseUrl = config.DATABASE_URL;
  if (
    typeof databaseUrl !== 'string' ||
    !/^postgres(ql)?:\/\/.+/.test(databaseUrl)
  ) {
    errors.push('DATABASE_URL must be set to a postgres:// connection string');
  }
}
