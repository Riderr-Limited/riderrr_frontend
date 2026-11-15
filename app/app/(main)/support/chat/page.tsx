"use client";

import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { SendHorizontal } from "lucide-react";
import { BackLink } from "@/components/app/BackLink";
import { Notice, PageLoader, Spinner } from "@/components/app/ui";
import { cn } from "@/lib/utils";
import { SOCKET_URL } from "@/lib/app/api";
import { formatTime } from "@/lib/app/format";
import { support } from "@/lib/app/services";
import { useSession } from "@/lib/app/session";
import { getAccessToken } from "@/lib/app/storage";
import type { SupportChatMessage } from "@/lib/app/types";

type Conn = "connecting" | "online" | "offline";

export default function LiveChatPage() {
  const user = useSession((s) => s.user);
  const [messages, setMessages] = useState<SupportChatMessage[] | null>(null);
  const [conn, setConn] = useState<Conn>("connecting");
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    support
      .chatHistory()
      .then(setMessages)
      .catch(() => setMessages([]));

    const socket = io(`${SOCKET_URL}/admin-chat`, {
      auth: { token: getAccessToken() },
      transports: ["websocket", "polling"],
      reconnection: true,
    });
    socket.on("connect", () => setConn("online"));
    socket.on("disconnect", () => setConn("offline"));
    socket.on("connect_error", () => setConn("offline"));
    socket.on("receive_message", (m: SupportChatMessage) => {
      setMessages((list) => {
        const current = list ?? [];
        return current.some((x) => x._id === m._id) ? current : [...current, m];
      });
    });
    socketRef.current = socket;
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages?.length]);

  const send = (e?: React.FormEvent) => {
    e?.preventDefault();
    const body = text.trim();
    const socket = socketRef.current;
    if (!body || !socket || sending) return;
    if (!socket.connected) {
      setError("You're not connected to support right now. We'll keep trying.");
      return;
    }
    setSending(true);
    setError(null);
    const timer = window.setTimeout(() => {
      setSending(false);
      setError("Your message didn't go through. Try again.");
    }, 10000);
    socket.emit("send_message", { message: body }, (res: { success?: boolean; message?: string }) => {
      window.clearTimeout(timer);
      setSending(false);
      if (res?.success) setText("");
      else setError(res?.message || "Your message didn't go through. Try again.");
    });
  };

  return (
    <div className="mx-auto flex h-[calc(100dvh-11rem-env(safe-area-inset-bottom))] max-w-2xl flex-col md:h-[calc(100dvh-6rem)]">
      <BackLink href="/app/support" label="Support" />
      <div className="mb-3 flex items-center justify-between border-b border-brand-hairline pb-3">
        <h1 className="text-base font-semibold">Live chat</h1>
        <span className="inline-flex items-center gap-1.5 text-xs text-brand-ink-muted">
          <span
            className={cn(
              "size-1.5 rounded-full",
              conn === "online" ? "bg-emerald-500" : conn === "connecting" ? "bg-amber-400" : "bg-brand-ink-faint",
            )}
          />
          {conn === "online" ? "Connected" : conn === "connecting" ? "Connecting" : "Reconnecting"}
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pr-1" role="log" aria-live="polite">
        {!messages ? (
          <PageLoader label="Loading conversation" />
        ) : messages.length === 0 ? (
          <p className="py-16 text-center text-sm text-brand-ink-muted">Send us a message and someone from our team will reply here.</p>
        ) : (
          <ul className="space-y-2 py-2">
            {messages.map((m) => {
              const mine = m.senderId?._id === user?._id && !m.isAdminMessage;
              return (
                <li key={m._id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                      mine ? "bg-brand-primary text-white" : "border border-brand-hairline bg-brand-canvas-soft text-brand-ink",
                    )}
                  >
                    {!mine && <p className="mb-0.5 text-xs font-medium text-brand-ink-muted">{m.senderId?.name ?? "Support"}</p>}
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
        <label htmlFor="support-message" className="sr-only">
          Message
        </label>
        <textarea
          id="support-message"
          rows={1}
          className="dash-input max-h-32 min-h-10 resize-none"
          placeholder="Type your message"
          value={text}
          maxLength={1000}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
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
