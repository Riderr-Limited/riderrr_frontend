"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ToastProvider";
import axios from "axios";
import { useAuthStore } from "@/store/authStore";
import { useOrgStore } from "@/store/orgRegistration.store";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const VERIFICATION_API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function OrgRegistration() {
  const router = useRouter();
  const { toast } = useToast();

  // Use stores
  const { step, loading, form, setStep, update, setLoading } = useOrgStore();
  const { setAuth } = useAuthStore();

  // Local states for verification flow
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = useCallback((field: string, value: string) => {
    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors };
      const optionalFields = [
        "taxId",
        "bankName",
        "accountName",
        "accountNumber",
      ];

      if (!value && !optionalFields.includes(field)) {
        newErrors[field] = "This field is required";
      } else if (value) {
        switch (field) {
          case "email":
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
              newErrors.email = "Invalid email format";
            } else {
              delete newErrors.email;
            }
            break;

          case "phone":
          case "companyPhone":
            if (!/^(?:\+234\d{10}|0\d{10})$/.test(value)) {
              newErrors[field] = "Use format: 08012345678 or +2348012345678";
            } else {
              delete newErrors[field];
            }
            break;

          case "password":
            if (value.length < 6) {
              newErrors.password = "Minimum 6 characters required";
            } else {
              delete newErrors.password;
            }
            break;

          case "accountNumber":
            if (!/^\d{10}$/.test(value)) {
              newErrors.accountNumber = "Must be 10 digits";
            } else {
              delete newErrors.accountNumber;
            }
            break;

          default:
            delete newErrors[field];
        }
      } else {
        delete newErrors[field];
      }

      return newErrors;
    });
  }, []);

  const validateStep = useCallback(
    (currentStep: number): boolean => {
      const newErrors: Record<string, string> = {};
      const stepFields: Record<number, string[]> = {
        1: ["companyName", "name", "phone", "email", "password"],
        2: [
          "address",
          "city",
          "state",
          "lga",
          "businessLicense",
          "companyPhone",
        ],
      };

      const fieldsToValidate = stepFields[currentStep] || [];

      fieldsToValidate.forEach((field: string) => {
        const value = form[field as keyof typeof form];
        if (!value) {
          newErrors[field] = "Required";
        } else {
          if (field === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            newErrors.email = "Invalid email";
          }
          if (
            (field === "phone" || field === "companyPhone") &&
            !/^(?:\+234\d{10}|0\d{10})$/.test(value)
          ) {
            newErrors[field] = "Invalid phone format";
          }
          if (field === "password" && value.length < 6) {
            newErrors.password = "Min 6 characters";
          }
        }
      });

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    [form],
  );

  const handleNext = useCallback(() => {
    if (validateStep(step)) {
      setStep(step + 1);
    } else {
      toast({
        title: "Validation Error",
        description: "Please complete all required fields",
        type: "error",
      });
    }
  }, [step, validateStep, setStep, toast]);

  const handlePrevious = useCallback(() => {
    setStep(step - 1);
    setErrors({});
  }, [step, setStep]);

  const handleApiError = useCallback((err: unknown): string => {
    if (axios.isAxiosError(err)) {
      const status = err.response?.status;
      const data = err.response?.data;

      if (status === 422 && data?.errors) {
        return Array.isArray(data.errors)
          ? data.errors
              .map((e: Record<string, string>) => Object.values(e)[0])
              .join(", ")
          : data.message || "Validation failed";
      }
      if (status === 409) return "Email or phone already registered";
      if (status === 400) return data?.message || "Invalid request";
      if (status === 500) return "Server error. Try again later";
      if (data?.message) return data.message;
      if (!err.response) return "Network error. Check your connection";
    }
    return "An unexpected error occurred";
  }, []);

  const submitRegistration = useCallback(async () => {
    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        phone: form.phone.trim(),
        role: "company_admin",
        companyName: form.companyName.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        lga: form.lga.trim(),
        businessLicense: form.businessLicense.trim(),
        taxId: form.taxId?.trim() || "",
        companyPhone: form.companyPhone.trim(),
        bankName: form.bankName?.trim() || "",
        accountName: form.accountName?.trim() || "",
        accountNumber: form.accountNumber?.trim() || "",
      };

      const { data } = await axios.post(`${API_BASE_URL}/auth/signup`, payload);

      if (data.data?.accessToken && data.data?.refreshToken) {
        setAuth({
          user: data.data.user,
          userId: data.data.user?._id,
          email: data.data.user?.email,
          accessToken: data.data.accessToken,
          refreshToken: data.data.refreshToken,
          requiresVerification: data.requiresVerification || true,
        });

        localStorage.setItem("accessToken", data.data.accessToken);
        localStorage.setItem("refreshToken", data.data.refreshToken);
        localStorage.setItem("userId", data.data.user?._id || "");
        localStorage.setItem("userEmail", form.email.trim().toLowerCase());
        if (data.data.user)
          localStorage.setItem("user", JSON.stringify(data.data.user));
      }

      setShowVerification(true);
      toast({
        title: "Success",
        description: "Check your email for verification code",
      });
    } catch (err) {
      toast({
        title: "Registration Failed",
        description: handleApiError(err),
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [form, setLoading, setAuth, toast, handleApiError]);

  const handleVerifyEmail = useCallback(async () => {
    if (verificationCode.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Enter 6-digit code",
        type: "error",
      });
      return;
    }

    setVerificationLoading(true);
    try {
      const { data } = await axios.post(
        `${VERIFICATION_API_URL}/auth/verify-email`,
        {
          email: form.email.trim().toLowerCase(),
          token: verificationCode,
        },
      );

      if (data.data?.accessToken) {
        setAuth({ accessToken: data.data.accessToken, user: data.data.user });
        localStorage.setItem("accessToken", data.data.accessToken);
        localStorage.setItem("isVerified", "true");
        if (data.data.user)
          localStorage.setItem("user", JSON.stringify(data.data.user));
      }

      toast({ title: "Success!", description: "Email verified successfully" });
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (err) {
      toast({
        title: "Verification Failed",
        description: handleApiError(err),
        type: "error",
      });
    } finally {
      setVerificationLoading(false);
    }
  }, [verificationCode, form.email, setAuth, router, toast, handleApiError]);

  const handleResendCode = useCallback(async () => {
    try {
      await axios.post(`${VERIFICATION_API_URL}/auth/resend-verification`, {
        email: form.email.trim().toLowerCase(),
      });
      toast({ title: "Code Sent", description: "Check your email" });
    } catch (err) {
      toast({
        title: "Failed",
        description: handleApiError(err),
        type: "error",
      });
    }
  }, [form.email, toast, handleApiError]);

  if (showVerification) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Verify Your Email
            </h2>
            <p className="text-gray-600 text-sm">
              Code sent to <span className="font-semibold">{form.email}</span>
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Verification Code
              </label>
              <Input
                type="text"
                value={verificationCode}
                maxLength={6}
                placeholder="000000"
                onChange={(e) =>
                  setVerificationCode(e.target.value.replace(/\D/g, ""))
                }
                className="text-center text-2xl tracking-widest font-semibold"
                autoFocus
              />
            </div>

            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleVerifyEmail}
              disabled={verificationLoading || verificationCode.length !== 6}
            >
              {verificationLoading ? "Verifying..." : "Verify Email"}
            </Button>

            <button
              type="button"
              onClick={handleResendCode}
              className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Resend Code
            </button>

            <button
              type="button"
              onClick={() => {
                setShowVerification(false);
                setVerificationCode("");
              }}
              className="w-full text-sm text-gray-500 hover:text-gray-700"
            >
              ← Back to registration
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Company Registration
          </h1>
          <p className="text-gray-600">
            Complete your registration in 3 simple steps
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex justify-center gap-4 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex flex-col items-center">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg transition-all ${
                  step === s
                    ? "bg-blue-600 text-white shadow-lg scale-110"
                    : step > s
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-500"
                }`}
              >
                {step > s ? "✓" : s}
              </div>
              <p className="text-xs font-medium mt-2 text-gray-600">
                {s === 1 ? "Account" : s === 2 ? "Company" : "Bank"}
              </p>
            </div>
          ))}
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
          {/* Step 1 */}
          {step === 1 && (
            <div>
              <h3 className="text-xl font-semibold mb-6 text-gray-900">
                Account Information
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                    Company Name *
                  </label>
                  <Input
                    value={form.companyName}
                    onChange={(e) => {
                      update("companyName", e.target.value);
                      validateField("companyName", e.target.value);
                    }}
                    placeholder="Acme Logistics"
                    className={errors.companyName ? "border-red-500" : ""}
                  />
                  {errors.companyName && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.companyName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                    Contact Person *
                  </label>
                  <Input
                    value={form.name}
                    onChange={(e) => {
                      update("name", e.target.value);
                      validateField("name", e.target.value);
                    }}
                    placeholder="John Doe"
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                    Email *
                  </label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => {
                      update("email", e.target.value);
                      validateField("email", e.target.value);
                    }}
                    placeholder="email@company.com"
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                    Password *
                  </label>
                  <Input
                    type="password"
                    value={form.password}
                    onChange={(e) => {
                      update("password", e.target.value);
                      validateField("password", e.target.value);
                    }}
                    placeholder="Min 6 characters"
                    className={errors.password ? "border-red-500" : ""}
                  />
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                    Contact Phone *
                  </label>
                  <Input
                    value={form.phone}
                    onChange={(e) => {
                      update("phone", e.target.value);
                      validateField("phone", e.target.value);
                    }}
                    placeholder="08012345678"
                    className={errors.phone ? "border-red-500" : ""}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                    Company Phone *
                  </label>
                  <Input
                    value={form.companyPhone}
                    onChange={(e) => {
                      update("companyPhone", e.target.value);
                      validateField("companyPhone", e.target.value);
                    }}
                    placeholder="08012345678"
                    className={errors.companyPhone ? "border-red-500" : ""}
                  />
                  {errors.companyPhone && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.companyPhone}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div>
              <h3 className="text-xl font-semibold mb-6 text-gray-900">
                Company Information
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                    Business Address *
                  </label>
                  <Input
                    value={form.address}
                    onChange={(e) => {
                      update("address", e.target.value);
                      validateField("address", e.target.value);
                    }}
                    placeholder="123 Business Street"
                    className={errors.address ? "border-red-500" : ""}
                  />
                  {errors.address && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.address}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                    City *
                  </label>
                  <Input
                    value={form.city}
                    onChange={(e) => {
                      update("city", e.target.value);
                      validateField("city", e.target.value);
                    }}
                    placeholder="Lagos"
                    className={errors.city ? "border-red-500" : ""}
                  />
                  {errors.city && (
                    <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                    State *
                  </label>
                  <Input
                    value={form.state}
                    onChange={(e) => {
                      update("state", e.target.value);
                      validateField("state", e.target.value);
                    }}
                    placeholder="Lagos"
                    className={errors.state ? "border-red-500" : ""}
                  />
                  {errors.state && (
                    <p className="text-red-500 text-xs mt-1">{errors.state}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                    LGA *
                  </label>
                  <Input
                    value={form.lga}
                    onChange={(e) => {
                      update("lga", e.target.value);
                      validateField("lga", e.target.value);
                    }}
                    placeholder="Ikeja"
                    className={errors.lga ? "border-red-500" : ""}
                  />
                  {errors.lga && (
                    <p className="text-red-500 text-xs mt-1">{errors.lga}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                    Business License *
                  </label>
                  <Input
                    value={form.businessLicense}
                    onChange={(e) => {
                      update("businessLicense", e.target.value);
                      validateField("businessLicense", e.target.value);
                    }}
                    placeholder="RC12345678"
                    className={errors.businessLicense ? "border-red-500" : ""}
                  />
                  {errors.businessLicense && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.businessLicense}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                    Tax ID (Optional)
                  </label>
                  <Input
                    value={form.taxId}
                    onChange={(e) => update("taxId", e.target.value)}
                    placeholder="TIN12345678"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">
                Bank Information
              </h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  Bank details are optional. You can add them later from
                  settings.
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                    Bank Name
                  </label>
                  <Input
                    value={form.bankName}
                    onChange={(e) => update("bankName", e.target.value)}
                    placeholder="Access Bank"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                    Account Name
                  </label>
                  <Input
                    value={form.accountName}
                    onChange={(e) => update("accountName", e.target.value)}
                    placeholder="Company Name"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                    Account Number
                  </label>
                  <Input
                    value={form.accountNumber}
                    onChange={(e) => {
                      update("accountNumber", e.target.value);
                      validateField("accountNumber", e.target.value);
                    }}
                    placeholder="0123456789"
                    maxLength={10}
                    className={errors.accountNumber ? "border-red-500" : ""}
                  />
                  {errors.accountNumber && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.accountNumber}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">Summary</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>
                    <span className="font-medium">Company:</span>{" "}
                    {form.companyName}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span> {form.email}
                  </p>
                  <p>
                    <span className="font-medium">Location:</span> {form.city},{" "}
                    {form.state}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t">
            {step > 1 ? (
              <Button
                onClick={handlePrevious}
                disabled={loading}
                className="bg-gray-200 text-gray-800 hover:bg-gray-300"
              >
                Previous
              </Button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <Button
                onClick={handleNext}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={submitRegistration}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {loading ? "Submitting..." : "Submit"}
              </Button>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 text-center mt-2">
              Step {step} of 3
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
