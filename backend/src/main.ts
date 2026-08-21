import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { JsonApiExceptionFilter } from '@commonExceptions/json-api-exception.filter'
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.use(cookieParser());
  
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });
  //Validations
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new JsonApiExceptionFilter());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
