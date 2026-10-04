import { registerAs, type ConfigType } from '@nestjs/config';

/** Settings about the application itself, parsed once at boot. */
export const appConfig = registerAs('app', () => ({
  /** The application's name (shown in emails, docs, ...). */
  name: process.env.APP_NAME?.trim() || '{{PROJECT_NAME}}',
}));

export type AppConfig = ConfigType<typeof appConfig>;
