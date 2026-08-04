import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { Prisma } from '@prisma/client';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const errorResponse = exception instanceof HttpException ? exception.getResponse() : null;

    let message = 'Internal server error';
    let errors = null;

    if (typeof errorResponse === 'string') {
      message = errorResponse;
    } else if (errorResponse && typeof errorResponse === 'object') {
      const responseObj = errorResponse as Record<string, unknown>;
      message = (responseObj.message as string) || message;
      errors = responseObj.errors ?? null;
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      if (exception.code === 'P2002') {
        return response.status(HttpStatus.CONFLICT).json({
          statusCode: HttpStatus.CONFLICT,
          message: `Duplicate field: ${exception.meta?.target}`,
          data: null,
          errors: exception.meta,
        });
      }
      if (exception.code === 'P2025') {
        return response.status(HttpStatus.NOT_FOUND).json({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Record not found',
          data: null,
          errors: exception.meta,
        });
      }
    }

    return response.status(status).json({
      statusCode: status,
      message,
      data: null,
      errors,
    });
  }
}
