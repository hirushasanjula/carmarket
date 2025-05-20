"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardDescription,
  CardContent,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TriangleAlert } from "lucide-react";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const router = useRouter();
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setPending(true); // Show loading state
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });
    setPending(false);
    if (res?.error) {
      setError("Invalid email or password");
    } else {
      window.alert("Login successful");
      toast.success("Login successful");
      router.push("/");
    }
  };

  const handleProvider = (event, value) => {
    event.preventDefault();
    signIn(value, { callbackUrl: "/" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br p-4">
      <Card className="w-full max-w-md shadow-2xl bg-white/95 backdrop-blur">
        <CardHeader className="space-y-4 pb-6">
          <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-blue-600 to-blue-600 bg-clip-text text-transparent">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-base text-center">
            Sign in to your account
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {!!error && (
            <div className="bg-red-100 border-l-4 border-red-500 p-4 rounded-md flex items-center gap-x-2 text-red-700">
              <TriangleAlert className="h-5 w-5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <Input
                type="email"
                disabled={pending}
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 px-4 bg-gray-50/50 border-gray-200 focus:ring-2 focus:ring-purple-500"
              />
              <Input
                type="password"
                disabled={pending}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 px-4 bg-gray-50/50 border-gray-200 focus:ring-2 focus:ring-purple-500"
              />
              <div className="text-right">
                <Link
                  href="/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>

            <Button
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white font-medium text-lg transition-all duration-300"
              disabled={pending}
            >
              {pending ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="relative">
            <Separator className="my-8" />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-sm text-gray-500">
              or continue with
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <Button
              onClick={(e) => handleProvider(e, "google")}
              variant="outline"
              className="h-12 border-2 hover:bg-gray-50 transition-all duration-300"
            >
              <FcGoogle className="h-6 w-6 mr-2" />
              Google
            </Button>
          </div>

          <p className="text-center text-sm text-gray-600">
            Don’t have an account?{" "}
            <Link
              href="/sign-up"
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignIn;