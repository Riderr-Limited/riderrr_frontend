"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/dashboard/primitives";
import { BackLink } from "@/components/app/BackLink";
import { ListState } from "@/components/app/ListState";
import { StatusBadge } from "@/components/app/ui";
import { formatDateTime, humanize, ticketTone } from "@/lib/app/format";
import { useResource } from "@/lib/app/hooks";
import { support } from "@/lib/app/services";

export default function TicketsPage() {
  const { data, loading, error, reload } = useResource(support.tickets);
  const list = data ?? [];

  return (
    <>
      <BackLink href="/app/support" label="Support" />
      <PageHeader title="My tickets">
        <Link href="/app/support/report" className="dash-btn dash-btn-primary">
          Report an issue
        </Link>
      </PageHeader>
      <ListState
        loading={loading && !data}
        error={!data ? error : null}
        onRetry={() => reload()}
        empty={list.length === 0}
        emptyTitle="No open tickets"
        emptyBody="Issues you report will show up here."
      >
        <ul className="divide-y divide-brand-hairline overflow-hidden rounded-lg border border-brand-hairline">
          {list.map((t) => (
            <li key={t._id}>
              <Link href={`/app/support/tickets/${t._id}`} className="flex items-center gap-4 px-4 py-3.5 hover:bg-brand-canvas-soft/60">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{t.title}</p>
                  <p className="mt-0.5 truncate text-[13px] text-brand-ink-muted">
                    {t.ticketId} · {humanize(t.issueType)} · {formatDateTime(t.createdAt)}
                  </p>
                </div>
                <StatusBadge tone={ticketTone(t.status)}>{humanize(t.status)}</StatusBadge>
                <ChevronRight aria-hidden className="size-4 shrink-0 text-brand-ink-faint" />
              </Link>
            </li>
          ))}
        </ul>
      </ListState>
    </>
  );
}
