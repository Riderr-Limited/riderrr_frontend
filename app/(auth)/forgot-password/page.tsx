// app/auth/forgot-password/page.tsx
"use client";

import { useState, Suspense } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  IconMail,
  IconPhone,
  IconLoader2,
  IconCheck,
  IconArrowLeft,
} from "@tabler/icons-react";
import Image from "next/image";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

function ForgotPasswordContent() {
  const [identifier, setIdentifier] = useState("");
  const [step, setStep] = useState<"request" | "verify" | "success">("request");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPhone, setIsPhone] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { forgotPassword, resetPassword } = useAuth();
  const router = useRouter();

  const checkIdentifierType = (value: string) => {
    const cleanedValue = value.replace(/\s/g, "");
    const phoneRegex = /^(?:\+234\d{10}|0\d{10})$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (phoneRegex.test(cleanedValue)) {
      setIsPhone(true);
    } else if (emailRegex.test(value)) {
      setIsPhone(false);
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const formatPhone = (phone: string): string => {
    const cleaned = phone.replace(/[^\d+]/g, "");
    if (cleaned.startsWith("0")) {
      return cleaned.substring(0, 11);
    }
    if (cleaned.startsWith("234") && !cleaned.startsWith("+234")) {
      return `+${cleaned.substring(0, 13)}`;
    }
    if (cleaned.startsWith("+234")) {
      return cleaned.substring(0, 14);
    }
    return cleaned;
  };

  async function handleRequestReset(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!identifier.trim()) {
      setError("Email is required");
      return;
    }

    if (!validateEmail(identifier) && isPhone) {
      setError("Please use email address for password reset (phone reset coming soon)");
      return;
    }

    setIsLoading(true);

    try {
      let resetIdentifier = identifier.trim();

      if (isPhone) {
        resetIdentifier = formatPhone(identifier);
        // For now, only email is supported in backend
        setError("Please use email address for password reset");
        setIsLoading(false);
        return;
      }

      const result = await forgotPassword(resetIdentifier);
      
      if (result.success) {
        setSuccess(result.message || "Reset instructions sent!");
        setStep("verify");
      } else {
        throw new Error(result.message || "Failed to send reset instructions");
      }
    } catch (error: unknown) {
      console.error("Forgot password error:", error);
      if (
        error &&
        typeof error === "object" &&
        "message" in error &&
        typeof (error as { message?: string }).message === "string"
      ) {
        setError((error as { message: string }).message);
      } else {
        setError("Failed to send reset instructions. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleVerifyAndReset(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!otp.trim()) {
      setError("OTP is required");
      return;
    }

    if (!newPassword.trim()) {
      setError("New password is required");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const result = await resetPassword({
        email: identifier,
        otp,
        newPassword,
      });

      if (result.success) {
        setSuccess(result.message || "Password reset successfully!");
        setStep("success");
      } else {
        throw new Error(result.message || "Failed to reset password");
      }
    } catch (error: unknown) {
      console.error("Reset password error:", error);
      if (
        error &&
        typeof error === "object" &&
        "message" in error &&
        typeof (error as { message?: string }).message === "string"
      ) {
        setError((error as { message: string }).message);
      } else {
        setError("Failed to reset password. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white rounded-2xl shadow-xl p-8">
        <div>
          <div className="flex justify-center">
            <div className="w-20 h-20 flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="logo"
                width={70}
                height={70}
                className="rounded-lg"
              />
            </div>
          </div>
          <h2 className="mt-6 text-center text-2xl font-extrabold text-gray-900">
            {step === "success" ? "Password Reset Successful!" : "Reset Your Password"}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {step === "request"
              ? "Enter your email to receive a reset code"
              : step === "verify"
              ? "Enter the OTP and new password"
              : "You can now login with your new password"}
          </p>
        </div>

        {step === "success" ? (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md">
              <div className="flex items-center">
                <IconCheck className="h-5 w-5 mr-2" />
                <p className="font-medium">{success}</p>
              </div>
            </div>
            <div className="flex flex-col space-y-4">
              <Button
                onClick={() => router.push("/auth/login")}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Go to Login
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setStep("request");
                  setIdentifier("");
                  setOtp("");
                  setNewPassword("");
                  setConfirmPassword("");
                }}
                className="w-full py-2.5 px-4"
              >
                Reset Another Password
              </Button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={
              step === "request" ? handleRequestReset : handleVerifyAndReset
            }
            className="space-y-6"
          >
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                <p className="font-medium">Error</p>
                <p className="text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md">
                <p className="font-medium">Success</p>
                <p className="text-sm">{success}</p>
              </div>
            )}

            {step === "request" ? (
              <div>
                <label
                  htmlFor="identifier"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <IconMail className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="identifier"
                    name="identifier"
                    type="email"
                    autoComplete="email"
                    required
                    value={identifier}
                    onChange={(e) => {
                      const value = e.target.value;
                      setIdentifier(value);
                      checkIdentifierType(value);
                      setError("");
                    }}
                    className="pl-10 w-full"
                    placeholder="you@example.com"
                    disabled={isLoading}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Enter your registered email address. A reset code will be sent to you.
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  <strong>Note:</strong> Phone number reset is currently unavailable.
                </p>
              </div>
            ) : (
              <>
                <div>
                  <label
                    htmlFor="otp"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Verification Code
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <IconCheck className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="otp"
                      name="otp"
                      type="text"
                      required
                      value={otp}
                      onChange={(e) => {
                        setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                        setError("");
                      }}
                      className="pl-10 w-full"
                      placeholder="Enter 6-digit code"
                      disabled={isLoading}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the 6-digit code sent to your email.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="newPassword"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <IconMail className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type={showPassword ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setError("");
                      }}
                      className="pl-10 pr-10 w-full"
                      placeholder="••••••••"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <IconLoader2 className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <IconLoader2 className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Must be at least 6 characters long.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <IconMail className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setError("");
                      }}
                      className="pl-10 w-full"
                      placeholder="••••••••"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <IconLoader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    {step === "request" ? "Sending..." : "Resetting..."}
                  </>
                ) : step === "request" ? (
                  "Send Reset Code"
                ) : (
                  "Reset Password"
                )}
              </Button>

              {step === "verify" && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setStep("request");
                    setOtp("");
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                  className="w-full py-2.5 px-4"
                  disabled={isLoading}
                >
                  <IconArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              )}
            </div>
          </form>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Remember your password?{" "}
            <Link
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign in
            </Link>
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <ForgotPasswordContent />
    </Suspense>
  );
}