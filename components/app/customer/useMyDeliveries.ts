"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useInterval, useResource } from "@/lib/app/hooks";
import { deliveries } from "@/lib/app/services";

/**
 * The customer's deliveries, polled every 3s while one is still looking for a
 * rider (15s otherwise). When a rider accepts, jump to live tracking like the
 * mobile app does.
 */
export function useMyDeliveries() {
  const router = useRouter();
  const resource = useResource(deliveries.mine);
  const { data, reload } = resource;
  const isSearching = (data ?? []).some((d) => d.status === "created");

  const previous = useRef<Map<string, string>>(new Map());
  useEffect(() => {
    if (!data) return;
    const before = previous.current;
    const accepted = data.find((d) => before.get(d._id) === "created" && d.status === "assigned");
    previous.current = new Map(data.map((d) => [d._id, d.status]));
    if (accepted) {
      toast.success("A rider accepted your delivery.");
      router.push(`/app/deliveries/${accepted._id}`);
    }
  }, [data, router]);

  useInterval(() => {
    if (document.visibilityState === "visible") reload(true);
  }, isSearching ? 3000 : 15000);

  return resource;
}
