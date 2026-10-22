/** Shared event contract between the API route (producer) and the browser (consumer). */

export type StreamErrorCode =
  | "unauthorized"
  | "no_credits"
  | "model_not_found"
  | "network"
  | "bad_request";

export type StreamEvent =
  | { type: "delta"; text: string }
  | {
      type: "done";
      model: string;
      usage: { prompt_tokens: number; completion_tokens: number } | null;
      costEgp: number | null;
    }
  | { type: "error"; code: StreamErrorCode; message: string };
