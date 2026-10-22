/** Reads an SSE response from the chat API and calls `onEvent` for every event. */

import type { StreamEvent } from "./stream-events";

const DATA_PREFIX = "data:";

export async function readEventStream(
  response: Response,
  onEvent: (event: StreamEvent) => void,
): Promise<void> {
  const reader = response.body?.getReader();
  if (!reader) return;

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const blocks = buffer.split("\n\n");
    buffer = blocks.pop() ?? "";

    for (const block of blocks) {
      const line = block.split("\n").find((item) => item.startsWith(DATA_PREFIX));
      if (!line) continue;

      const payload = line.slice(DATA_PREFIX.length).trim();
      if (!payload) continue;

      try {
        onEvent(JSON.parse(payload) as StreamEvent);
      } catch {
        // Ignore a malformed chunk instead of breaking the whole stream.
      }
    }
  }
}
