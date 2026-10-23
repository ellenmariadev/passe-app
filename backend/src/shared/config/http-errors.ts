import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";

export function badRequest(message: string): BadRequestException {
  return new BadRequestException(message);
}

export function notFound(message: string): NotFoundException {
  return new NotFoundException(message);
}

export function conflict(message: string): ConflictException {
  return new ConflictException(message);
}
