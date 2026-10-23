import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import type { Response } from "express";

interface BodyParserError extends SyntaxError {
  statusCode?: number;
  type?: string;
}

/** Tratamento central de erros: responde sempre `{ statusCode, message }`, sem stack trace. */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = "Erro interno do servidor.";

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = this.extractMessage(exception.getResponse(), status);
    } else if (exception instanceof SyntaxError) {
      status = HttpStatus.BAD_REQUEST;
      message = "Corpo da requisição com JSON inválido.";
    } else if (this.isBodyParserError(exception)) {
      status = HttpStatus.BAD_REQUEST;
      message = "Corpo da requisição com JSON inválido.";
    }

    response.status(status).json({ statusCode: status, message });
  }

  private extractMessage(raw: string | object, status: number): string {
    if (typeof raw === "string") {
      return raw;
    }
    if (raw && typeof raw === "object") {
      const candidate = (raw as Record<string, unknown>).message;
      if (typeof candidate === "string" && candidate.length > 0) {
        return candidate;
      }
      if (Array.isArray(candidate) && candidate.length > 0) {
        return String(candidate[0]);
      }
    }
    return status >= 500 ? "Erro interno do servidor." : "Erro na requisição.";
  }

  private isBodyParserError(exception: unknown): boolean {
    if (typeof exception !== "object" || exception === null) {
      return false;
    }
    const type = (exception as BodyParserError).type;
    return typeof type === "string" && type.startsWith("entity.parse.failed");
  }
}
