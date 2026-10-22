"use client";

import { useEffect, useRef, useState } from "react";

import { DEFAULT_MODEL_ID, type PublicModel } from "@/lib/models";
import { readEventStream } from "@/lib/sse";

import { Composer } from "./Composer";
import styles from "./chat.module.css";
import { MessageList } from "./MessageList";
import { ModelPicker } from "./ModelPicker";
import type { ChatMessage } from "./types";

type Props = {
  models: PublicModel[];
};

function newId(): string {
  return crypto.randomUUID();
}

export function ChatApp({ models }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [model, setModel] = useState(models[0]?.id ?? DEFAULT_MODEL_ID);
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  // A lock so Enter can't fire twice for the same message.
  const sendingRef = useRef(false);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  const patchMessage = (id: string, patch: Partial<ChatMessage>) => {
    setMessages((prev) => prev.map((message) => (message.id === id ? { ...message, ...patch } : message)));
  };

  const send = async () => {
    const content = input.trim();
    // `sendingRef` guards against a double Enter click before React has
    // processed the first state update; it's only read in event handlers.
    if (!content || streaming || sendingRef.current) return;
    sendingRef.current = true;
    setInput("");

    // `send` is a plain function (recreated each render), so this reads the
    // fresh `messages` state directly — no stale closure, no ref.
    const history = messages
      .filter((message) => message.content.length > 0 && !message.error)
      .map((message) => ({ role: message.role, content: message.content }));

    const assistantId = newId();
    setMessages((prev) => [
      ...prev,
      { id: newId(), role: "user", content },
      { id: assistantId, role: "assistant", content: "", model },
    ]);
    setStreaming(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...history, { role: "user", content }], model }),
      });

      if (!response.ok || !response.body) {
        let message = "مقدرناش نوصل للخدمة دلوقتي — جرّب تاني.";
        try {
          const payload = (await response.json()) as { message?: string; code?: string };
          if (payload.message) message = payload.message;
          // AGENTS §7: an unknown model falls back to the default picker.
          if (typeof payload.code === "string" && payload.code.startsWith("model")) {
            setModel(DEFAULT_MODEL_ID);
          }
        } catch {
          // Non-JSON error body — keep the fallback message.
        }
        patchMessage(assistantId, { error: message });
        return;
      }

      await readEventStream(response, (event) => {
        if (event.type === "delta") {
          setMessages((prev) =>
            prev.map((message) =>
              message.id === assistantId ? { ...message, content: message.content + event.text } : message,
            ),
          );
        } else if (event.type === "done") {
          patchMessage(assistantId, { model: event.model, costEgp: event.costEgp });
        } else if (event.type === "error") {
          patchMessage(assistantId, { error: event.message });
        }
      });
    } catch {
      patchMessage(assistantId, { error: "مقدرناش نوصل للخدمة دلوقتي — جرّب تاني." });
    } finally {
      setStreaming(false);
      sendingRef.current = false;
    }
  };

  return (
    <div className={styles.chatApp}>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <span className={styles.title}>شات بوت</span>
          <span className={styles.subtitle}>بترد بيك بالعامية المصرية</span>
        </div>
      </header>

      <div className={styles.scrollArea} ref={scrollRef}>
        <MessageList messages={messages} models={models} streaming={streaming} />
      </div>

      <footer className={styles.footer}>
        <ModelPicker models={models} value={model} onChange={setModel} disabled={streaming} />
        <Composer value={input} onChange={setInput} onSend={send} disabled={streaming} />
      </footer>
    </div>
  );
}
