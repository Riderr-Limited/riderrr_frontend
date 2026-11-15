"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export function PasswordInput({
  id,
  value,
  onChange,
  placeholder,
  autoComplete = "current-password",
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        type={visible ? "text" : "password"}
        className="dash-input h-11 pr-10"
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        type="button"
        className="dash-icon-btn absolute top-1/2 right-1.5 -translate-y-1/2"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}

/** Emails pass through trimmed; phone numbers lose spaces and dashes but keep the format the user typed. */
export function normalizeIdentifier(value: string): string {
  const v = value.trim();
  if (v.includes("@")) return v;
  const digits = v.replace(/[^\d+]/g, "");
  if (/^234\d{10}$/.test(digits)) return `+${digits}`;
  return digits || v;
}
