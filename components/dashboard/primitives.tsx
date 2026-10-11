import React from "react";
import { cn } from "@/lib/utils";

/** "PAY_ON_DELIVERY" -> "Pay on delivery" */
export function humanize(value: string) {
  const text = value.replace(/_/g, " ").toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function PageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold tracking-tight text-brand-ink">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-brand-ink-muted">{description}</p>
        )}
      </div>
      {children && (
        <div className="flex shrink-0 items-center gap-2">{children}</div>
      )}
    </div>
  );
}

/** One bordered strip of figures, split by hairlines instead of separate cards. */
export function StatStrip({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "grid gap-px overflow-hidden rounded-lg border border-brand-hairline bg-brand-hairline",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Stat({
  label,
  value,
  hint,
  loading = false,
  compact = false,
  className,
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  loading?: boolean;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "min-w-0 bg-white",
        compact ? "px-4 py-3" : "px-5 py-4",
        className,
      )}
    >
      <p className="truncate text-[13px] text-brand-ink-muted">{label}</p>
      {loading ? (
        <div className="dash-skeleton mt-2 h-7 w-20" />
      ) : (
        <p
          className={cn(
            "mt-1 truncate font-semibold tracking-tight text-brand-ink tabular-nums",
            compact ? "text-lg" : "text-2xl",
          )}
        >
          {value}
        </p>
      )}
      {hint && !loading && (
        <p className="mt-0.5 truncate text-xs text-brand-ink-faint">{hint}</p>
      )}
    </div>
  );
}

/** Pickup and drop-off as two stops joined by a line. */
export function RouteStops({
  pickup,
  dropoff,
  className,
}: {
  pickup?: string;
  dropoff?: string;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0 text-sm", className)}>
      <div className="relative flex gap-3 pb-2.5">
        <span className="absolute top-[13px] bottom-[-5px] left-[3.5px] w-px bg-brand-hairline" />
        <span className="relative mt-[5px] size-2 shrink-0 rounded-full border-[1.5px] border-brand-ink-faint bg-white" />
        <p className="min-w-0 leading-5 text-brand-ink-secondary">
          {pickup || "—"}
        </p>
      </div>
      <div className="flex gap-3">
        <span className="mt-[5px] size-2 shrink-0 rounded-full bg-brand-primary" />
        <p className="min-w-0 leading-5 text-brand-ink">{dropoff || "—"}</p>
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  className,
}: {
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("px-6 py-14 text-center", className)}>
      <p className="text-sm font-medium text-brand-ink-secondary">{title}</p>
      {description && (
        <p className="mt-1 text-sm text-brand-ink-muted">{description}</p>
      )}
    </div>
  );
}

/** Label above value, used in detail panels and modals. */
export function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <p className="dash-eyebrow">{label}</p>
      <div className="mt-0.5 text-sm break-words text-brand-ink">{children}</div>
    </div>
  );
}

export function Avatar({
  name,
  className,
}: {
  name?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-canvas-soft text-[13px] font-medium text-brand-ink-secondary ring-1 ring-brand-hairline ring-inset",
        className,
      )}
    >
      {name?.charAt(0).toUpperCase() || "U"}
    </span>
  );
}
