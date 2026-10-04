const JOB_PAYLOAD_SECRET_MIN_LENGTH = 32;
// `log` only prints messages, so it is for development; `smtp` works everywhere.
const EMAIL_PROVIDERS = ['log', 'smtp'];
const DEV_ONLY_EMAIL_PROVIDERS = ['log'];

const present = (config: Record<string, unknown>, name: string) =>
  typeof config[name] === 'string' && (config[name] as string).trim() !== '';

export function validateEmailEnv(
  config: Record<string, unknown>,
  errors: string[],
): void {
  const secret = config.JOB_PAYLOAD_SECRET;
  if (typeof secret !== 'string' || secret.length < JOB_PAYLOAD_SECRET_MIN_LENGTH) {
    errors.push(
      `JOB_PAYLOAD_SECRET must be set to a string of at least ${JOB_PAYLOAD_SECRET_MIN_LENGTH} characters`,
    );
  }

  const provider = (config.EMAIL_PROVIDER ?? 'log') as string;
  if (!EMAIL_PROVIDERS.includes(provider)) {
    errors.push(
      `EMAIL_PROVIDER must be one of: ${EMAIL_PROVIDERS.join(', ')} (got "${provider}")`,
    );
    return;
  }
  if (
    config.NODE_ENV === 'production' &&
    DEV_ONLY_EMAIL_PROVIDERS.includes(provider)
  ) {
    // The log adapter prints one-time codes; it must never run in production
    errors.push(
      `EMAIL_PROVIDER=${provider} only prints emails and is not allowed in production; configure a real provider`,
    );
  }
  if (provider === 'smtp') validateSmtp(config, errors);
}

/** What `EMAIL_PROVIDER=smtp` needs: where to connect, who to send as, and (optionally) a login. */
function validateSmtp(config: Record<string, unknown>, errors: string[]): void {
  if (!present(config, 'SMTP_HOST')) {
    errors.push('SMTP_HOST must be set when EMAIL_PROVIDER=smtp');
  }

  if (config.SMTP_PORT !== undefined) {
    const port = Number(config.SMTP_PORT);
    if (!Number.isInteger(port) || port <= 0 || port > 65535) {
      errors.push('SMTP_PORT must be a valid integer between 1 and 65535');
    }
  }

  if (
    config.SMTP_SECURE !== undefined &&
    config.SMTP_SECURE !== 'true' &&
    config.SMTP_SECURE !== 'false'
  ) {
    errors.push('SMTP_SECURE must be "true" or "false"');
  }

  // A login is a pair: a user without a password (or the reverse) can never work
  if (present(config, 'SMTP_USER') !== present(config, 'SMTP_PASS')) {
    errors.push('SMTP_USER and SMTP_PASS must be set together');
  }

  if (
    !present(config, 'EMAIL_FROM') ||
    !(config.EMAIL_FROM as string).includes('@')
  ) {
    errors.push(
      'EMAIL_FROM must be set to a sender address when EMAIL_PROVIDER=smtp, e.g. "App <no-reply@example.com>"',
    );
  }
}
