import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClsModule } from 'nestjs-cls';
import { AppController } from './app.controller.js';
import { validateEnv } from './core/config/env.validation.js';
import { resolveCorrelationId } from './core/utils/correlation-id.util.js';
// @infra:imports
// @plop:module-imports

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
        generateId: true,
        idGenerator: resolveCorrelationId,
      },
    }),
    // @infra:modules
    // @plop:modules
  ],
  controllers: [AppController],
})
export class AppModule {}
