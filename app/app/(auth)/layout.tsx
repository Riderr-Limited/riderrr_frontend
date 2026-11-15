import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh bg-white lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <aside className="relative hidden flex-col justify-between bg-brand-secondary p-10 text-white lg:flex">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/icons/icon-96.png" alt="" width={30} height={30} className="rounded-md" />
          <span className="text-lg font-semibold tracking-tight">Riderr</span>
        </Link>
        <div className="max-w-md">
          <h2 className="text-3xl leading-tight font-semibold tracking-tight">
            Everything in the Riderr app, now in your browser.
          </h2>
          <ul className="mt-8 space-y-4 text-[15px] text-white/75">
            <li className="flex gap-3">
              <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-white/60" />
              Send packages with an upfront fare and live tracking.
            </li>
            <li className="flex gap-3">
              <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-white/60" />
              Send a rider on errands, or order with pay on delivery.
            </li>
            <li className="flex gap-3">
              <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-white/60" />
              Riders can go online, take requests and track earnings.
            </li>
          </ul>
        </div>
        <p className="text-sm text-white/50">Install it from your browser to use it like an app.</p>
      </aside>

      <main className="flex flex-col px-5 pt-[max(1.5rem,env(safe-area-inset-top))] pb-10 sm:px-10">
        <Link href="/" className="flex items-center gap-2 lg:hidden">
          <Image src="/icons/icon-96.png" alt="" width={28} height={28} className="rounded-md" />
          <span className="text-base font-semibold tracking-tight">Riderr</span>
        </Link>
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </main>
    </div>
  );
}
