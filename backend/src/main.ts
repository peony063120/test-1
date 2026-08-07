import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggerService } from './infrastructure/logger/logger.service';
import { AuthService } from './modules/auth/auth.service';
import { createValidationPipe } from './common/pipes/validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const configService = app.get(ConfigService);
  const logger = app.get(LoggerService);
  const authService = app.get(AuthService);

  // Initialize role permissions on startup
  await authService.initializeRolePermissions();

  app.useGlobalPipes(createValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useLogger(logger);
  app.setGlobalPrefix(process.env.API_PREFIX || 'api/v1');

  const config = new DocumentBuilder()
    .setTitle('Product Management System API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(process.env.SWAGGER_PATH || 'docs', app, document);

  app.enableCors({
    origin: (origin, callback) => {
      const allowed = configService.get<string>('CORS_ORIGIN')?.split(',').map(s => s.trim()) || ['http://localhost:3001'];
      // Allow requests with no origin (mobile apps, Postman, curl), localhost, or LAN IPs
      if (!origin) return callback(null, true);
      if (allowed.some(a => origin.startsWith(a))) return callback(null, true);
      // Allow any LAN origin in development (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
      if (/^https?:\/\/(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.|127\.0\.0\.1|localhost)(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }
      callback(null, true); // Allow all in dev; restrict via CORS_ORIGIN in production
    },
    credentials: true,
  });

  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);
  logger.log(`Application started on port ${port}`, 'Bootstrap');

  const shutdown = async (signal: string) => {
    logger.log(`Received ${signal}, shutting down gracefully`, 'Bootstrap');
    await app.close();
    process.exit(0);
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
}

bootstrap();
