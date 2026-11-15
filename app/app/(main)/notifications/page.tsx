"use client";

import { useCallback, useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { EmptyState, PageHeader } from "@/components/dashboard/primitives";
import { Button, Modal, Notice, Segmented } from "@/components/app/ui";
import { cn } from "@/lib/utils";
import { errorMessage } from "@/lib/app/api";
import { formatDateTime, timeAgo } from "@/lib/app/format";
import { notifications } from "@/lib/app/services";
import type { AppNotification } from "@/lib/app/types";

const PAGE_SIZE = 20;
type Prefs = { push: boolean; email: boolean; sms: boolean };

export default function NotificationsPage() {
  const [tab, setTab] = useState<"inbox" | "settings">("inbox");
  const [items, setItems] = useState<AppNotification[] | null>(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [unread, setUnread] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [open, setOpen] = useState<AppNotification | null>(null);
  const [prefs, setPrefs] = useState<Prefs | null>(null);

  const load = useCallback(async (p = 1) => {
    try {
      const res = await notifications.list(p, PAGE_SIZE);
      setItems((current) => (p === 1 ? res.data ?? [] : [...(current ?? []), ...(res.data ?? [])]));
      setPage(p);
      setPages(res.pagination?.pages ?? 1);
      setUnread(res.pagination?.unreadCount ?? 0);
      setError(null);
    } catch (e) {
      if (p === 1) {
        setItems((current) => current ?? []);
        setError(errorMessage(e, "We couldn't load your notifications."));
      }
    }
  }, []);

  useEffect(() => {
    // load() only sets state after its request resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load(1);
    notifications
      .preferences()
      .then((p) => setPrefs({ push: p.push !== false, email: p.email !== false, sms: !!p.sms }))
      .catch(() => setPrefs({ push: true, email: true, sms: false }));
  }, [load]);

  const openItem = async (n: AppNotification) => {
    setOpen(n);
    if (!n.isRead) {
      setItems((list) => list?.map((x) => (x._id === n._id ? { ...x, isRead: true } : x)) ?? null);
      setUnread((u) => Math.max(0, u - 1));
      notifications.markRead(n._id).catch(() => {});
    }
  };

  const markAll = async () => {
    try {
      await notifications.markAllRead();
      setItems((list) => list?.map((x) => ({ ...x, isRead: true })) ?? null);
      setUnread(0);
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  const clearRead = async () => {
    try {
      await notifications.clearRead();
      setItems((list) => list?.filter((x) => !x.isRead) ?? null);
      toast.success("Read notifications cleared.");
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  const remove = async (id: string) => {
    try {
      await notifications.remove(id);
      setItems((list) => list?.filter((x) => x._id !== id) ?? null);
      setOpen(null);
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  const togglePref = async (key: keyof Prefs) => {
    if (!prefs) return;
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    try {
      await notifications.savePreferences(next);
    } catch (e) {
      setPrefs(prefs);
      toast.error(errorMessage(e, "We couldn't save that setting."));
    }
  };

  return (
    <>
      <PageHeader title="Notifications" description={unread ? `${unread} unread` : undefined}>
        {tab === "inbox" && items && items.length > 0 && (
          <>
            <Button size="sm" variant="secondary" onClick={markAll} disabled={!unread}>
              Mark all read
            </Button>
            <Button size="sm" variant="ghost" onClick={clearRead}>
              Clear read
            </Button>
          </>
        )}
      </PageHeader>

      <Segmented
        label="Notifications"
        value={tab}
        onChange={setTab}
        className="mb-5"
        options={[
          { value: "inbox", label: "Inbox", count: unread },
          { value: "settings", label: "Settings" },
        ]}
      />

      {tab === "inbox" &&
        (!items ? (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="dash-skeleton h-16 rounded-lg" />
            ))}
          </div>
        ) : error && items.length === 0 ? (
          <Notice tone="danger">{error}</Notice>
        ) : items.length === 0 ? (
          <div className="rounded-lg border border-brand-hairline">
            <EmptyState title="You're all caught up" description="Updates about your deliveries and account appear here." />
          </div>
        ) : (
          <>
            <ul className="divide-y divide-brand-hairline overflow-hidden rounded-lg border border-brand-hairline">
              {items.map((n) => (
                <li key={n._id}>
                  <button type="button" onClick={() => openItem(n)} className="flex w-full items-start gap-3 px-4 py-3.5 text-left hover:bg-brand-canvas-soft/60">
                    <span
                      aria-label={n.isRead ? undefined : "Unread"}
                      className={cn("mt-1.5 size-2 shrink-0 rounded-full", n.isRead ? "bg-transparent" : "bg-brand-primary")}
                    />
                    <span className="min-w-0 flex-1">
                      <span className={cn("block truncate text-sm", !n.isRead && "font-medium")}>{n.title}</span>
                      <span className="mt-0.5 line-clamp-2 block text-[13px] text-brand-ink-muted">{n.body}</span>
                    </span>
                    <span className="shrink-0 text-xs text-brand-ink-faint">{timeAgo(n.createdAt)}</span>
                  </button>
                </li>
              ))}
            </ul>
            {page < pages && (
              <div className="mt-4 flex justify-center">
                <Button
                  variant="secondary"
                  loading={loadingMore}
                  onClick={async () => {
                    setLoadingMore(true);
                    await load(page + 1);
                    setLoadingMore(false);
                  }}
                >
                  Load more
                </Button>
              </div>
            )}
          </>
        ))}

      {tab === "settings" && (
        <div className="max-w-lg divide-y divide-brand-hairline overflow-hidden rounded-lg border border-brand-hairline">
          {(
            [
              ["push", "Push notifications", "Alerts on devices where you use the mobile app"],
              ["email", "Email", "Receipts and account updates"],
              ["sms", "SMS", "Text messages about your deliveries"],
            ] as const
          ).map(([key, label, hint]) => (
            <label key={key} className="flex cursor-pointer items-center justify-between gap-4 px-4 py-3.5">
              <span>
                <span className="block text-sm font-medium">{label}</span>
                <span className="block text-[13px] text-brand-ink-muted">{hint}</span>
              </span>
              <input
                type="checkbox"
                role="switch"
                className="peer sr-only"
                checked={!!prefs?.[key]}
                disabled={!prefs}
                onChange={() => togglePref(key)}
              />
              <span
                aria-hidden
                className={cn(
                  "relative h-5 w-9 shrink-0 rounded-full transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-primary",
                  prefs?.[key] ? "bg-brand-primary" : "bg-brand-hairline",
                )}
              >
                <span className={cn("absolute top-0.5 size-4 rounded-full bg-white shadow transition-[left]", prefs?.[key] ? "left-[18px]" : "left-0.5")} />
              </span>
            </label>
          ))}
        </div>
      )}

      <Modal
        open={!!open}
        onClose={() => setOpen(null)}
        title={open?.title ?? ""}
        description={formatDateTime(open?.createdAt)}
        size="sm"
        footer={
          <>
            <Button variant="danger-outline" onClick={() => open && remove(open._id)}>
              <Trash2 aria-hidden className="size-4" />
              Delete
            </Button>
            <Button onClick={() => setOpen(null)}>Close</Button>
          </>
        }
      >
        <p className="text-sm leading-6 whitespace-pre-wrap text-brand-ink-secondary">{open?.body}</p>
      </Modal>
    </>
  );
}
