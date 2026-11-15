"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { errorMessage } from "@/lib/app/api";
import { naira } from "@/lib/app/format";
import { pod } from "@/lib/app/services";
import { useSession } from "@/lib/app/session";
import type { Company, Place } from "@/lib/app/types";
import { Button, KeyValue, Notice, Stepper } from "../ui";
import { PlaceInput } from "../PlaceInput";
import { CompanyField } from "./CompanyPicker";
import { MoneyField } from "./ErrandFlow";

const STEPS = ["Product", "Locations", "Review"];

export function PodFlow() {
  const router = useRouter();
  const user = useSession((s) => s.user);
  const [step, setStep] = useState(0);
  const [company, setCompany] = useState<Company | null>(user?.companyId ? { _id: user.companyId, name: "" } : null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [fee, setFee] = useState("");
  const [pickup, setPickup] = useState<Place | null>(null);
  const [pickupNotes, setPickupNotes] = useState("");
  const [dropoff, setDropoff] = useState<Place | null>(null);
  const [dropoffNotes, setDropoffNotes] = useState("");
  const [recipient, setRecipient] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = (Number(amount) || 0) + (Number(fee) || 0);

  const validate = (): string | null => {
    if (step === 0) {
      if (!company) return "Choose the merchant you're ordering from.";
      if (!name.trim()) return "Enter the product name.";
      if (!(Number(amount) > 0)) return "Enter the product amount.";
    }
    if (step === 1) {
      if (!pickup) return "Choose the merchant's pickup address.";
      if (!dropoff) return "Choose where it should be delivered.";
      if (!recipient.trim()) return "Enter the recipient's name.";
      if (phone.replace(/\D/g, "").length < 10) return "Enter the recipient's phone number.";
    }
    return null;
  };

  const next = () => {
    const problem = validate();
    setError(problem);
    if (!problem) setStep((s) => s + 1);
  };

  const submit = async () => {
    if (!company || !pickup || !dropoff) return;
    setBusy(true);
    setError(null);
    try {
      const res = await pod.create({
        companyId: company._id,
        productName: name.trim(),
        productDescription: description.trim(),
        productAmount: Number(amount),
        deliveryFee: fee ? Number(fee) : 0,
        pickupAddress: pickup.address,
        pickupLat: pickup.lat,
        pickupLng: pickup.lng,
        pickupInstructions: pickupNotes.trim(),
        dropoffAddress: dropoff.address,
        dropoffLat: dropoff.lat,
        dropoffLng: dropoff.lng,
        recipientName: recipient.trim(),
        recipientPhone: phone.trim(),
        dropoffInstructions: dropoffNotes.trim(),
        paymentMethod: "CASH_ON_DELIVERY",
        inspectionAllowed: true,
      });
      if (res.success === false) throw new Error(res.message);
      toast.success("Order placed", { description: "We'll let you know once the merchant confirms it." });
      router.push("/app/deliveries?tab=pod");
    } catch (e) {
      setError(errorMessage(e, "We couldn't place your order."));
      setBusy(false);
    }
  };

  return (
    <div className="max-w-xl">
      <Stepper steps={STEPS} current={step} />

      {step === 0 && (
        <div className="space-y-5">
          <CompanyField label="Merchant" value={company} onChange={setCompany} />
          <div>
            <label htmlFor="product" className="dash-label">
              Product name
            </label>
            <input id="product" className="dash-input h-11" placeholder="e.g. Nike Air Max" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label htmlFor="product-desc" className="dash-label">
              Description <span className="font-normal text-brand-ink-faint">(optional)</span>
            </label>
            <input id="product-desc" className="dash-input h-11" placeholder="Size, colour, variant" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <MoneyField id="amount" label="Product amount" value={amount} onChange={setAmount} />
            <MoneyField id="fee" label="Delivery fee" optional value={fee} onChange={setFee} />
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-5">
          <PlaceInput label="Pickup (merchant)" marker="pickup" value={pickup} onChange={setPickup} placeholder="Merchant or store address" allowCurrentLocation={false} />
          <div>
            <label htmlFor="pickup-notes" className="dash-label">
              Pickup instructions <span className="font-normal text-brand-ink-faint">(optional)</span>
            </label>
            <input id="pickup-notes" className="dash-input h-11" placeholder="e.g. Call on arrival" value={pickupNotes} onChange={(e) => setPickupNotes(e.target.value)} />
          </div>
          <PlaceInput label="Deliver to" marker="dropoff" value={dropoff} onChange={setDropoff} placeholder="Delivery address" bias={pickup} />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="recipient" className="dash-label">
                Recipient name
              </label>
              <input id="recipient" className="dash-input h-11" autoComplete="name" value={recipient} onChange={(e) => setRecipient(e.target.value)} />
            </div>
            <div>
              <label htmlFor="recipient-phone" className="dash-label">
                Recipient phone
              </label>
              <input id="recipient-phone" type="tel" className="dash-input h-11" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>
          <div>
            <label htmlFor="dropoff-notes" className="dash-label">
              Delivery instructions <span className="font-normal text-brand-ink-faint">(optional)</span>
            </label>
            <input id="dropoff-notes" className="dash-input h-11" placeholder="e.g. Gate 2" value={dropoffNotes} onChange={(e) => setDropoffNotes(e.target.value)} />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="divide-y divide-brand-hairline rounded-lg border border-brand-hairline px-4">
            <KeyValue label="Merchant">{company?.name || "Your company"}</KeyValue>
            <KeyValue label="Product">{name}</KeyValue>
            {description && <KeyValue label="Description">{description}</KeyValue>}
            <KeyValue label="Product amount">{naira(amount)}</KeyValue>
            {fee && <KeyValue label="Delivery fee">{naira(fee)}</KeyValue>}
            <KeyValue label="You pay on delivery" strong>
              {naira(total)}
            </KeyValue>
            <KeyValue label="Pickup">{pickup?.address}</KeyValue>
            <KeyValue label="Deliver to">{dropoff?.address}</KeyValue>
            <KeyValue label="Recipient">
              {recipient} · {phone}
            </KeyValue>
          </div>
          <Notice tone="info">You can inspect the product when it arrives and only pay once you accept it.</Notice>
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
          {step < 2 ? "Continue" : "Place order"}
        </Button>
      </div>
    </div>
  );
}
