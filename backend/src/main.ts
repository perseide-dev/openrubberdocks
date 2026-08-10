import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { JsonApiExceptionFilter } from '@commonExceptions/json-api-exception.filter'
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  //Validations
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new JsonApiExceptionFilter());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
