import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/user";

export async function POST(request) {
  try {
    const { email, otp } = await request.json();
    await connectToDatabase();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "Email not found" }, { status: 404 });
    }

    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
    }

    // OTP is valid, clear it
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    return NextResponse.json({ message: "OTP verified" });
  } catch (error) {
    console.error("OTP verification error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}