// apps/api/src/common/filters/http-exception.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    let errorCode = 'INTERNAL_ERROR';
    let errorMessage = exception.message || 'An unexpected error occurred';
    let details = null;

    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const respObj = exceptionResponse as any;
      if (respObj.error) {
        errorCode = respObj.error.code || errorCode;
        errorMessage = respObj.error.message || errorMessage;
        details = respObj.error.details || null;
      } else if (respObj.message) {
        errorMessage = Array.isArray(respObj.message)
          ? respObj.message.join(', ')
          : respObj.message;
      }
    }

    response.status(status).json({
      error: {
        code: errorCode,
        message: errorMessage,
        details,
      },
    });
  }
}
