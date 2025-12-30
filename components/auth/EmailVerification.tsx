"use client";
import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ToastProvider";
import { useAuthStore } from "@/app/store/authStore";
import { api } from "@/app/lib/api";

export default function EmailVerification({
  onSuccess,
}: {
  onSuccess: () => void;
}) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();
  const { userId, email } = useAuthStore();

  async function verifyEmail() {
    if (!code) {
      toast({
        title: "Missing code",
        description: "Please enter the verification code",
        variant: "destructive",
      });
      return;
    }

    if (!userId || !email) {
      toast({
        title: "Invalid session",
        description: "Please register again",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/verify-email", {
        email,
        userId,
        token: code,
      });

      toast({
        title: "Email verified",
        description: "Your email has been successfully verified",
      });

      onSuccess();
    } catch (err: any) {
      toast({
        title: "Verification failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4 max-w-md mx-auto">
      <label className="text-[14px] font-medium">
        Enter verification code sent to your email
      </label>
      <Input
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="123456"
      />
      <Button
        className="bg-[#337BFF] text-white w-full"
        onClick={verifyEmail}
        disabled={loading}
      >
        {loading ? "Verifying..." : "Verify Email"}
      </Button>
    </div>
  );
}
