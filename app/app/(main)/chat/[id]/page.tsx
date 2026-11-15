"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, SendHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { errorMessage } from "@/lib/app/api";
import { formatTime } from "@/lib/app/format";
import { useInterval, useQueryParam } from "@/lib/app/hooks";
import { chat } from "@/lib/app/services";
import { useSession } from "@/lib/app/session";
import type { ChatMessage } from "@/lib/app/types";
import { Notice, PageLoader, Spinner } from "@/components/app/ui";

export default function DeliveryChatPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const user = useSession((s) => s.user);
  const name = useQueryParam("name");
  const [messages, setMessages] = useState<ChatMessage[] | null>(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const count = useRef(0);

  const load = async () => {
    try {
      const list = await chat.messages(id);
      setMessages(list);
    } catch (e) {
      setMessages((m) => m ?? []);
      if (!messages) setError(errorMessage(e, "We couldn't load messages."));
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useInterval(() => {
    if (document.visibilityState === "visible") load();
  }, 3000);

  useEffect(() => {
    const n = messages?.length ?? 0;
    if (n !== count.current) {
      endRef.current?.scrollIntoView({ block: "end" });
      count.current = n;
    }
  }, [messages]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    setError(null);
    try {
      const res = await chat.send(id, body);
      if (res.success && res.data) setMessages((m) => [...(m ?? []), res.data]);
      setText("");
    } catch (err) {
      setError(errorMessage(err, "Your message didn't send. Try again."));
    } finally {
      setSending(false);
    }
  };

  const otherLabel = name || (user?.role === "driver" ? "Customer" : "Rider");

  return (
    <div className="mx-auto flex h-[calc(100dvh-11rem-env(safe-area-inset-bottom))] max-w-2xl flex-col md:h-[calc(100dvh-6rem)]">
      <div className="mb-3 flex items-center gap-3 border-b border-brand-hairline pb-3">
        <button type="button" onClick={() => router.back()} className="dash-icon-btn -ml-1.5" aria-label="Back">
          <ArrowLeft className="size-4" />
        </button>
        <div>
          <h1 className="text-base font-semibold">{otherLabel}</h1>
          <p className="text-xs text-brand-ink-muted">Messages about this delivery</p>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pr-1" role="log" aria-live="polite">
        {!messages ? (
          <PageLoader label="Loading messages" />
        ) : messages.length === 0 ? (
          <p className="py-16 text-center text-sm text-brand-ink-muted">No messages yet. Say hello to your {otherLabel.toLowerCase()}.</p>
        ) : (
          <ul className="space-y-2 py-2">
            {messages.map((m) => {
              const mine = m.senderId?._id === user?._id;
              return (
                <li key={m._id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                      mine ? "bg-brand-primary text-white" : "border border-brand-hairline bg-brand-canvas-soft text-brand-ink",
                    )}
                  >
                    <p className="break-words whitespace-pre-wrap">{m.message}</p>
                    <p className={cn("mt-1 text-[11px]", mine ? "text-white/70" : "text-brand-ink-faint")}>{formatTime(m.createdAt)}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <div ref={endRef} />
      </div>

      {error && (
        <Notice tone="danger" className="mb-2">
          {error}
        </Notice>
      )}

      <form onSubmit={send} className="flex items-end gap-2 border-t border-brand-hairline pt-3">
        <label htmlFor="message" className="sr-only">
          Message
        </label>
        <textarea
          id="message"
          rows={1}
          className="dash-input max-h-32 min-h-10 resize-none"
          placeholder="Type a message"
          value={text}
          maxLength={1000}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(e as unknown as React.FormEvent);
            }
          }}
        />
        <button type="submit" className="dash-btn dash-btn-primary h-10 w-10 px-0" disabled={!text.trim() || sending} aria-label="Send message">
          {sending ? <Spinner /> : <SendHorizontal className="size-4" />}
        </button>
      </form>
    </div>
  );
}
