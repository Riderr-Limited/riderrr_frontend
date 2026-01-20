

export function SiteHeader() {
  return (
    <header className="flex md:hidden bg-gradient-to-bl to-[#0072BB] from-[#1E91D6] h-12 items-center gap-2 border-b">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <button className="text-white p-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="mx-2 h-4 w-px bg-gray-300" />
      </div>
    </header>
  );
}
