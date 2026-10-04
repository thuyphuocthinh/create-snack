import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ClsService } from 'nestjs-cls';
import { json } from 'express';
import helmet from 'helmet';
import { AppModule } from './app.module.js';
import { AllExceptionsFilter } from './core/http/filters/all-exceptions.filter.js';
import { ResponseInterceptor } from './core/http/interceptors/response.interceptor.js';
import { LoggingInterceptor } from './core/http/interceptors/logging.interceptor.js';
import { AppLogger } from './core/http/logging/app.logger.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true, // Buffer logs until custom logger is attached
  });
  app.useLogger(new AppLogger());

  // Security headers
  app.use(helmet());

  // CORS — restrict origins in production via CORS_ORIGINS (comma separated)
  const rawOrigins = process.env.CORS_ORIGINS;
  app.enableCors({
    origin: rawOrigins ? rawOrigins.split(',').map((o) => o.trim()) : '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key'],
    credentials: false,
  });

  app.enableShutdownHooks();
  app.setGlobalPrefix('api/v1');

  // Reject oversized payloads before they hit any handler
  app.use(json({ limit: '1mb' }));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strip unknown fields silently
      forbidNonWhitelisted: true, // AND reject the request if unknown fields are present
      transform: true,
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter(app.get(ClsService)));
  app.useGlobalInterceptors(new LoggingInterceptor(), new ResponseInterceptor());

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('{{PROJECT_NAME}} API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup(
    'api/v1/docs',
    app,
    SwaggerModule.createDocument(app, config),
  );

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
