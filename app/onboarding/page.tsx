"use client";

import LoginForm from "@/components/auth/LoginForm";
import OrgRegistration from "@/components/auth/OrgRegistration";
import { useState } from "react";
import Image from "next/image";

export default function AuthPage() {
  const [view, setView] = useState<"login" | "register">("login");

  return (
    <div className="flex min-h-screen bg-indigo-50">
      <div className="md:w-1/2  flex flex-col justify-center p-4 md:px-8">
        <h1 className="md:text-4xl text-xl font-400 mb-3">
          {view == "login" ? "Log in to your account" : "Create a new account"}
        </h1>
        <p className="text-gray-500 mb-10 max-w-md leading-relaxed">
          Manage deliveries, couriers, and your entire delivery operations in
          one professional dashboard.
        </p>

        {view === "login" ? (
          <LoginForm />
        ) : (
          <OrgRegistration onComplete={() => setView("login")} />
        )}

        <div className="mt-8 text-md">
          {view === "login" ? (
            <p>
              Don’t have an account?{" "}
              <button
                onClick={() => setView("register")}
                className="text-[#0072BB] font-medium"
              >
                Sign up now
              </button>
            </p>
          ) : (
            <p>
              Already have an account? {""}
              <button
                onClick={() => setView("login")}
                className="text-[#0072BB] font-medium"
              >
                Log in
              </button>
            </p>
          )}
        </div>
      </div>
      <div
        className="md:w-1/2 hidden relative md:flex items-center justify-center overflow-hidden
      bg-linear-to-br from-indigo-700 via-indigo-800 to-[#0072BB] text-white"
      >
        <div className="absolute inset-0 opacity-20">
          <Image
            src="/auth.jpg"
            alt="Background Icons"
            fill
            className="object-cover"
          />
        </div>

        <div className="relative text-center px-10">
          <h2 className="font-semibold tracking-widest mb-3 text-md opacity-80">
            DASHBOARD ORGANIZATION • DELIVERY MANAGEMENT
          </h2>
          <p className="text-xl max-w-md mx-auto leading-relaxed opacity-95">
            Manage your courier fleet, track deliveries in real time, and
            improve the operational efficiency of your delivery business — all
            in one platform.
          </p>
        </div>
      </div>
    </div>
  );
}
