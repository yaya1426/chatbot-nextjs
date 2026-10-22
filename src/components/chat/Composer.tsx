"use client";

import type { KeyboardEvent } from "react";

import styles from "./chat.module.css";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
};

export function Composer({ value, onChange, onSend, disabled }: Props) {
  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      onSend();
    }
  };

  return (
    <div className={styles.composer}>
      <textarea
        className={styles.input}
        rows={1}
        value={value}
        placeholder="اكتب رسالتك هنا..."
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
      />
      <button
        className={styles.send}
        type="button"
        onClick={onSend}
        disabled={disabled || value.trim().length === 0}
      >
        ابعت
      </button>
    </div>
  );
}
