"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState("request");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStep("verify");
      } else {
        setError(data.error || "Failed to send OTP");
      }
    } catch (err) {
      setError("Server error");
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (res.ok) {
        setStep("reset");
      } else {
        setError(data.error || "Invalid OTP");
      }
    } catch (err) {
      setError("Server error");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push("/sign-in");
      } else {
        setError(data.error || "Failed to reset password");
      }
    } catch (err) {
      setError("Server error");
    }
  };

  const handleResendOTP = async () => {
    setError("");
    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to resend OTP");
      }
    } catch (err) {
      setError("Server error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br p-4">
      <Card className="w-full max-w-md shadow-2xl bg-white/95 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-blue-600 to-blue-600 bg-clip-text text-transparent">
            {step === "request" && "Forgot Password"}
            {step === "verify" && "Verify OTP"}
            {step === "reset" && "Reset Password"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 p-4 rounded-md flex items-center gap-x-2 text-red-700">
              <TriangleAlert className="h-5 w-5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {step === "request" && (
            <form onSubmit={handleRequestOTP} className="space-y-4">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="h-12 px-4 bg-gray-50/50 border-gray-200 focus:ring-2 focus:ring-purple-500"
                required
              />
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white font-medium text-lg"
              >
                Send OTP
              </Button>
            </form>
          )}

          {step === "verify" && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <Input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
                className="h-12 px-4 bg-gray-50/50 border-gray-200 focus:ring-2 focus:ring-purple-500"
                required
              />
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white font-medium text-lg"
              >
                Verify OTP
              </Button>
              <Button
                type="button"
                onClick={handleResendOTP}
                className="w-full h-12 bg-gray-600 hover:bg-gray-700 text-white font-medium text-lg"
              >
                Resend OTP
              </Button>
            </form>
          )}

          {step === "reset" && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="h-12 px-4 bg-gray-50/50 border-gray-200 focus:ring-2 focus:ring-purple-500"
                required
              />
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white font-medium text-lg"
              >
                Reset Password
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}