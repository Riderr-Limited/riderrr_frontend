import type { PropsWithChildren } from "react";

export default function Card({
  children,
  className = "",
}: PropsWithChildren<{ className?: string }>) {
  return (
    <div className={`bg-white rounded p-4 shadow ${className}`}>{children}</div>
  );
}
