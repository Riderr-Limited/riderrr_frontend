"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/** A list row whose details open in place. */
export function ExpandableRow({
  summary,
  children,
  defaultOpen = false,
}: {
  summary: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  return (
    <li className="bg-white">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-start gap-4 px-4 py-4 text-left transition-colors hover:bg-brand-canvas-soft/60 sm:px-5"
      >
        <div className="min-w-0 flex-1">{summary}</div>
        <ChevronDown aria-hidden className={cn("mt-0.5 size-4 shrink-0 text-brand-ink-faint transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div id={id} className="border-t border-brand-hairline bg-brand-canvas-soft/40 px-4 py-4 sm:px-5">
          {children}
        </div>
      )}
    </li>
  );
}

export function DetailGrid({ children }: { children: React.ReactNode }) {
  return <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">{children}</dl>;
}

export function Detail({ label, children, wide }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={cn("min-w-0", wide && "sm:col-span-2")}>
      <dt className="text-xs text-brand-ink-muted">{label}</dt>
      <dd className="mt-0.5 text-sm break-words text-brand-ink">{children}</dd>
    </div>
  );
}
