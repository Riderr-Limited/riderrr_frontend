"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/dashboard/primitives";
import { BackLink } from "@/components/app/BackLink";
import { Button, Notice } from "@/components/app/ui";
import { cn } from "@/lib/utils";
import { errorMessage } from "@/lib/app/api";
import { useQueryParam } from "@/lib/app/hooks";
import { support } from "@/lib/app/services";

const CATEGORIES = [
  { id: "payment issues", label: "Payment issues" },
  { id: "delivery problems", label: "Delivery problems" },
  { id: "app technical issues", label: "Technical issues" },
  { id: "account problems", label: "Account problems" },
  { id: "safety concerns", label: "Safety concerns" },
  { id: "other", label: "Other" },
];

export default function ReportIssuePage() {
  const preset = useQueryParam("category");
  const [chosenCategory, setCategory] = useState<string | null>(null);
  const category = chosenCategory ?? (preset && CATEGORIES.some((c) => c.id === preset) ? preset : "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ticketId, setTicketId] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !title.trim() || !description.trim()) return setError("Choose a category and fill in both fields.");
    if (description.trim().length < 20) return setError("Please describe the issue in at least 20 characters.");
    setBusy(true);
    setError(null);
    try {
      const res = await support.createTicket({ issueType: category, title: title.trim(), description: description.trim() });
      setTicketId(res.data?.ticketId ?? "");
    } catch (err) {
      setError(errorMessage(err, "We couldn't submit your report. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  if (ticketId !== null) {
    return (
      <div className="mx-auto max-w-md py-10 text-center">
        <CheckCircle2 aria-hidden className="mx-auto size-10 text-emerald-600" />
        <h1 className="mt-4 text-lg font-semibold">Report received</h1>
        <p className="mt-1 text-sm text-brand-ink-muted">
          {ticketId ? `Your ticket number is ${ticketId}. ` : ""}Our team will get back to you shortly.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Link href="/app/support/tickets" className="dash-btn dash-btn-primary">
            View my tickets
          </Link>
          <Link href="/app/support" className="dash-btn dash-btn-secondary">
            Back to support
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <BackLink href="/app/support" label="Support" />
      <PageHeader title="Report an issue" description="Tell us what happened and we'll look into it." />
      <form onSubmit={submit} className="max-w-xl space-y-5" noValidate>
        <fieldset>
          <legend className="dash-label">What is it about?</legend>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                aria-pressed={category === c.id}
                onClick={() => setCategory(c.id)}
                className={cn(
                  "h-9 rounded-md border px-3 text-sm transition-colors",
                  category === c.id
                    ? "border-brand-primary bg-brand-primary/[0.06] font-medium text-brand-primary-active"
                    : "border-brand-hairline text-brand-ink-secondary hover:bg-brand-canvas-soft",
                )}
              >
                {c.label}
              </button>
            ))}
          </div>
        </fieldset>
        <div>
          <label htmlFor="title" className="dash-label">
            Title
          </label>
          <input id="title" className="dash-input h-11" maxLength={100} placeholder="A short summary" value={title} onChange={(e) => setTitle(e.target.value)} />
          <p className="mt-1 text-right text-xs text-brand-ink-faint">{title.length}/100</p>
        </div>
        <div>
          <label htmlFor="description" className="dash-label">
            What happened?
          </label>
          <textarea
            id="description"
            className="dash-input min-h-36 resize-y"
            maxLength={500}
            placeholder="Include when it happened, the order number if you have it, and anything you've already tried."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <p className="mt-1 text-right text-xs text-brand-ink-faint">{description.length}/500</p>
        </div>
        {error && <Notice tone="danger">{error}</Notice>}
        <Button type="submit" size="lg" loading={busy}>
          Submit report
        </Button>
      </form>
    </>
  );
}
