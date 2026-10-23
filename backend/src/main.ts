import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import type { NextFunction, Request, Response } from "express";
import { AppModule } from "./app.module.js";
import { API_PREFIX } from "./shared/config/constants.js";
import { AppValidationPipe } from "./shared/pipes/app-validation.pipe.js";
import { AllExceptionsFilter } from "./shared/exceptions/all-exceptions.filter.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT ?? 3000;

  app.setGlobalPrefix(API_PREFIX);
  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
  });

  app.useGlobalPipes(new AppValidationPipe());
  app.useGlobalFilters(new AllExceptionsFilter());

  const logger = new Logger("HTTP");
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.on("finish", () => {
      logger.log(`${req.method} ${req.originalUrl} ${res.statusCode}`);
    });
    next();
  });

  const config = new DocumentBuilder()
    .setTitle("Passe App")
    .setDescription(
      "API do mercado de jogadores de liga de futebol",
    )
    .setVersion("1.0")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, document);

  await app.listen(port);
  logger.log(`API em http://localhost:${port}/${API_PREFIX}`);
}
bootstrap();
