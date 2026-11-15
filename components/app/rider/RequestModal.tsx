"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RouteStops } from "@/components/dashboard/primitives";
import { errorMessage } from "@/lib/app/api";
import { naira } from "@/lib/app/format";
import { useRider } from "@/lib/app/rider-runtime";
import { rider } from "@/lib/app/services";
import { Button, Modal, Notice } from "../ui";
import { RouteMap } from "../RouteMap";
import axios from "axios";

/** Incoming delivery request, shown on any rider page while online. */
export function RequestModal() {
  const { request, dismissRequest, refreshDeliveries } = useRider();
  const router = useRouter();
  const [busy, setBusy] = useState<"accept" | "reject" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paymentNote, setPaymentNote] = useState<{ message: string; method?: string } | null>(null);

  useEffect(() => {
    setError(null);
    setPaymentNote(null);
  }, [request?._id]);

  if (!request) return null;

  const accept = async () => {
    setBusy("accept");
    setError(null);
    setPaymentNote(null);
    try {
      await rider.accept(request._id);
      dismissRequest(request._id);
      await refreshDeliveries();
      router.push(`/app/rider/deliveries/${request._id}`);
    } catch (e) {
      if (axios.isAxiosError(e) && e.response?.status === 400) {
        const data = e.response.data as { message?: string; data?: { requiresPayment?: boolean; paymentMethod?: string } };
        if (data?.data?.requiresPayment) {
          setPaymentNote({ message: data.message ?? "The customer hasn't paid yet.", method: data.data.paymentMethod });
          return;
        }
      }
      setError(errorMessage(e, "We couldn't accept this request. It may have been taken."));
    } finally {
      setBusy(null);
    }
  };

  const reject = async () => {
    setBusy("reject");
    try {
      await rider.reject(request._id);
    } catch {
      // Declining locally is enough if the server call fails.
    } finally {
      dismissRequest(request._id);
      setBusy(null);
    }
  };

  const minutes = (request.estimatedDurationMin ?? 0) + 5;
  const km = request.estimatedDistanceKm ?? 0;

  return (
    <Modal
      open
      onClose={() => dismissRequest(request._id)}
      title="New delivery request"
      description="Accept to start heading to pickup."
      footer={
        <>
          <Button variant="secondary" onClick={reject} loading={busy === "reject"} disabled={!!busy}>
            Decline
          </Button>
          <Button onClick={accept} loading={busy === "accept"} disabled={!!busy}>
            Accept
          </Button>
        </>
      }
    >
      <RouteMap pickup={request.pickup} dropoff={request.dropoff} className="mb-4 h-44 rounded-md border border-brand-hairline" />
      <RouteStops pickup={request.pickup?.address} dropoff={request.dropoff?.address} />
      <dl className="mt-4 grid grid-cols-3 gap-px overflow-hidden rounded-md border border-brand-hairline bg-brand-hairline text-center">
        <div className="bg-white px-2 py-3">
          <dt className="text-xs text-brand-ink-muted">Time</dt>
          <dd className="mt-0.5 font-semibold tabular-nums">{minutes} min</dd>
        </div>
        <div className="bg-white px-2 py-3">
          <dt className="text-xs text-brand-ink-muted">Distance</dt>
          <dd className="mt-0.5 font-semibold tabular-nums">{km.toFixed(1)} km</dd>
        </div>
        <div className="bg-white px-2 py-3">
          <dt className="text-xs text-brand-ink-muted">Fare</dt>
          <dd className="mt-0.5 font-semibold tabular-nums">{naira(request.fare?.totalFare)}</dd>
        </div>
      </dl>
      {paymentNote && (
        <Notice tone="warning" className="mt-4">
          <p className="font-medium">Payment required</p>
          <p className="mt-0.5">{paymentNote.message}</p>
          {paymentNote.method && <p className="mt-0.5 text-xs">Method: {paymentNote.method.replace(/_/g, " ")}</p>}
        </Notice>
      )}
      {error && (
        <Notice tone="danger" className="mt-4">
          {error}
        </Notice>
      )}
    </Modal>
  );
}
