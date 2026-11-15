"use client";

import { useState } from "react";
import { Download, PlusSquare, Share } from "lucide-react";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/app/ui";
import { useInstall } from "./install-store";

/**
 * "Install app" control. Renders nothing when the app is already installed or
 * the browser can't install it; on iOS it explains Add to Home Screen.
 */
export function InstallButton({
  className,
  variant = "secondary",
  label = "Install app",
  hideWhenUnavailable = true,
}: {
  className?: string;
  variant?: "primary" | "secondary" | "ghost";
  label?: string;
  hideWhenUnavailable?: boolean;
}) {
  const { canPrompt, needsIOSInstructions, installed, promptInstall } = useInstall();
  const [showIOS, setShowIOS] = useState(false);
  const [showGeneric, setShowGeneric] = useState(false);

  if (installed) return null;
  if (hideWhenUnavailable && !canPrompt && !needsIOSInstructions) return null;

  const onClick = () => {
    if (canPrompt) promptInstall();
    else if (needsIOSInstructions) setShowIOS(true);
    else setShowGeneric(true);
  };

  return (
    <>
      <button type="button" onClick={onClick} className={cn("dash-btn", `dash-btn-${variant}`, className)}>
        <Download aria-hidden className="size-4" />
        {label}
      </button>

      <Modal open={showIOS} onClose={() => setShowIOS(false)} title="Install Riderr on your iPhone" size="sm">
        <ol className="space-y-4 text-sm text-brand-ink-secondary">
          <li className="flex gap-3">
            <Step n={1} />
            <span>
              Tap the <Share aria-label="Share" className="inline size-4 align-text-bottom text-brand-primary" /> Share
              button in Safari&apos;s toolbar.
            </span>
          </li>
          <li className="flex gap-3">
            <Step n={2} />
            <span>
              Scroll down and choose <strong className="font-medium text-brand-ink">Add to Home Screen</strong>{" "}
              <PlusSquare aria-hidden className="inline size-4 align-text-bottom" />.
            </span>
          </li>
          <li className="flex gap-3">
            <Step n={3} />
            <span>Tap Add. Riderr opens full screen from your home screen, like any other app.</span>
          </li>
        </ol>
      </Modal>

      <Modal open={showGeneric} onClose={() => setShowGeneric(false)} title="Install Riderr" size="sm">
        <p className="text-sm text-brand-ink-secondary">
          Open your browser&apos;s menu and choose <strong className="font-medium text-brand-ink">Install app</strong> or{" "}
          <strong className="font-medium text-brand-ink">Add to Home screen</strong>. In Chrome and Edge on a computer,
          you can also use the install icon at the right of the address bar.
        </p>
      </Modal>
    </>
  );
}

function Step({ n }: { n: number }) {
  return (
    <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full border border-brand-hairline text-xs font-medium tabular-nums text-brand-ink">
      {n}
    </span>
  );
}
