import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOTP(email, otp) {
  try {
    const data = await resend.emails.send({
      from: "carmarket <onboarding@resend.dev>", // Replace with your verified sender email
      to: email,
      subject: "CarMarket Password Reset OTP",
      text: `Your OTP for password reset is: ${otp}. It expires in 10 minutes.`,
    });
    console.log("Email sent:", data);
  } catch (error) {
    console.error("Resend error:", error);
    throw error; // Let the caller handle the error
  }
}