"use client";

import Link from "next/link";
import { ChevronRight, CircleHelp, Flag, Mail, MessagesSquare, Phone, Ticket, Wallet, type LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/dashboard/primitives";
import { useSession } from "@/lib/app/session";

type Item = { href: string; icon: LucideIcon; title: string; body: string; external?: boolean };

export default function SupportPage() {
  const isRider = useSession((s) => s.user?.role === "driver");

  const help: Item[] = [
    { href: "/app/support/chat", icon: MessagesSquare, title: "Live chat", body: "Chat with our support team" },
    { href: "/app/support/tickets", icon: Ticket, title: "My tickets", body: "Follow up on issues you've reported" },
    { href: "/app/support/faq", icon: CircleHelp, title: "FAQs", body: "Quick answers to common questions" },
    ...(isRider
      ? [{ href: "/app/support/report?category=payment%20issues", icon: Wallet, title: "Earnings & payments", body: "Questions about a payout or fare" }]
      : []),
    { href: "/app/support/report", icon: Flag, title: "Report an issue", body: "Something went wrong? Let us know" },
  ];

  const contact: Item[] = [
    { href: "mailto:contact@riderr.ng", icon: Mail, title: "Email", body: "contact@riderr.ng", external: true },
    { href: "tel:+2349026161292", icon: Phone, title: "Call us", body: "+234 902 616 1292", external: true },
  ];

  return (
    <>
      <PageHeader title="Support" description="We're here to help with deliveries, payments and your account." />
      <Group title="Get help" items={help} />
      <Group title="Contact us" items={contact} />
    </>
  );
}

function Group({ title, items }: { title: string; items: Item[] }) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-sm font-semibold">{title}</h2>
      <ul className="divide-y divide-brand-hairline overflow-hidden rounded-lg border border-brand-hairline">
        {items.map((item) => {
          const inner = (
            <>
              <item.icon aria-hidden className="size-4 shrink-0 text-brand-ink-muted" />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium">{item.title}</span>
                <span className="block truncate text-[13px] text-brand-ink-muted">{item.body}</span>
              </span>
              <ChevronRight aria-hidden className="size-4 shrink-0 text-brand-ink-faint" />
            </>
          );
          const cls = "flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-brand-canvas-soft/60";
          return (
            <li key={item.href}>
              {item.external ? (
                <a href={item.href} className={cls}>
                  {inner}
                </a>
              ) : (
                <Link href={item.href} className={cls}>
                  {inner}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
