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

    const httpException = this.toHttpException(exception);
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

  private toHttpException(exception: unknown): HttpException {
    if (exception instanceof HttpException) return exception;

    if (this.isPrismaError(exception, 'P2002')) {
      const target = exception.meta?.target;
      const isMembershipConflict =
        Array.isArray(target) &&
        target.includes('projectId') &&
        target.includes('userId');

      return new HttpException(
        {
          errorCode: isMembershipConflict
            ? 'MEMBERSHIP_ALREADY_EXISTS'
            : 'PROJECT_NAME_CONFLICT',
          message: isMembershipConflict
            ? 'User is already a project member'
            : 'Project with this name already exists',
        },
        HttpStatus.CONFLICT,
      );
    }

    if (this.isPrismaError(exception, 'P2025')) {
      return new HttpException(
        {
          errorCode: 'OWNER_NOT_FOUND',
          message: 'Owner was not found',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return new HttpException(
      'Internal server error',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  private isPrismaError(
    exception: unknown,
    code: string,
  ): exception is { code: string; meta?: { target?: unknown } } {
    return (
      typeof exception === 'object' &&
      exception !== null &&
      'code' in exception &&
      exception.code === code
    );
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
