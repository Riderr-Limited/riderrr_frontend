// components/auth/OrgRegistration.tsx
"use client";
import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ToastProvider";
import axios from "axios";

export default function OrgRegistration({
  onComplete,
}: {
  onComplete?: () => void;
}) {
  const [step, setStep] = useState(1);

  interface OrgForm {
    businessName: string;
    businessType: "Restaurant" | "Retail" | "Logistics" | "Other";
    contactName: string;
    phone: string;
    email: string;
    password: string;
    address: string;
    city: string;
    regNumber: string;
    taxId: string;
    logo: File | null;
    regCertificate: File | null;
    directorId: File | null;
    utilityBill: File | null;
    bankName: string;
    accountNumber: string;
    accountName: string;
  }

  const [form, setForm] = useState<OrgForm>({
    businessName: "",
    businessType: "Restaurant",
    contactName: "",
    phone: "",
    email: "",
    password: "",
    address: "",
    city: "",
    regNumber: "",
    taxId: "",
    logo: null,
    regCertificate: null,
    directorId: null,
    utilityBill: null,
    bankName: "",
    accountNumber: "",
    accountName: "",
  });
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  function update<K extends keyof OrgForm>(field: K, value: OrgForm[K]) {
    setForm((s) => ({ ...s, [field]: value }));
  }

  async function submitRegistration() {
    setLoading(true);
    try {
      // For file uploads switch to FormData
      const payload = { ...form };
      await axios.post("/api/org/register", payload);
      toast({
        title: "Submitted",
        description: "Your registration is under review (24-48 hrs)",
      });
      onComplete?.();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === "string"
          ? err
          : "Try again";
      toast({
        title: "Registration error",
        description: message,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex gap-3 text-sm">
        <div
          className={`px-3 py-1 rounded ${
            step === 1 ? "bg-indigo-600 text-white" : "bg-slate-100"
          }`}
        >
          1. Account
        </div>
        <div
          className={`px-3 py-1 rounded ${
            step === 2 ? "bg-indigo-600 text-white" : "bg-slate-100"
          }`}
        >
          2. Business
        </div>
        <div
          className={`px-3 py-1 rounded ${
            step === 3 ? "bg-indigo-600 text-white" : "bg-slate-100"
          }`}
        >
          3. Documents
        </div>
        <div
          className={`px-3 py-1 rounded ${
            step === 4 ? "bg-indigo-600 text-white" : "bg-slate-100"
          }`}
        >
          4. Bank
        </div>
      </div>

      {step === 1 && (
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm">Business name</label>
            <Input
              value={form.businessName}
              onChange={(e) => update("businessName", e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm">Business type</label>
            <select
              value={form.businessType}
              onChange={(e) =>
                update(
                  "businessType",
                  e.target.value as OrgForm["businessType"]
                )
              }
              className="w-full border rounded px-3 py-2"
            >
              <option>Restaurant</option>
              <option>Retail</option>
              <option>Logistics</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="text-sm">Contact person</label>
            <Input
              value={form.contactName}
              onChange={(e) => update("contactName", e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm">Phone</label>
            <Input
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm">Email</label>
            <Input
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm">Password</label>
            <Input
              type="password"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
            />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label>Address (Google Places)</label>
            <Input
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
              placeholder="Start typing to search..."
            />
          </div>
          <div>
            <label>City / LGA</label>
            <Input
              value={form.city}
              onChange={(e) => update("city", e.target.value)}
            />
          </div>
          <div>
            <label>Business reg. number</label>
            <Input
              value={form.regNumber}
              onChange={(e) => update("regNumber", e.target.value)}
            />
          </div>
          <div>
            <label>Tax ID (optional)</label>
            <Input
              value={form.taxId}
              onChange={(e) => update("taxId", e.target.value)}
            />
          </div>
          <div>
            <label>Upload logo (min 200x200)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => update("logo", e.target.files?.[0] || null)}
            />
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label>Business registration certificate</label>
            <input
              type="file"
              onChange={(e) =>
                update("regCertificate", e.target.files?.[0] || null)
              }
            />
          </div>
          <div>
            <label>ID of director/owner</label>
            <input
              type="file"
              onChange={(e) =>
                update("directorId", e.target.files?.[0] || null)
              }
            />
          </div>
          <div>
            <label>Utility bill (address proof)</label>
            <input
              type="file"
              onChange={(e) =>
                update("utilityBill", e.target.files?.[0] || null)
              }
            />
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label>Bank name</label>
            <Input
              value={form.bankName}
              onChange={(e) => update("bankName", e.target.value)}
            />
          </div>
          <div>
            <label>Account number</label>
            <Input
              value={form.accountNumber}
              onChange={(e) => update("accountNumber", e.target.value)}
            />
          </div>
          <div>
            <label>Account name</label>
            <Input
              value={form.accountName}
              onChange={(e) => update("accountName", e.target.value)}
            />
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          {step > 1 && <Button onClick={() => setStep(step - 1)}>Back</Button>}
        </div>
        <div>
          {step < 4 ? (
            <Button
              className="bg-indigo-600 text-white"
              onClick={() => setStep(step + 1)}
            >
              Next
            </Button>
          ) : (
            <Button
              className="bg-green-600 text-white"
              onClick={submitRegistration}
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit for review"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
