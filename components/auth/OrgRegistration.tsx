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
      <div className="flex gap-3 text-md">
        <div
          className={`md:px-3 px-2 text-[12px] md:text-[16px] text-center py-1 rounded ${
            step === 1 ? "bg-[#1E91D6] text-white" : "border-gray-400 border"
          }`}
        >
          Account Details
        </div>
        <div
          className={`md:px-3 px-2 py-1 text-[12px] md:text-[16px] text-center rounded ${
            step === 2 ? "bg-[#1E91D6] text-white" : "border border-gray-400"
          }`}
        >
          Contact Address
        </div>
        {/* <div
          className={`md:px-3 px-2 text-[12px] md:text-[16px] text-center py-1 rounded ${
            step === 3 ? "bg-[#1E91D6] text-white" : "border-gray-400 border"
          }`}
        >
          Documents
        </div> */}
        <div
          className={`md:px-3 px-2 py-1 text-[12px] md:text-[16px] text-center rounded ${
            step === 3 ? "bg-[#1E91D6] text-white" : "border-gray-400 border"
          }`}
        >
          Bank Details
        </div>
      </div>

      {step === 1 && (
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-md">Business name</label>
            <Input
              value={form.businessName}
              onChange={(e) => update("businessName", e.target.value)}
              placeholder="Riderr"
            />
          </div>
          <div>
            <label className="text-md">Company Phone</label>
            <Input
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="+234808047228"
            />
          </div>
          <div>
            <label className="text-md">Contact Phone</label>
            <Input
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="+234808047228"
            />
          </div>
          <div>
            <label className="text-md">Email</label>
            <Input
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="email@gmail.com"
            />
          </div>
          <div>
            <label className="text-md">Password</label>
            <Input
              type="password"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              placeholder="....."
            />
          </div>
          <div>
            <label className="text-md">Confirm Password</label>
            <Input
              type="password"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              placeholder="....."
            />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label>Address</label>
            <Input
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
              placeholder="123, Example Street"
            />
          </div>
          <div>
            <label>City / LGA</label>
            <Input
              value={form.city}
              onChange={(e) => update("city", e.target.value)}
              placeholder="Abuja"
            />
          </div>
          <div>
            <label>Business reg. number</label>
            <Input
              value={form.regNumber}
              onChange={(e) => update("regNumber", e.target.value)}
              placeholder="RC12345678"
            />
          </div>
          <div>
            <label>Tax ID (optional)</label>
            <Input
              value={form.taxId}
              onChange={(e) => update("taxId", e.target.value)}
              placeholder="TIN12345678"
            />
          </div>
          <div className="">
            <Button className="text-white mb-2">Upload logo</Button>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => update("logo", e.target.files?.[0] || null)}
            />
          </div>
        </div>
      )}

      {/* {step === 3 && (
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
      )} */}

      {step === 3 && (
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label>Bank name</label>
            <Input
              value={form.bankName}
              onChange={(e) => update("bankName", e.target.value)}
              placeholder="Access Bank"
            />
          </div>
          <div>
            <label>Account number</label>
            <Input
              value={form.accountNumber}
              onChange={(e) => update("accountNumber", e.target.value)}
              placeholder="0123456789"
            />
          </div>
          <div>
            <label>Account name</label>
            <Input
              value={form.accountName}
              onChange={(e) => update("accountName", e.target.value)}
              placeholder="Riderr Limited"
            />
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          {step > 1 && (
            <Button
              className="bg-transparent underline hover:bg-transparent"
              onClick={() => setStep(step - 1)}
            >
              Back
            </Button>
          )}
        </div>
        <div>
          {step < 3 ? (
            <Button
              className="bg-[#1E91D6] text-white"
              onClick={() => setStep(step + 1)}
            >
              Next
            </Button>
          ) : (
            <Button
              className=" text-white"
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
