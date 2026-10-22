/**
 * Server-side allow-list of every model this app is allowed to call.
 * Adding a model = adding one row here (id, label, optional badge, price).
 * The browser only ever receives `publicModels()` (ids + labels, no prices).
 */

export type ModelPrice = {
  /** EGP per 1M input (prompt) tokens. */
  input: number;
  /** EGP per 1M output (completion) tokens. */
  output: number;
};

export type ModelEntry = {
  id: string;
  label: string;
  /** Optional badge shown next to the label in the UI. */
  badge?: string;
  price: ModelPrice;
};

/** The part of a model the browser is allowed to see. */
export type PublicModel = {
  id: string;
  label: string;
  badge?: string;
};

export type TokenUsage = {
  prompt_tokens: number;
  completion_tokens: number;
};

/**
 * Prices are EGP per 1M tokens. Update these to match the provider's
 * current rates — everything else (cost display) derives from this table.
 */
export const MODELS: ModelEntry[] = [
  {
    id: "SovereignEG/Qwen3.8-27B-FP8",
    label: "Qwen3.8 27B (FP8)",
    badge: "الداتا جوه مصر",
    price: { input: 3, output: 9 },
  },
  {
    id: "claude-sonnet-5.5",
    label: "Claude Sonnet 5.5",
    price: { input: 15, output: 75 },
  },
  {
    id: "claude-opus-5.5",
    label: "Claude Opus 5.5",
    price: { input: 60, output: 300 },
  },
  {
    id: "gemini-4-argon",
    label: "Gemini 4 Argon",
    price: { input: 20, output: 100 },
  },
];

export const DEFAULT_MODEL_ID = "SovereignEG/Qwen3.8-27B-FP8";

export function getModel(id: string | null | undefined): ModelEntry | undefined {
  return MODELS.find((model) => model.id === id);
}

export function isAllowedModel(id: string | null | undefined): boolean {
  return getModel(id) !== undefined;
}

/** Strip prices before sending the list to the browser. */
export function publicModels(): PublicModel[] {
  return MODELS.map(({ id, label, badge }) => ({ id, label, badge }));
}

/** Cost of a single message in EGP, from the token usage the API reports. */
export function calculateCostEGP(
  modelId: string,
  usage: TokenUsage | null | undefined,
): number | null {
  const model = getModel(modelId);
  if (!model || !usage) return null;

  const inputCost = (usage.prompt_tokens / 1_000_000) * model.price.input;
  const outputCost = (usage.completion_tokens / 1_000_000) * model.price.output;

  return inputCost + outputCost;
}
