/**
 * Server-only: the API key and the OpenAI client live here and must never be
 * imported from a client component. Only `src/app/api/chat/route.ts` uses this.
 */

import OpenAI from "openai";

const DEFAULT_BASE_URL = "https://backend.sovereigneg.com/v1";

/** Reads the key from the server environment only. Never log or return it. */
export function getApiKey(): string | null {
  const key = process.env.SOVEREIGNEG_API_KEY;
  return key && key.trim().length > 0 ? key.trim() : null;
}

/** Provider base URL. The env var only exists to allow pointing at a local test server. */
export function getBaseUrl(): string {
  const override = process.env.SOVEREIGNEG_BASE_URL?.trim();
  return override && override.length > 0 ? override : DEFAULT_BASE_URL;
}

export function createSovereignClient(): OpenAI {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("SOVEREIGNEG_API_KEY is not set");
  }
  return new OpenAI({ apiKey, baseURL: getBaseUrl() });
}
