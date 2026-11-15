"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { Phone } from "lucide-react";
import { toast } from "sonner";
import { BackLink } from "@/components/app/BackLink";
import { Button, KeyValue, Modal, Notice, PageLoader, StatusBadge } from "@/components/app/ui";
import { errorMessage } from "@/lib/app/api";
import { naira, podStatus } from "@/lib/app/format";
import { useResource } from "@/lib/app/hooks";
import { pod } from "@/lib/app/services";

export default function RiderPodPage() {
  const { id } = useParams<{ id: string }>();
  // The mobile app opens this screen from the list; fall back to the list if the single-order call is refused.
  const { data: order, loading, error, reload } = useResource(
    () =>
      pod.get(id).catch(async (e) => {
        const found = (await pod.list()).find((o) => o._id === id);
        if (!found) throw e;
        return found;
      }),
    { pollMs: 15000 },
  );
  const [confirm, setConfirm] = useState<"arrived" | "paid" | null>(null);
  const [busy, setBusy] = useState(false);

  if (loading && !order) return <PageLoader />;
  if (!order) {
    return (
      <>
        <BackLink href="/app/rider/jobs?tab=pod" label="Jobs" />
        <Notice tone="danger">{error ?? "We couldn't find this order."}</Notice>
      </>
    );
  }

  const meta = podStatus(order.status);
  const outForDelivery = order.status === "OUT_FOR_DELIVERY";
  const awaiting = order.status === "AWAITING_CUSTOMER";

  const run = async () => {
    setBusy(true);
    try {
      const res = confirm === "arrived" ? await pod.markAwaiting(order._id) : await pod.recordPayment(order._id, "Cash collected at door");
      if (!res.success) throw new Error(res.message);
      toast.success(confirm === "arrived" ? "Customer notified that you've arrived." : "Payment recorded. Order complete.");
      setConfirm(null);
      reload(true);
    } catch (e) {
      toast.error(errorMessage(e, "We couldn't update this order."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <BackLink href="/app/rider/jobs?tab=pod" label="Jobs" />
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">{order.product?.name}</h1>
          <p className="text-[13px] text-brand-ink-muted">{order.referenceId}</p>
        </div>
        <StatusBadge tone={meta.tone}>{meta.label}</StatusBadge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-5">
          <div className="rounded-lg border border-brand-hairline px-5 py-4">
            <p className="text-[13px] text-brand-ink-muted">Collect from customer</p>
            <p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums">{naira(order.amountToCollect)}</p>
            {order.inspectionAllowed && <p className="mt-1 text-[13px] text-brand-ink-muted">The customer may inspect the product before paying.</p>}
          </div>

          {outForDelivery && (
            <Button size="lg" block onClick={() => setConfirm("arrived")}>
              I&apos;ve arrived
            </Button>
          )}
          {awaiting && (
            <Button size="lg" block onClick={() => setConfirm("paid")}>
              Record cash payment
            </Button>
          )}
          {order.status === "REJECTED_RETURN" && (
            <Notice tone="warning">The customer rejected this product. Return it to the merchant.</Notice>
          )}
        </div>

        <div className="space-y-4">
          <Card title="Product">
            <KeyValue label="Name">{order.product?.name}</KeyValue>
            {order.product?.description && <KeyValue label="Description">{order.product.description}</KeyValue>}
            <KeyValue label="Quantity">{order.product?.quantity ?? 1}</KeyValue>
          </Card>
          <Card title="Pickup">
            <KeyValue label="Address">{order.pickup?.address}</KeyValue>
            {order.pickup?.instructions && <KeyValue label="Instructions">{order.pickup.instructions}</KeyValue>}
          </Card>
          <Card title="Drop-off">
            <KeyValue label="Address">{order.dropoff?.address}</KeyValue>
            {order.dropoff?.recipientName && <KeyValue label="Recipient">{order.dropoff.recipientName}</KeyValue>}
            {order.dropoff?.recipientPhone && (
              <KeyValue label="Phone">
                <a href={`tel:${order.dropoff.recipientPhone}`} className="inline-flex items-center gap-1 text-brand-primary hover:underline">
                  <Phone aria-hidden className="size-3.5" />
                  {order.dropoff.recipientPhone}
                </a>
              </KeyValue>
            )}
            {order.dropoff?.instructions && <KeyValue label="Instructions">{order.dropoff.instructions}</KeyValue>}
          </Card>
          {order.companyId?.name && (
            <Card title="Merchant">
              <KeyValue label="Name">{order.companyId.name}</KeyValue>
              {order.companyId.contactPhone && (
                <KeyValue label="Phone">
                  <a href={`tel:${order.companyId.contactPhone}`} className="text-brand-primary hover:underline">
                    {order.companyId.contactPhone}
                  </a>
                </KeyValue>
              )}
            </Card>
          )}
        </div>
      </div>

      <Modal
        open={!!confirm}
        onClose={() => !busy && setConfirm(null)}
        title={confirm === "arrived" ? "Mark as arrived?" : "Record payment?"}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirm(null)} disabled={busy}>
              Cancel
            </Button>
            <Button onClick={run} loading={busy}>
              Confirm
            </Button>
          </>
        }
      >
        <p className="text-sm text-brand-ink-secondary">
          {confirm === "arrived"
            ? "We'll let the customer know you're at the door."
            : `Confirm you've collected ${naira(order.amountToCollect)} from the customer.`}
        </p>
      </Modal>
    </>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-brand-hairline px-4 pt-3 pb-1">
      <p className="dash-eyebrow">{title}</p>
      <div className="divide-y divide-brand-hairline">{children}</div>
    </div>
  );
}
