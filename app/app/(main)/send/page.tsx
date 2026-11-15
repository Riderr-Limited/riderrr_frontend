"use client";

import { useState } from "react";
import { PageHeader } from "@/components/dashboard/primitives";
import { DeliveryFlow } from "@/components/app/customer/DeliveryFlow";
import { ErrandFlow } from "@/components/app/customer/ErrandFlow";
import { PodFlow } from "@/components/app/customer/PodFlow";
import { Segmented } from "@/components/app/ui";
import { useQueryParam } from "@/lib/app/hooks";

type Kind = "delivery" | "errand" | "pod";

const COPY: Record<Kind, { title: string; description: string }> = {
  delivery: { title: "Send a package", description: "Get an upfront fare and a nearby rider." },
  errand: { title: "Run an errand", description: "Send a rider to buy, collect or drop something off." },
  pod: { title: "Pay on delivery", description: "Order from a merchant and pay when it arrives." },
};

export default function SendPage() {
  const requested = useQueryParam("type");
  const [chosen, setKind] = useState<Kind | null>(null);
  const kind: Kind = chosen ?? (requested === "errand" || requested === "pod" ? requested : "delivery");

  const change = (k: Kind) => {
    setKind(k);
    window.history.replaceState(null, "", `/app/send?type=${k}`);
  };

  return (
    <>
      <PageHeader title={COPY[kind].title} description={COPY[kind].description} />
      <Segmented
        label="Request type"
        value={kind}
        onChange={change}
        className="mb-6"
        options={[
          { value: "delivery", label: "Delivery" },
          { value: "errand", label: "Errand" },
          { value: "pod", label: "Pay on delivery" },
        ]}
      />
      {/* Keyed so switching type starts that flow fresh, as the mobile tabs do. */}
      {kind === "delivery" && <DeliveryFlow key="delivery" />}
      {kind === "errand" && <ErrandFlow key="errand" />}
      {kind === "pod" && <PodFlow key="pod" />}
    </>
  );
}
