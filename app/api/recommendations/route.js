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

    // Step 1: Get the user's most interacted vehicle (likes or views)
    const interactions = await UserInteraction.aggregate([
      { $match: { user: user._id, action: { $in: ["like", "view"] } } },
      { $group: { _id: "$vehicle", interactionCount: { $sum: 1 } } },
      { $sort: { interactionCount: -1 } },
      { $limit: 1 },
    ]);

    let recommendedVehicles = [];

    if (interactions.length > 0) {
      const mostInteractedVehicleId = interactions[0]._id;
      const mostInteractedVehicle = await Vehicle.findById(mostInteractedVehicleId);

      if (mostInteractedVehicle) {
        const { vehicle_type } = mostInteractedVehicle;

        // Log the vehicle_type to debug
        console.log(`Most interacted vehicle type: ${vehicle_type}, ID: ${mostInteractedVehicleId}`);

        // Step 2: Find vehicles matching vehicle_type, excluding the interacted vehicle
        recommendedVehicles = await Vehicle.find({
          vehicle_type: vehicle_type, // Ensure exact match
          _id: { $ne: mostInteractedVehicleId },
          status: "Active",
        })
          .sort({ createdAt: -1 }) // Sort by newest first
          .limit(3); // Limit to 3 vehicles

        // Log the recommended vehicles' types for debugging
        console.log(
          "Recommended vehicles types:",
          recommendedVehicles.map((v) => v.vehicle_type)
        );
      } else {
        console.log("Most interacted vehicle not found in Vehicle collection");
      }
    } else {
      console.log("No interactions found for user");
    }

    // Step 3: Fallback if fewer than 3 recommendations
    if (recommendedVehicles.length < 3) {
      const remainingCount = 3 - recommendedVehicles.length;
      // Try to find more vehicles of the same vehicle_type if possible
      const mostInteractedVehicle = interactions.length > 0 ? await Vehicle.findById(interactions[0]._id) : null;
      const vehicleTypeToMatch = mostInteractedVehicle?.vehicle_type;

      if (vehicleTypeToMatch) {
        const additionalVehicles = await Vehicle.find({
          vehicle_type: vehicleTypeToMatch,
          _id: { $nin: [...recommendedVehicles.map((v) => v._id), ...(interactions[0]?._id ? [interactions[0]._id] : [])] },
          status: "Active",
        })
          .sort({ createdAt: -1 })
          .limit(remainingCount);

        recommendedVehicles = [...recommendedVehicles, ...additionalVehicles];
      }

      // If still fewer than 3, fallback to any active vehicles
      if (recommendedVehicles.length < 3) {
        const finalCount = 3 - recommendedVehicles.length;
        const fallbackVehicles = await Vehicle.find({
          _id: { $nin: recommendedVehicles.map((v) => v._id) },
          status: "Active",
        })
          .sort({ createdAt: -1 })
          .limit(finalCount);

        recommendedVehicles = [...recommendedVehicles, ...fallbackVehicles];
      }
    }

    // Verify the vehicle types in the final recommendations
    console.log(
      "Final recommended vehicles types:",
      recommendedVehicles.map((v) => v.vehicle_type)
    );

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