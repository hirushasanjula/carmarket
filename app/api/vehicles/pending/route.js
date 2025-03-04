import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Vehicle from "@/models/vehicle";
import { auth } from "@/auth";
import User from "@/models/user";

export async function GET(request) {
  let connection;
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be logged in to access this resource" },
        { status: 401 }
      );
    }

    connection = await connectToDatabase();
    const user = await User.findOne({ email: session.user.email });
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "You don't have permission to access this resource" },
        { status: 403 }
      );
    }

    const pendingVehicles = await Vehicle.find({ status: "Pending" })
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .exec();

    return NextResponse.json(pendingVehicles, { status: 200 });
  } catch (error) {
    console.error("Error fetching pending vehicles:", error);
    return NextResponse.json(
      { error: "Failed to fetch pending vehicles", details: error.message },
      { status: 500 }
    );
  } finally {
    if (connection && typeof connection.close === "function") {
      await connection.close();
    }
  }
}