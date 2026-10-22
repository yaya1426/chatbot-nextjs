"use client";

import type { PublicModel } from "@/lib/models";

import { formatCostEgp } from "./format";
import styles from "./chat.module.css";
import type { ChatMessage } from "./types";

type Props = {
  message: ChatMessage;
  models: PublicModel[];
  streaming?: boolean;
};

export function MessageBubble({ message, models, streaming }: Props) {
  const isUser = message.role === "user";
  const model = models.find((item) => item.id === message.model);
  const waiting = streaming && message.content.length === 0 && !message.error;

  return (
    <div className={`${styles.row} ${isUser ? styles.userRow : styles.assistantRow}`}>
      <div className={`${styles.bubble} ${isUser ? styles.userBubble : styles.assistantBubble}`}>
        {message.content.length > 0 ? <p className={styles.text}>{message.content}</p> : null}
        {waiting ? (
          <span className={styles.typing} aria-label="يكتب">
            <span />
            <span />
            <span />
          </span>
        ) : null}
        {message.error ? <p className={styles.error}>{message.error}</p> : null}
      </div>

      {!isUser && (model || message.costEgp != null) ? (
        <div className={styles.meta}>
          {model ? <span className={styles.modelName}>{model.label}</span> : null}
          {model?.badge ? <span className={styles.badge}>{model.badge}</span> : null}
          {message.costEgp != null ? (
            <span className={styles.cost}>التكلفة: {formatCostEgp(message.costEgp)}</span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
