import { NextResponse } from "next/server";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

import { mapProviderError } from "@/lib/api-errors";
import { ERROR_MESSAGES } from "@/lib/error-messages";
import { DEFAULT_MODEL_ID, calculateCostEGP, isAllowedModel } from "@/lib/models";
import { SYSTEM_PROMPT } from "@/lib/prompt";
import { createSovereignClient, getApiKey } from "@/lib/sovereigneg";
import type { StreamEvent } from "@/lib/stream-events";

const MAX_MESSAGES = 20;

type IncomingMessage = { role?: unknown; content?: unknown };

function parseMessages(value: unknown): { role: "user" | "assistant"; content: string }[] {
  if (!Array.isArray(value)) return [];

  return value
    .flatMap((raw: IncomingMessage) => {
      if (!raw || typeof raw !== "object") return [];
      const role = raw.role === "assistant" ? "assistant" : raw.role === "user" ? "user" : null;
      const content = typeof raw.content === "string" ? raw.content.trim() : "";
      if (!role || !content) return [];
      return [{ role, content } as const];
    })
    .slice(-MAX_MESSAGES);
}

function jsonError(code: keyof typeof ERROR_MESSAGES, status: number) {
  return NextResponse.json({ code, message: ERROR_MESSAGES[code] }, { status });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("bad_request", 400);
  }

  const payload = (body ?? {}) as { messages?: unknown; model?: unknown };
  const messages = parseMessages(payload.messages);
  if (messages.length === 0) {
    return jsonError("bad_request", 400);
  }

  const model = typeof payload.model === "string" && payload.model.length > 0 ? payload.model : DEFAULT_MODEL_ID;
  if (!isAllowedModel(model)) {
    return jsonError("model_not_found", 400);
  }

  if (!getApiKey()) {
    return jsonError("unauthorized", 401);
  }

  const client = createSovereignClient();

  let upstream: Awaited<ReturnType<typeof client.chat.completions.create>>;
  try {
    upstream = await client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages,
      ] as ChatCompletionMessageParam[],
      stream: true,
      stream_options: { include_usage: true },
    });
  } catch (error) {
    const mapped = mapProviderError(error);
    return NextResponse.json({ code: mapped.code, message: mapped.message }, { status: mapped.status });
  }

  const encoder = new TextEncoder();
  const body$ = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: StreamEvent) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      };

      let usage: { prompt_tokens: number; completion_tokens: number } | null = null;

      try {
        for await (const chunk of upstream) {
          const text = chunk.choices?.[0]?.delta?.content ?? "";
          if (text) {
            send({ type: "delta", text });
          }
          if (chunk.usage) {
            usage = {
              prompt_tokens: chunk.usage.prompt_tokens ?? 0,
              completion_tokens: chunk.usage.completion_tokens ?? 0,
            };
          }
        }

        send({ type: "done", model, usage, costEgp: calculateCostEGP(model, usage) });
      } catch (error) {
        const mapped = mapProviderError(error);
        send({ type: "error", code: mapped.code, message: mapped.message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(body$, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
