import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from "class-validator";
import {
  collapseSpaces,
  countWords,
  hasControlCharacters,
  hasDigit,
  stripAccents,
} from "../utils/names.js";
import { parseBrasiliaDateTime } from "../utils/date.js";

export function IsPlayerName(
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return (object: object, propertyName: string | symbol) => {
    registerDecorator({
      name: "isPlayerName",
      target: object.constructor,
      propertyName: propertyName as string,
      options: validationOptions,
      validator: {
        validate(value: unknown): boolean {
          if (typeof value !== "string") {
            return false;
          }
          if (hasControlCharacters(value)) {
            return false;
          }
          const normalized = collapseSpaces(value);
          if (normalized.length < 3 || normalized.length > 100) {
            return false;
          }
          if (hasDigit(normalized)) {
            return false;
          }
          return countWords(normalized) >= 2;
        },
        defaultMessage(): string {
          return "Nome inválido: use de 3 a 100 caracteres, com pelo menos duas palavras e sem dígitos.";
        },
      },
    });
  };
}

export function IsClubName(
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return (object: object, propertyName: string | symbol) => {
    registerDecorator({
      name: "isClubName",
      target: object.constructor,
      propertyName: propertyName as string,
      options: validationOptions,
      validator: {
        validate(value: unknown): boolean {
          if (typeof value !== "string") {
            return false;
          }
          if (hasControlCharacters(value)) {
            return false;
          }
          const normalized = collapseSpaces(value);
          if (normalized.length < 3 || normalized.length > 60) {
            return false;
          }
          if (!/^[\p{L} .-]+$/u.test(normalized)) {
            return false;
          }
          const words = normalized
            .split(" ")
            .filter((word) => word.length > 0).length;
          return words >= 2 && words <= 5;
        },
        defaultMessage(): string {
          return "Nome de clube inválido: use de 3 a 60 caracteres, de 2 a 5 palavras, só com letras, espaços, hífen e ponto.";
        },
      },
    });
  };
}

export function IsAcronym(
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return (object: object, propertyName: string | symbol) => {
    registerDecorator({
      name: "isAcronym",
      target: object.constructor,
      propertyName: propertyName as string,
      options: validationOptions,
      validator: {
        validate(value: unknown, args: ValidationArguments): boolean {
          const name = (args.object as Record<string, unknown>).name;
          if (typeof value !== "string" || typeof name !== "string") {
            return false;
          }
          if (!/^[A-Z]{3}$/.test(value)) {
            return false;
          }
          if (value[0] === value[1] && value[1] === value[2]) {
            return false;
          }
          const normalizedName = stripAccents(name).toLowerCase();
          const letters = value.toLowerCase();
          const firstLetter = normalizedName.match(/[\p{L}]/u)?.[0];
          if (firstLetter !== letters[0]) {
            return false;
          }
          let index = 0;
          for (const char of normalizedName) {
            if (char === letters[index]) {
              index += 1;
            }
          }
          return index === 3;
        },
        defaultMessage(): string {
          return "Sigla inválida: use 3 letras maiúsculas que apareçam no nome, em ordem, começando pela primeira letra do nome.";
        },
      },
    });
  };
}

export function IsBrasiliaDateTime(
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return (object: object, propertyName: string | symbol) => {
    registerDecorator({
      name: "isBrasiliaDateTime",
      target: object.constructor,
      propertyName: propertyName as string,
      options: validationOptions,
      validator: {
        validate(value: unknown): boolean {
          if (typeof value !== "string") {
            return false;
          }
          return parseBrasiliaDateTime(value) !== null;
        },
        defaultMessage(): string {
          return "Data e hora inválidas: use o formato AAAA-MM-DDTHH:MM-03:00 (horário de Brasília).";
        },
      },
    });
  };
}
