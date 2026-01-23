// components/auth/LoginForm.tsx
"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  IconEye,
  IconEyeOff,
  IconMail,
  IconLock,
  IconLoader2,
  IconPhone,
} from "@tabler/icons-react";
import Image from "next/image";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function LoginForm() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPhone, setIsPhone] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard/dashboard";

  const checkIdentifierType = (value: string) => {
    // Remove spaces for phone validation
    const cleanedValue = value.replace(/\s/g, "");

    // Phone regex: starts with +234 or 0, followed by 10 or 11 digits
    const phoneRegex = /^(?:\+234\d{10}|0\d{10})$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (phoneRegex.test(cleanedValue)) {
      setIsPhone(true);
    } else if (emailRegex.test(value)) {
      setIsPhone(false);
    }
  };

  const validateIdentifier = (value: string): boolean => {
    const cleanedValue = value.replace(/\s/g, "");
    const phoneRegex = /^(?:\+234\d{10}|0\d{10})$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return phoneRegex.test(cleanedValue) || emailRegex.test(value);
  };

  const formatPhone = (phone: string): string => {
    // Remove all non-digits except +
    const cleaned = phone.replace(/[^\d+]/g, "");

    // If starts with 0, keep as is (11 digits)
    if (cleaned.startsWith("0")) {
      return cleaned.substring(0, 11);
    }

    // If starts with 234 (without +), add +
    if (cleaned.startsWith("234") && !cleaned.startsWith("+234")) {
      return `+${cleaned.substring(0, 13)}`;
    }

    // If starts with +234, keep as is (14 digits with +)
    if (cleaned.startsWith("+234")) {
      return cleaned.substring(0, 14);
    }

    return cleaned;
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!identifier.trim()) {
      setError("Email or phone number is required");
      return;
    }

    if (!password.trim()) {
      setError("Password is required");
      return;
    }

    if (!validateIdentifier(identifier)) {
      setError(
        isPhone
          ? "Please enter a valid phone number (format: 08012345678 or +2348012345678)"
          : "Please enter a valid email address",
      );
      return;
    }

    setIsLoading(true);

    try {
      let loginIdentifier = identifier.trim();

      // Format phone number if needed
      if (isPhone) {
        loginIdentifier = formatPhone(identifier);
      }

      await login({
        emailOrPhone: loginIdentifier,
        password,
      });

      router.push(redirectTo);
    } catch (error: any) {
      console.error("Login error:", error);
      setError(error.message || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  }

  const handleDemoLogin = async (
    role: "customer" | "driver" | "company_admin" | "admin",
  ) => {
    setIsLoading(true);
    setError("");

    const demoCredentials = {
      customer: { emailOrPhone: "customer@demo.com", password: "demo123" },
      driver: { emailOrPhone: "driver@demo.com", password: "demo123" },
      company_admin: { emailOrPhone: "company@demo.com", password: "demo123" },
      admin: { emailOrPhone: "admin@demo.com", password: "demo123" },
    };

    try {
      await login(demoCredentials[role]);
      router.push(redirectTo);
    } catch (error: any) {
      console.error("Demo login error:", error);
      setError(error.message || "Demo login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white rounded-2xl shadow-xl p-8">
        <div>
          <div className="flex justify-center">
            <div className="w-20 h-20    flex items-center justify-center">
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
            Welcome Back to Riderr
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to your account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label
                htmlFor="identifier"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email or Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {isPhone ? (
                    <IconPhone className="h-5 w-5 text-gray-400" />
                  ) : (
                    <IconMail className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <Input
                  id="identifier"
                  name="identifier"
                  type={isPhone ? "tel" : "email"}
                  autoComplete={isPhone ? "tel" : "email"}
                  required
                  value={identifier}
                  onChange={(e) => {
                    const value = e.target.value;
                    setIdentifier(value);
                    checkIdentifierType(value);
                    setError("");
                  }}
                  className="pl-10 w-full"
                  placeholder={
                    isPhone
                      ? "08012345678 or +2348012345678"
                      : "you@example.com"
                  }
                  disabled={isLoading}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Enter your registered email address or phone number
              </p>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IconLock className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
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
                    <IconEyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <IconEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={isLoading}
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-900"
              >
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link
                href="/forgot-password"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <Button
              type="submit"
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <IconLoader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
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
