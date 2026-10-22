"use client";

import type { PublicModel } from "@/lib/models";

import styles from "./chat.module.css";

type Props = {
  models: PublicModel[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export function ModelPicker({ models, value, onChange, disabled }: Props) {
  return (
    <label className={styles.picker}>
      <span className={styles.pickerLabel}>الموديل</span>
      <select
        className={styles.select}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
      >
        {models.map((model) => (
          <option key={model.id} value={model.id}>
            {model.label}
            {model.badge ? ` — ${model.badge}` : ""}
          </option>
        ))}
      </select>
    </label>
  );
}
