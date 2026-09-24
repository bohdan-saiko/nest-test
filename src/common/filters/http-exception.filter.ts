import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { randomUUID } from 'node:crypto';

type ExceptionResponse = {
  errorCode?: string;
  message?: string | string[];
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();
    const traceId = request.header('x-trace-id') ?? randomUUID();

    const httpException =
      exception instanceof HttpException
        ? exception
        : new HttpException(
            'Internal server error',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
    const statusCode = httpException.getStatus();
    const exceptionResponse = httpException.getResponse();
    const details =
      typeof exceptionResponse === 'string'
        ? { message: exceptionResponse }
        : (exceptionResponse as ExceptionResponse);

    response
      .setHeader('x-trace-id', traceId)
      .status(statusCode)
      .json({
        statusCode,
        errorCode:
          details.errorCode ?? this.errorCodeFor(statusCode, details.message),
        message: this.messageFor(details.message, statusCode),
        path: request.originalUrl,
        timestamp: new Date().toISOString(),
        traceId,
      });
  }

  private errorCodeFor(
    statusCode: number,
    message: string | string[] | undefined,
  ): string {
    if (statusCode === HttpStatus.BAD_REQUEST) {
      return Array.isArray(message) ? 'VALIDATION_FAILED' : 'BAD_REQUEST';
    }

    return HttpStatus[statusCode] ?? 'INTERNAL_SERVER_ERROR';
  }

  private messageFor(
    message: string | string[] | undefined,
    statusCode: number,
  ): string {
    if (Array.isArray(message)) return message.join('; ');
    return message ?? HttpStatus[statusCode] ?? 'Internal server error';
  }
}
