"use client";

import React, { useState } from 'react';
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
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { TriangleAlert } from "lucide-react";
import { signIn } from "next-auth/react";

const SignUp = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPending(true);

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();

    if (res.ok) {
      setPending(false);
      toast.success(data.message);
      router.push("/sign-in");
    } else {
      setError(data.message);
      setPending(false);
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
            Create Account
          </CardTitle>
          <CardDescription className="text-base text-center">
            Join us using your email or favorite service
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 p-4 rounded-md flex items-center gap-x-2 text-red-700">
              <TriangleAlert className="h-5 w-5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <Input
                type="text"
                disabled={pending}
                placeholder="Full name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="h-12 px-4 bg-gray-50/50 border-gray-200 focus:ring-2 focus:ring-blue-500"
              />
              <Input
                type="email"
                disabled={pending}
                placeholder="Email address"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="h-12 px-4 bg-gray-50/50 border-gray-200 focus:ring-2 focus:ring-blue-500"
              />
              <Input
                type="password"
                disabled={pending}
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                className="h-12 px-4 bg-gray-50/50 border-gray-200 focus:ring-2 focus:ring-blue-500"
              />
              <Input
                type="password"
                disabled={pending}
                placeholder="Confirm password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                required
                className="h-12 px-4 bg-gray-50/50 border-gray-200 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <Button 
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium text-lg transition-all duration-300" 
              disabled={pending}
            >
              {pending ? "Creating account..." : "Sign up"}
            </Button>
          </form>

          <div className="relative">
            <Separator className="my-8" />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-sm text-gray-500">
              or continue with
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={(e) => handleProvider(e, "google")}
              variant="outline"
              className="h-12 border-2 hover:bg-gray-50 transition-all duration-300"
            >
              <FcGoogle className="h-6 w-6 mr-2" />
              Google
            </Button>
            <Button
              onClick={(e) => handleProvider(e, "github")}
              variant="outline"
              className="h-12 border-2 hover:bg-gray-50 transition-all duration-300"
            >
              <FaGithub className="h-6 w-6 mr-2" />
              GitHub
            </Button>
          </div>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className="font-medium text-purple-600 hover:text-purple-500 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUp;
