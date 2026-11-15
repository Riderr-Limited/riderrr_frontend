import Image from "next/image";
import { ReloadButton } from "./ReloadButton";

export const metadata = { title: "You're offline · Riderr", robots: { index: false } };

export default function OfflinePage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-white px-6 text-center">
      <Image src="/icons/icon-192.png" alt="" width={56} height={56} className="rounded-xl" />
      <h1 className="mt-6 text-xl font-semibold tracking-tight text-brand-ink">You&apos;re offline</h1>
      <p className="mt-2 max-w-sm text-sm text-brand-ink-muted">
        Riderr needs a connection to show live deliveries and payments. Check your internet and try again.
      </p>
      <ReloadButton />
    </div>
  );
}
