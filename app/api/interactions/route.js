import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import UserInteraction from "@/models/userInteraction";
import { auth } from "@/auth";
import User from "@/models/user";

export async function POST(request) {
  let connection;
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "You must be logged in" }, { status: 401 });
    }

    connection = await connectToDatabase();
    const { vehicleId, action } = await request.json();

    if (!vehicleId || !["view", "like"].includes(action)) {
      return NextResponse.json({ error: "Invalid vehicle ID or action" }, { status: 400 });
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const interaction = await UserInteraction.create({
      user: user._id,
      vehicle: vehicleId,
      action,
    });

    console.log("Interaction recorded:", JSON.stringify(interaction, null, 2));
    return NextResponse.json({ success: true, interaction }, { status: 201 });
  } catch (error) {
    console.error("Error recording interaction:", error);
    return NextResponse.json(
      { error: "Failed to record interaction", details: error.message },
      { status: 500 }
    );
  } finally {
    if (connection && typeof connection.close === "function") {
      await connection.close();
    }
  }
}