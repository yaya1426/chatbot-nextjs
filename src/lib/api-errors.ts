/** Maps provider failures to short, human messages (Egyptian Arabic) for the chat bubble. */

import { APIError } from "openai";

import { ERROR_MESSAGES } from "./error-messages";
import type { StreamErrorCode } from "./stream-events";

export type MappedError = {
  code: StreamErrorCode;
  message: string;
  status: number;
};

function errorCodeOf(error: APIError): string | undefined {
  const top = (error as { code?: string }).code;
  const inner = (error as { error?: { code?: string } }).error?.code;
  return top ?? inner;
}

/** Never leaks the provider's raw message, the key, or a stack trace to the user. */
export function mapProviderError(error: unknown): MappedError {
  if (error instanceof APIError) {
    if (error.status === 401) {
      return { code: "unauthorized", message: ERROR_MESSAGES.unauthorized, status: 401 };
    }
    if (error.status === 402) {
      return { code: "no_credits", message: ERROR_MESSAGES.no_credits, status: 402 };
    }

    const code = errorCodeOf(error);
    if (code === "model_not_found" || code === "model_not_exist") {
      return { code: "model_not_found", message: ERROR_MESSAGES.model_not_found, status: 400 };
    }
  }

  return { code: "network", message: ERROR_MESSAGES.network, status: 502 };
}
