import axios from "axios";

import { startLoading, stopLoading } from "@/lib/loading";

/**
 * Instância única do Axios usada por toda a camada de serviços.
 *
 * O caminho é relativo (`/api/v1`): o Next.js repassa as requisições para a
 * origem do backend configurada em `BACKEND_ORIGIN` (rewrite em next.config.ts),
 * preservando o prefixo `/api/v1` exigido pelo contrato da API.
 */
export const api = axios.create({
  baseURL: "/api/v1",
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  startLoading();
  return config;
});

api.interceptors.response.use(
  (response) => {
    stopLoading();
    return response;
  },
  (error) => {
    stopLoading();
    return Promise.reject(error);
  },
);

/**
 * Extrai a mensagem de erro devolvida pela API (campo `message`) sem
 * substituí-la por um texto genérico. Sem resposta da API, devolve uma
 * mensagem de rede amigável.
 */
export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string | string[] }
      | undefined;
    if (data?.message) {
      return Array.isArray(data.message)
        ? data.message.join(", ")
        : data.message;
    }
    if (error.code === "ECONNABORTED") {
      return "O servidor demorou para responder. Tente novamente.";
    }
    if (!error.response) {
      return "Não foi possível conectar ao servidor.";
    }
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "Ocorreu um erro inesperado.";
}
