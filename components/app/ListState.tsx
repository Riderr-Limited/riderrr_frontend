"use client";

import { EmptyState } from "@/components/dashboard/primitives";
import { Notice } from "./ui";

/** Loading / error / empty / content states for a list. */
export function ListState({
  loading,
  error,
  onRetry,
  empty,
  emptyTitle,
  emptyBody,
  children,
}: {
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  empty: boolean;
  emptyTitle: string;
  emptyBody?: string;
  children: React.ReactNode;
}) {
  if (loading) {
    return (
      <div className="space-y-2" aria-busy>
        {[0, 1, 2].map((i) => (
          <div key={i} className="dash-skeleton h-20 rounded-lg" />
        ))}
      </div>
    );
  }
  if (error) {
    return (
      <Notice tone="danger">
        {error}{" "}
        <button type="button" className="font-medium underline" onClick={onRetry}>
          Retry
        </button>
      </Notice>
    );
  }
  if (empty) {
    return (
      <div className="rounded-lg border border-brand-hairline">
        <EmptyState title={emptyTitle} description={emptyBody} />
      </div>
    );
  }
  return <>{children}</>;
}
