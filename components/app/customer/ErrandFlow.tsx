"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { errorMessage } from "@/lib/app/api";
import { ERRAND_TYPES, naira } from "@/lib/app/format";
import { errands } from "@/lib/app/services";
import type { Company, Place } from "@/lib/app/types";
import { Button, KeyValue, Notice, Stepper } from "../ui";
import { PlaceInput } from "../PlaceInput";
import { CompanyField } from "./CompanyPicker";

const STEPS = ["Task", "Locations", "Review"];
type ErrandType = (typeof ERRAND_TYPES)[number]["key"];
type PayMethod = "CASH" | "CARD" | "WALLET";

export function ErrandFlow() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [company, setCompany] = useState<Company | null>(null);
  const [type, setType] = useState<ErrandType>("PURCHASE");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [pickup, setPickup] = useState<Place | null>(null);
  const [destination, setDestination] = useState<Place | null>(null);
  const [limit, setLimit] = useState("");
  const [advance, setAdvance] = useState("");
  const [method, setMethod] = useState<PayMethod>("CASH");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = (): string | null => {
    if (step === 0) {
      if (!company) return "Choose the company that should handle this errand.";
      if (description.trim().length < 10) return "Describe the task in a bit more detail (at least 10 characters).";
    }
    if (step === 1) {
      if (!pickup) return "Choose where the rider should go.";
      if (type === "PURCHASE" && !(Number(limit) > 0)) return "Set a spending limit for purchases.";
      if (advance && !(Number(advance) >= 0)) return "Enter a valid cash advance.";
    }
    return null;
  };

  const next = () => {
    const problem = validate();
    setError(problem);
    if (!problem) setStep((s) => s + 1);
  };

  const submit = async () => {
    if (!company || !pickup) return;
    setBusy(true);
    setError(null);
    try {
      const body: Record<string, unknown> = {
        companyId: company._id,
        errandType: type,
        description: description.trim(),
        specialInstructions: instructions.trim(),
        pickupAddress: pickup.address,
        pickupLat: pickup.lat,
        pickupLng: pickup.lng,
        paymentMethod: method,
      };
      if (destination) {
        body.destinationAddress = destination.address;
        body.destinationLat = destination.lat;
        body.destinationLng = destination.lng;
      }
      if (limit) body.spendingLimit = Number(limit);
      if (advance) body.customerAdvance = Number(advance);
      const res = await errands.create(body);
      if (res.success === false) throw new Error(res.message);
      toast.success("Errand submitted", { description: "A rider will be assigned shortly." });
      router.push("/app/deliveries?tab=errands");
    } catch (e) {
      setError(errorMessage(e, "We couldn't submit your errand."));
      setBusy(false);
    }
  };

  const typeLabel = ERRAND_TYPES.find((t) => t.key === type)?.label ?? type;

  return (
    <div className="max-w-xl">
      <Stepper steps={STEPS} current={step} />

      {step === 0 && (
        <div className="space-y-5">
          <CompanyField value={company} onChange={setCompany} />
          <fieldset>
            <legend className="dash-label">Type of errand</legend>
            <div className="flex flex-wrap gap-2">
              {ERRAND_TYPES.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  aria-pressed={type === t.key}
                  onClick={() => setType(t.key)}
                  className={cn(
                    "h-9 rounded-md border px-3 text-sm transition-colors",
                    type === t.key
                      ? "border-brand-primary bg-brand-primary/[0.06] font-medium text-brand-primary-active"
                      : "border-brand-hairline text-brand-ink-secondary hover:bg-brand-canvas-soft",
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </fieldset>
          <div>
            <label htmlFor="task" className="dash-label">
              Describe the task
            </label>
            <textarea
              id="task"
              className="dash-input min-h-24 resize-y"
              maxLength={500}
              placeholder="e.g. Buy 2 bags of rice from Shoprite Ikeja and deliver to my house"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="instructions" className="dash-label">
              Notes for the rider <span className="font-normal text-brand-ink-faint">(optional)</span>
            </label>
            <input id="instructions" className="dash-input h-11" value={instructions} onChange={(e) => setInstructions(e.target.value)} />
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-5">
          <PlaceInput label="Where should the rider go?" marker="pickup" value={pickup} onChange={setPickup} placeholder="Task location or pickup" />
          <PlaceInput
            label="Deliver to"
            optional
            marker="dropoff"
            value={destination}
            onChange={setDestination}
            placeholder="Where should it be delivered?"
            bias={pickup}
          />
          {type === "PURCHASE" && (
            <MoneyField id="limit" label="Spending limit" hint="The most the rider may spend on your behalf." value={limit} onChange={setLimit} />
          )}
          <MoneyField id="advance" label="Cash advance to rider" optional hint="Money you'll hand the rider upfront." value={advance} onChange={setAdvance} />
          <fieldset>
            <legend className="dash-label">Payment method</legend>
            <div className="dash-tabs">
              {(["CASH", "CARD", "WALLET"] as PayMethod[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  aria-pressed={method === m}
                  onClick={() => setMethod(m)}
                  className={cn("dash-tab", method === m && "border-brand-hairline bg-white text-brand-ink")}
                >
                  {m.charAt(0) + m.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </fieldset>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="divide-y divide-brand-hairline rounded-lg border border-brand-hairline px-4">
            <KeyValue label="Company">{company?.name}</KeyValue>
            <KeyValue label="Type">{typeLabel}</KeyValue>
            <KeyValue label="Task">{description}</KeyValue>
            {instructions && <KeyValue label="Notes">{instructions}</KeyValue>}
            <KeyValue label="Rider goes to">{pickup?.address}</KeyValue>
            {destination && <KeyValue label="Deliver to">{destination.address}</KeyValue>}
            {limit && <KeyValue label="Spending limit">{naira(limit)}</KeyValue>}
            {advance && <KeyValue label="Cash advance">{naira(advance)}</KeyValue>}
            <KeyValue label="Payment">{method.charAt(0) + method.slice(1).toLowerCase()}</KeyValue>
          </div>
          <Notice tone="info">You&apos;ll confirm completion once the rider finishes the task.</Notice>
        </div>
      )}

      {error && (
        <Notice tone="danger" className="mt-4">
          {error}
        </Notice>
      )}

      <div className="mt-6 flex gap-2">
        {step > 0 && (
          <Button variant="secondary" size="lg" onClick={() => { setError(null); setStep((s) => s - 1); }} disabled={busy}>
            Back
          </Button>
        )}
        <Button size="lg" className="flex-1" onClick={step < 2 ? next : submit} loading={busy}>
          {step < 2 ? "Continue" : "Submit errand"}
        </Button>
      </div>
    </div>
  );
}

export function MoneyField({
  id,
  label,
  value,
  onChange,
  hint,
  optional,
  placeholder = "0",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  optional?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="dash-label">
        {label}
        {optional && <span className="font-normal text-brand-ink-faint"> (optional)</span>}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-brand-ink-muted">₦</span>
        <input
          id={id}
          inputMode="decimal"
          className="dash-input h-11 pl-7 tabular-nums"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/[^\d.]/g, ""))}
        />
      </div>
      {hint && <p className="mt-1 text-xs text-brand-ink-faint">{hint}</p>}
    </div>
  );
}
