"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { errorMessage } from "@/lib/app/api";
import { useCopy } from "@/lib/app/hooks";
import { naira } from "@/lib/app/format";
import { payments } from "@/lib/app/services";
import type { TransferInit } from "@/lib/app/types";
import { Button, Modal, Notice, Spinner } from "../ui";

/** Shows the account to pay into and confirms the transfer with the server. */
export function BankTransferPanel({
  deliveryId,
  fallbackAmount,
  onPaid,
}: {
  deliveryId: string;
  fallbackAmount?: number;
  onPaid: () => void;
}) {
  const [data, setData] = useState<TransferInit | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { copied, copy } = useCopy();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await payments.initializeTransfer(deliveryId);
      if (res.success && res.data) setData(res.data);
      else setError(res.message || "We couldn't get the transfer details.");
    } catch (e) {
      setError(errorMessage(e, "We couldn't get the transfer details."));
    } finally {
      setLoading(false);
    }
  }, [deliveryId]);

  useEffect(() => {
    load();
  }, [load]);

  const confirm = async () => {
    if (!data?.reference) return;
    setVerifying(true);
    setError(null);
    try {
      const res = await payments.verify(data.reference);
      if (res.success && res.data?.status === "successful") onPaid();
      else setError(res.message || "We haven't received the transfer yet. Give it a minute and try again.");
    } catch (e) {
      setError(errorMessage(e, "We couldn't confirm the payment yet."));
    } finally {
      setVerifying(false);
    }
  };

  const amount = data?.amountFormatted ?? naira(fallbackAmount);
  const bank = data?.bankAccount;

  return (
    <div>
      <div className="rounded-lg border border-brand-hairline px-5 py-4 text-center">
        <p className="text-[13px] text-brand-ink-muted">Transfer exactly</p>
        <p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums">{loading ? "…" : amount}</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-10 text-sm text-brand-ink-muted">
          <Spinner /> Generating transfer details
        </div>
      ) : bank ? (
        <>
          <dl className="mt-4 divide-y divide-brand-hairline rounded-lg border border-brand-hairline">
            <Row label="Bank" value={bank.bankName} />
            <Row
              label="Account number"
              value={<span className="font-semibold tracking-wide tabular-nums">{bank.accountNumber}</span>}
              action={
                <button
                  type="button"
                  className="dash-btn dash-btn-ghost dash-btn-sm"
                  onClick={() => copy(bank.accountNumber, "account")}
                  aria-label="Copy account number"
                >
                  {copied === "account" ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                  {copied === "account" ? "Copied" : "Copy"}
                </button>
              }
            />
            <Row label="Account name" value={bank.accountName} />
            <Row
              label="Amount"
              value={<span className="font-semibold tabular-nums">{amount}</span>}
              action={
                data?.amount ? (
                  <button
                    type="button"
                    className="dash-btn dash-btn-ghost dash-btn-sm"
                    onClick={() => copy(String(data.amount), "amount")}
                    aria-label="Copy amount"
                  >
                    {copied === "amount" ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                    {copied === "amount" ? "Copied" : "Copy"}
                  </button>
                ) : null
              }
            />
          </dl>
          <ol className="mt-4 space-y-1.5 text-sm text-brand-ink-muted">
            <li>1. Open your banking app and transfer exactly {amount}.</li>
            <li>2. Come back here and select &ldquo;I&apos;ve sent the money&rdquo;.</li>
          </ol>
        </>
      ) : null}

      {error && (
        <Notice tone="danger" className="mt-4">
          {error}
          {!bank && !loading && (
            <button type="button" onClick={load} className="ml-1 font-medium underline">
              Try again
            </button>
          )}
        </Notice>
      )}

      {bank && (
        <Button className="mt-5" size="lg" block onClick={confirm} loading={verifying}>
          I&apos;ve sent the money
        </Button>
      )}
    </div>
  );
}

function Row({ label, value, action }: { label: string; value: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
      <div className="min-w-0">
        <dt className="text-xs text-brand-ink-muted">{label}</dt>
        <dd className="mt-0.5 break-words text-brand-ink">{value}</dd>
      </div>
      {action}
    </div>
  );
}

export function BankTransferModal({
  deliveryId,
  open,
  onClose,
  onPaid,
}: {
  deliveryId: string | null;
  open: boolean;
  onClose: () => void;
  onPaid: () => void;
}) {
  return (
    <Modal open={open && !!deliveryId} onClose={onClose} title="Pay by bank transfer" size="md">
      {deliveryId && <BankTransferPanel deliveryId={deliveryId} onPaid={onPaid} />}
    </Modal>
  );
}
