import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const errorResponse = exception.getResponse();
      const message =
        typeof errorResponse === 'string'
          ? errorResponse
          : (errorResponse as any).message || 'Unexpected error';
      const errors =
        typeof errorResponse === 'string'
          ? [errorResponse]
          : (errorResponse as any).errors || [];

      response.status(status).json({
        statusCode: status,
        message,
        data: null,
        errors,
      });
      return;
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      let status = HttpStatus.INTERNAL_SERVER_ERROR;
      let message = 'Database error';
      let errors: string[] = [];

      if (exception.code === 'P2002') {
        status = HttpStatus.CONFLICT;
        message = 'Unique constraint violation';
        errors = [exception.meta?.target ? `Duplicate value for: ${exception.meta.target}` : 'Duplicate value'];
      } else if (exception.code === 'P2025') {
        status = HttpStatus.NOT_FOUND;
        message = 'Record not found';
        errors = ['Record not found'];
      }

      response.status(status).json({
        statusCode: status,
        message,
        data: null,
        errors,
      });
      return;
    }

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      data: null,
      errors: ['Unexpected error'],
    });
  }
}
