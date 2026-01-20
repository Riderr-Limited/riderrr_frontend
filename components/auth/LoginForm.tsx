// components/auth/LoginForm.tsx
"use client";
import { useState } from "react";
import axios from "axios";
import { useToast } from "@/components/ToastProvider";
import { useRouter } from "next/navigation";


export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      // replace with real auth call
      //   const res = await axios.post("/api/auth/login", { email, password });
      // set auth state, then navigate to dashboard
      toast({ title: "Logged in", description: "Redirecting to dashboard" });
      router.push("/dashboard");
    } catch (err: unknown) {
      let description = "Check credentials";
      if (axios.isAxiosError(err)) {
        description =
          err?.response?.data?.message || err.message || description;
      } else if (err instanceof Error) {
        description = err.message;
      }
      toast({
        title: "Login failed",
        description,
      });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="md:max-w-[500px] space-y-4">
      <div>
        <label className="text-md">Email</label>
        <input
          className="w-full border rounded px-3 py-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@gmail.com"
        />
      </div>
      <div>
        <label className="text-md">Password</label>
        <input
          className="w-full border rounded px-3 py-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••"
          type="password"
        />
      </div>
      <div className="flex w-full justify-between items-center">
        <div />
        <button className="w-full bg-[#337BFF] text-white px-3 py-2 rounded" type="submit">
          Sign in
        </button>
      </div>
    </form>
  );
}
