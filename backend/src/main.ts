import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import { JsonApiExceptionFilter } from '@commonExceptions/json-api-exception.filter';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import express from 'express';

function parseCorsOrigins(rawOrigins?: string): string[] | string | boolean {
  if (!rawOrigins || rawOrigins.trim() === '') {
    return ['http://localhost:5173', 'http://localhost:3000'];
  }
  const origins = rawOrigins
    .split(',')
    .map((origin) => origin.trim().replace(/\/+$/, ''))
    .filter(Boolean);

  return origins.length === 1 ? origins[0] : origins;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.use(cookieParser());
  app.use(express.json({ type: ['application/json', 'application/vnd.api+json'] }));

  const allowedOrigins = parseCorsOrigins(process.env.FRONTEND_URL);

  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  app.useGlobalFilters(new JsonApiExceptionFilter());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
