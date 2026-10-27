import { Body } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { JsonApiDeserializePipe } from '@commonPipes/json-api-deserialize.pipe';

export const JsonApiBody = () => Body(JsonApiDeserializePipe, new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }));