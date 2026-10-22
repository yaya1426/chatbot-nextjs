"use client";

import type { PublicModel } from "@/lib/models";

import { MessageBubble } from "./MessageBubble";
import styles from "./chat.module.css";
import type { ChatMessage } from "./types";

type Props = {
  messages: ChatMessage[];
  models: PublicModel[];
  streaming: boolean;
};

export function MessageList({ messages, models, streaming }: Props) {
  if (messages.length === 0) {
    return (
      <div className={styles.empty}>
        <h2 className={styles.emptyTitle}>أهلاً بيك 👋</h2>
        <p className={styles.emptyText}>
          اكتب أي حاجة وأنا هرد عليك بالعامية المصرية. جرّب مثلاً: «إزيك؟ عامل إيه النهارده؟»
        </p>
      </div>
    );
  }

  const lastId = messages[messages.length - 1]?.id;

  return (
    <div className={styles.messages}>
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          models={models}
          streaming={streaming && message.id === lastId}
        />
      ))}
    </div>
  );
}
