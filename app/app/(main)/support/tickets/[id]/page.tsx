"use client";

import { useParams } from "next/navigation";
import { BackLink } from "@/components/app/BackLink";
import { Notice, PageLoader, StatusBadge } from "@/components/app/ui";
import { formatDateTime, humanize, ticketTone } from "@/lib/app/format";
import { useResource } from "@/lib/app/hooks";
import { support } from "@/lib/app/services";

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const ticket = useResource(() => support.ticket(id));
  const messages = useResource(() => support.ticketMessages(id).catch(() => []), { pollMs: 20000 });

  if (ticket.loading && !ticket.data) return <PageLoader />;
  if (!ticket.data) {
    return (
      <>
        <BackLink href="/app/support/tickets" label="My tickets" />
        <Notice tone="danger">{ticket.error ?? "We couldn't find this ticket."}</Notice>
      </>
    );
  }

  const t = ticket.data;
  const list = messages.data ?? [];

  return (
    <>
      <BackLink href="/app/support/tickets" label="My tickets" />
      <div className="mb-6 rounded-lg border border-brand-hairline p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[13px] text-brand-ink-muted">{t.ticketId}</span>
          <StatusBadge tone={ticketTone(t.status)}>{humanize(t.status)}</StatusBadge>
          <span className="text-[13px] text-brand-ink-muted">· {humanize(t.issueType)}</span>
        </div>
        <h1 className="mt-2 text-lg font-semibold">{t.title}</h1>
        {t.description && <p className="mt-2 text-sm leading-6 whitespace-pre-wrap text-brand-ink-secondary">{t.description}</p>}
        <p className="mt-3 text-xs text-brand-ink-faint">Opened {formatDateTime(t.createdAt)}</p>
      </div>

      <h2 className="mb-3 text-sm font-semibold">Replies</h2>
      {list.length === 0 ? (
        <p className="rounded-lg border border-brand-hairline px-4 py-10 text-center text-sm text-brand-ink-muted">
          No replies yet. We&apos;ll respond here and by email.
        </p>
      ) : (
        <ul className="space-y-3">
          {list.map((m, i) => (
            <li key={m._id ?? i} className="rounded-lg border border-brand-hairline p-4">
              <div className="flex items-center justify-between gap-3 text-[13px]">
                <span className="font-medium">{m.senderId?.name ?? "Support"}</span>
                <span className="text-brand-ink-faint">{formatDateTime(m.timestamp)}</span>
              </div>
              <p className="mt-1.5 text-sm leading-6 whitespace-pre-wrap text-brand-ink-secondary">{m.text}</p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
