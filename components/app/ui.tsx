"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AlertCircle, CheckCircle2, Info, Loader2, Star, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Tone } from "@/lib/app/format";

/* ------------------------------ Spinner ----------------------------- */

export function Spinner({ className }: { className?: string }) {
  return <Loader2 aria-hidden className={cn("size-4 animate-spin", className)} />;
}

export function PageLoader({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-sm text-brand-ink-muted" role="status">
      <Spinner className="size-5 text-brand-primary" />
      <span>{label}</span>
    </div>
  );
}

/* ------------------------------ Button ------------------------------ */

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "danger-outline";

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  block = false,
  className,
  children,
  disabled,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  block?: boolean;
}) {
  return (
    <button
      type="button"
      {...rest}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        "dash-btn",
        `dash-btn-${variant}`,
        size === "sm" && "dash-btn-sm",
        size === "lg" && "h-11 px-5 text-[15px]",
        block && "w-full",
        className,
      )}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}

/* ------------------------------- Badge ------------------------------ */

export function StatusBadge({ tone = "neutral", children, className }: { tone?: Tone; children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "dash-badge",
        tone === "info" && "dash-badge-info",
        tone === "success" && "dash-badge-success",
        tone === "warning" && "dash-badge-warning",
        tone === "danger" && "dash-badge-danger",
        className,
      )}
    >
      {children}
    </span>
  );
}

/* ------------------------------ Notice ------------------------------ */

export function Notice({
  tone = "info",
  children,
  className,
}: {
  tone?: "info" | "success" | "danger" | "warning";
  children: React.ReactNode;
  className?: string;
}) {
  const Icon = tone === "danger" ? AlertCircle : tone === "success" ? CheckCircle2 : Info;
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={cn(
        "dash-notice",
        tone === "danger" && "dash-notice-danger",
        tone === "success" && "dash-notice-success",
        tone === "info" && "dash-notice-info",
        tone === "warning" && "border-amber-200 bg-amber-50 text-amber-800",
        className,
      )}
    >
      <Icon aria-hidden className="mt-0.5 size-4 shrink-0" />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

/* ------------------------------- Modal ------------------------------ */

/** Centered dialog on larger screens, bottom sheet on phones. */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  dismissible = true,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  dismissible?: boolean;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => {
      const target = panelRef.current?.querySelector<HTMLElement>(
        "[data-autofocus], input, textarea, select, button:not([data-close])",
      );
      (target ?? panelRef.current)?.focus();
    }, 20);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && dismissible) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      previous?.focus?.();
    };
  }, [open, dismissible, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 sm:items-center sm:p-4"
      onMouseDown={(e) => {
        if (dismissible && e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          "flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-xl border border-brand-hairline bg-white shadow-elevated outline-none sm:max-h-[88vh] sm:rounded-xl",
          size === "sm" && "sm:max-w-sm",
          size === "md" && "sm:max-w-md",
          size === "lg" && "sm:max-w-xl",
        )}
      >
        <div className="dash-modal-header">
          <div className="min-w-0">
            <h2 id={titleId} className="dash-modal-title">
              {title}
            </h2>
            {description && <div className="mt-0.5 text-sm text-brand-ink-muted">{description}</div>}
          </div>
          {dismissible && (
            <button type="button" data-close className="dash-icon-btn -mr-1.5 -mt-1" onClick={onClose} aria-label="Close">
              <X className="size-4" />
            </button>
          )}
        </div>
        {children && <div className="dash-modal-body">{children}</div>}
        {footer && <div className="dash-modal-footer pb-[max(0.875rem,env(safe-area-inset-bottom))]">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}

type ReasonModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: React.ReactNode;
  placeholder?: string;
  required?: boolean;
  confirmLabel: string;
  cancelLabel?: string;
  danger?: boolean;
  maxLength?: number;
  onConfirm: (reason: string) => Promise<void>;
};

/** Confirm-with-optional-reason dialog used for cancel / reject / dispute. Mounted only while open, so it starts empty each time. */
export function ReasonModal(props: ReasonModalProps) {
  return props.open ? <ReasonModalBody {...props} /> : null;
}

function ReasonModalBody({
  open,
  onClose,
  title,
  description,
  placeholder = "Reason (optional)",
  required = false,
  confirmLabel,
  cancelLabel = "Go back",
  danger = true,
  maxLength = 200,
  onConfirm,
}: ReasonModalProps) {
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fieldId = useId();

  const submit = async () => {
    if (required && !reason.trim()) {
      setError("Please add a few words so we know what happened.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await onConfirm(reason.trim());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={busy ? () => {} : onClose}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            {cancelLabel}
          </Button>
          <Button variant={danger ? "danger" : "primary"} onClick={submit} loading={busy}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <label htmlFor={fieldId} className="dash-label">
        {required ? "Details" : "Reason"}
        {!required && <span className="font-normal text-brand-ink-faint"> (optional)</span>}
      </label>
      <textarea
        id={fieldId}
        className="dash-input min-h-24 resize-y"
        placeholder={placeholder}
        value={reason}
        maxLength={maxLength}
        onChange={(e) => setReason(e.target.value)}
      />
      <p className="mt-1 text-right text-xs text-brand-ink-faint">
        {reason.length}/{maxLength}
      </p>
      {error && (
        <Notice tone="danger" className="mt-2">
          {error}
        </Notice>
      )}
    </Modal>
  );
}

/* ------------------------------- Stars ------------------------------ */

export function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
          onClick={() => onChange(star)}
          className="rounded p-1 text-brand-ink-faint transition-colors hover:text-amber-500 focus-visible:outline-2 focus-visible:outline-brand-primary"
        >
          <Star className={cn("size-7", star <= value && "fill-amber-400 text-amber-400")} />
        </button>
      ))}
    </div>
  );
}

/* ------------------------------ Tabs -------------------------------- */

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  className,
  label,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; count?: number }[];
  className?: string;
  label: string;
}) {
  return (
    <div role="tablist" aria-label={label} className={cn("dash-tabs max-w-full overflow-x-auto", className)}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className="dash-tab shrink-0"
        >
          {o.label}
          {typeof o.count === "number" && o.count > 0 && (
            <span className="rounded bg-brand-canvas-soft px-1.5 text-xs tabular-nums text-brand-ink-muted">{o.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------ Layout ------------------------------ */

export function Section({
  title,
  action,
  children,
  className,
}: {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("mb-8", className)}>
      {(title || action) && (
        <div className="mb-3 flex items-center justify-between gap-3">
          {title && <h2 className="text-sm font-semibold text-brand-ink">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function KeyValue({ label, children, strong }: { label: string; children: React.ReactNode; strong?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 text-sm">
      <span className="shrink-0 text-brand-ink-muted">{label}</span>
      <span className={cn("min-w-0 text-right break-words text-brand-ink", strong && "font-semibold")}>{children}</span>
    </div>
  );
}

export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="mb-6 flex items-center gap-2" aria-label="Progress">
      {steps.map((label, i) => (
        <li key={label} className="flex min-w-0 flex-1 items-center gap-2" aria-current={i === current ? "step" : undefined}>
          <span
            className={cn(
              "inline-flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-medium tabular-nums",
              i < current && "bg-brand-primary text-white",
              i === current && "border border-brand-primary text-brand-primary",
              i > current && "border border-brand-hairline text-brand-ink-faint",
            )}
          >
            {i + 1}
          </span>
          <span className={cn("truncate text-[13px]", i === current ? "font-medium text-brand-ink" : "text-brand-ink-muted")}>
            {label}
          </span>
          {i < steps.length - 1 && <span className="hidden h-px flex-1 bg-brand-hairline sm:block" />}
        </li>
      ))}
    </ol>
  );
}
