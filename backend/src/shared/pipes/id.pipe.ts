import { Injectable, NotFoundException, PipeTransform } from "@nestjs/common";
import { MAX_ID } from "../config/constants.js";

const POSITIVE_INT_RE = /^[1-9]\d*$/;

/**
 * Ids de recurso na URL (V8): formato inválido ou acima de 2.147.483.647 conta
 * como recurso inexistente (404).
 */
@Injectable()
export class ParseIdPipe implements PipeTransform<string, number> {
  transform(value: string): number {
    if (!POSITIVE_INT_RE.test(value)) {
      throw new NotFoundException("Recurso não encontrado.");
    }
    const parsed = Number(value);
    if (!Number.isSafeInteger(parsed) || parsed > MAX_ID) {
      throw new NotFoundException("Recurso não encontrado.");
    }
    return parsed;
  }
}
