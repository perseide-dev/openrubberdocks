import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class JsonApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errors: any[] = [];

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse() as any;

      // Manejo de errores de validación (class-validator)
      if (Array.isArray(exceptionResponse.message)) {
        errors = exceptionResponse.message.map((msg: string) => ({
          status: String(status),
          title: 'Validation Error',
          detail: msg,
        }));
      } else {
        // Errores HTTP estándar
        errors = [{
          status: String(status),
          title: exception.name,
          detail: exception.message,
        }];
      }
    } else {
      // Errores no controlados
      errors = [{
        status: String(status),
        title: 'Internal Server Error',
        detail: 'An unexpected error occurred.',
      }];
    }

    response.status(status).json({ errors });
  }
}