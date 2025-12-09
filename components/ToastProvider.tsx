// components/ToastProvider.tsx
"use client";
import React, { createContext, useContext, useState } from "react";

type Toast = {
  id: string;
  title: string;
  description?: string;
  type?: "success" | "error" | "info";
};

const ToastContext = createContext<{
  toast: (args: Omit<Toast, "id">) => void;
} | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  function toast({ title, description, type = "info" }: Omit<Toast, "id">) {
    const id = String(Date.now());
    const t = { id, title, description, type };
    setToasts((s) => [...s, t]);
    // auto remove
    setTimeout(() => setToasts((s) => s.filter((x) => x.id !== id)), 4500);
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-5 right-5 flex flex-col gap-2 z-50">
        {toasts.map((t) => (
          <div key={t.id} className="bg-white shadow rounded p-3 w-80 border">
            <div className="text-sm font-semibold">{t.title}</div>
            {t.description && (
              <div className="text-xs text-slate-600 mt-1">{t.description}</div>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
