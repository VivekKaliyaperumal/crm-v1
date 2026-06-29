import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as Sentry from '@sentry/node';
import type { FastifyReply } from 'fastify';

/** Normalises every error into a consistent JSON shape, maps known Prisma
 * errors to proper HTTP codes, hides internals for unexpected errors, and
 * reports unexpected errors to Sentry (when configured). */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('Exceptions');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const reply = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<{ url?: string }>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let error = 'InternalServerError';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (res && typeof res === 'object') {
        const body = res as { message?: string | string[]; error?: string };
        message = body.message ?? exception.message;
        error = body.error ?? exception.name;
      }
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      ({ status, error, message } = this.mapPrismaError(exception));
    } else if (exception instanceof Prisma.PrismaClientValidationError) {
      status = HttpStatus.BAD_REQUEST;
      error = 'ValidationError';
      message = 'Invalid data for this request';
    } else if (exception instanceof Error) {
      // Unexpected — log the real error + report to Sentry, return a generic message.
      this.logger.error(exception.message, exception.stack);
      Sentry.captureException(exception);
    }

    reply.status(status).send({
      statusCode: status,
      error,
      message,
      path: request?.url,
      timestamp: new Date().toISOString(),
    });
  }

  private mapPrismaError(e: Prisma.PrismaClientKnownRequestError): {
    status: number;
    error: string;
    message: string;
  } {
    switch (e.code) {
      case 'P2002': {
        const target = (e.meta?.target as string[] | undefined)?.join(', ');
        return {
          status: HttpStatus.CONFLICT,
          error: 'Conflict',
          message: target ? `A record with this ${target} already exists` : 'Duplicate record',
        };
      }
      case 'P2025':
        return { status: HttpStatus.NOT_FOUND, error: 'NotFound', message: 'Record not found' };
      case 'P2003':
        return {
          status: HttpStatus.CONFLICT,
          error: 'Conflict',
          message: 'This record is referenced by other records and cannot be changed',
        };
      case 'P2014':
        return {
          status: HttpStatus.BAD_REQUEST,
          error: 'BadRequest',
          message: 'The change would violate a required relation',
        };
      default:
        return {
          status: HttpStatus.BAD_REQUEST,
          error: 'BadRequest',
          message: 'Database request error',
        };
    }
  }
}
