"use client";

import LoginForm from "@/components/auth/LoginForm";
import OrgRegistration from "@/components/auth/OrgRegistration";
import { useState } from "react";

export default function AuthPage() {
  const [view, setView] = useState<"login" | "register">("login");

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            {view === "login" ? "Organization Login" : "Register Organization"}
          </h2>
          <div className="text-sm">
            {view === "login" ? (
              <button onClick={() => setView("register")} className="underline">
                Create account
              </button>
            ) : (
              <button onClick={() => setView("login")} className="underline">
                Back to login
              </button>
            )}
          </div>
        </div>

        {view === "login" ? (
          <LoginForm />
        ) : (
          <OrgRegistration onComplete={() => setView("login")} />
        )}
      </div>
    </div>
  );
}
