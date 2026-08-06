import { BadRequestException, ValidationPipe as NestValidationPipe, ValidationError } from '@nestjs/common';

export function createValidationPipe() {
  return new NestValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
    exceptionFactory: (errors: ValidationError[]) => {
      const messages = errors.map((error) => {
        const constraints = error.constraints ? Object.values(error.constraints) : [];
        return constraints.join(', ');
      });
      return new BadRequestException({
        message: 'Validation failed',
        errors: messages.filter(Boolean),
      });
    },
  });
}
