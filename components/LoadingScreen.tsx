export default function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div
        role="status"
        aria-label="Loading"
        className="size-5 animate-spin rounded-full border-2 border-brand-hairline border-t-brand-ink-muted"
      />
    </div>
  )
}
