import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { JsonApiExceptionFilter } from '@commonExceptions/json-api-exception.filter'
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.use(cookieParser());
  app.use(express.json({ type: ['application/json', 'application/vnd.api+json'] }));

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true
  });
  app.useGlobalFilters(new JsonApiExceptionFilter());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();