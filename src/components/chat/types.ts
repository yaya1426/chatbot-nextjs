export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  /** Model that produced the reply (assistant messages only). */
  model?: string;
  /** Cost of the reply in EGP, when the provider reported usage. */
  costEgp?: number | null;
  /** User-facing error, if the reply failed. */
  error?: string;
};
