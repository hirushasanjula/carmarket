import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import UserInteraction from "@/models/userInteraction";
import Vehicle from "@/models/vehicle";
import { auth } from "@/auth";
import User from "@/models/user";

export async function GET(request) {
  let connection;
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "You must be logged in" }, { status: 401 });
    }

    connection = await connectToDatabase();
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const interactions = await UserInteraction.find({ user: user._id })
      .populate("vehicle")
      .sort({ timestamp: -1 })
      .limit(10);

    if (interactions.length === 0) {
      const popularVehicles = await Vehicle.find({ status: "Active" })
        .sort({ createdAt: -1 })
        .limit(5);
      return NextResponse.json(popularVehicles, { status: 200 });
    }

    const likedVehicles = interactions
      .filter((i) => i.action === "like" && i.vehicle)
      .map((i) => i.vehicle);
    const viewedVehicles = interactions
      .filter((i) => i.action === "view" && i.vehicle)
      .map((i) => i.vehicle);

    const preferenceVehicles = [...likedVehicles, ...viewedVehicles].slice(0, 5);
    const vehicleTypes = [...new Set(preferenceVehicles.map((v) => v.vehicle_type))];
    const models = [...new Set(preferenceVehicles.map((v) => v.model))];
    const priceRanges = preferenceVehicles.map((v) => ({
      min: Math.max(0, v.price * 0.8),
      max: v.price * 1.2,
    }));

    const query = {
      status: "Active",
      _id: { $nin: preferenceVehicles.map((v) => v._id) },
      $or: [
        { vehicle_type: { $in: vehicleTypes } },
        { model: { $in: models } },
        { price: { $gte: Math.min(...priceRanges.map((r) => r.min)), $lte: Math.max(...priceRanges.map((r) => r.max)) } },
      ],
    };

    const recommendedVehicles = await Vehicle.find(query)
      .limit(5)
      .sort({ createdAt: -1 });

    console.log("Recommended vehicles:", JSON.stringify(recommendedVehicles, null, 2));
    return NextResponse.json(recommendedVehicles, { status: 200 });
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return NextResponse.json(
      { error: "Failed to fetch recommendations", details: error.message },
      { status: 500 }
    );
  } finally {
    if (connection && typeof connection.close === "function") {
      await connection.close();
    }
  }
}