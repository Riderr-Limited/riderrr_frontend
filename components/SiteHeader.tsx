// components/SiteHeader.tsx
import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/">
          <div className="font-bold text-3xl text-[#1E91D6]">RIDERR</div>
        </Link>
        <nav className="space-x-4 text-sm text-[#1E91D6]">
          <Link href="/onboarding" className="hover:underline">
            Sign in
          </Link>
        </nav>
      </div>
    </header>
  );
}
