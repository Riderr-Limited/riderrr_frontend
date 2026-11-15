import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="mb-4 inline-flex items-center gap-1.5 text-[13px] text-brand-ink-muted hover:text-brand-ink">
      <ArrowLeft aria-hidden className="size-3.5" />
      {label}
    </Link>
  );
}
