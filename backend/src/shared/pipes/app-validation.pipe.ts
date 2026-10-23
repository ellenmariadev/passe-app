import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  ValidationError,
  ValidationPipe,
} from "@nestjs/common";
import type { ValidationPipeOptions } from "@nestjs/common";

function firstMessage(errors: ValidationError[]): string {
  for (const error of errors) {
    if (error.constraints) {
      const first = Object.values(error.constraints)[0];
      if (first) {
        return first;
      }
    }
    if (error.children && error.children.length > 0) {
      const nested = firstMessage(error.children);
      if (nested) {
        return nested;
      }
    }
  }
  return "Dados inválidos.";
}

@Injectable()
export class AppValidationPipe extends ValidationPipe {
  constructor(options?: ValidationPipeOptions) {
    super({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
      transformOptions: { enableImplicitConversion: false },
      ...options,
      exceptionFactory: (errors) =>
        new BadRequestException(firstMessage(errors)),
    });
  }

  async transform(
    value: unknown,
    metadata: ArgumentMetadata,
  ): Promise<unknown> {
    if (metadata.type === "body") {
      if (typeof value !== "object" || value === null || Array.isArray(value)) {
        throw new BadRequestException(
          "O corpo da requisição deve ser um objeto JSON.",
        );
      }
    }
    return super.transform(value, metadata);
  }
}
