import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import SavedVehicle from "@/models/savedVehicle";
import User from "@/models/user";
import { auth } from "@/auth";

export async function POST(request) {
  let connection;
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be logged in to save a vehicle" },
        { status: 401 }
      );
    }

    connection = await connectToDatabase();
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const { vehicleId } = await request.json();
    if (!vehicleId) {
      return NextResponse.json(
        { error: "Vehicle ID is required" },
        { status: 400 }
      );
    }

    const savedVehicle = await SavedVehicle.create({
      user: user._id,
      vehicle: vehicleId
    });

    return NextResponse.json({
      success: true,
      message: "Vehicle saved successfully",
      savedVehicle
    }, { status: 201 });

  } catch (error) {
    console.error("Error saving vehicle:", error);
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Vehicle already saved" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to save vehicle", details: error.message },
      { status: 500 }
    );
  } finally {
    if (connection && typeof connection.close === 'function') {
      await connection.close();
    }
  }
}

export async function GET(request) {
  let connection;
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be logged in to view saved vehicles" },
        { status: 401 }
      );
    }

    connection = await connectToDatabase();
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const savedVehicles = await SavedVehicle.find({ user: user._id })
      .populate({
        path: "vehicle",
        populate: {
          path: "user",
          select: "name email"
        }
      })
      .sort({ savedAt: -1 });

    return NextResponse.json(savedVehicles, { status: 200 });

  } catch (error) {
    console.error("Error fetching saved vehicles:", error);
    return NextResponse.json(
      { error: "Failed to fetch saved vehicles", details: error.message },
      { status: 500 }
    );
  } finally {
    if (connection && typeof connection.close === 'function') {
      await connection.close();
    }
  }
}

export async function DELETE(request) {
  let connection;
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be logged in to remove a saved vehicle" },
        { status: 401 }
      );
    }

    connection = await connectToDatabase();
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const { vehicleId } = await request.json();
    if (!vehicleId) {
      return NextResponse.json(
        { error: "Vehicle ID is required" },
        { status: 400 }
      );
    }

    const deleted = await SavedVehicle.findOneAndDelete({
      user: user._id,
      vehicle: vehicleId
    });

    if (!deleted) {
      return NextResponse.json(
        { error: "Saved vehicle not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Vehicle removed from saved list"
    }, { status: 200 });

  } catch (error) {
    console.error("Error removing saved vehicle:", error);
    return NextResponse.json(
      { error: "Failed to remove saved vehicle", details: error.message },
      { status: 500 }
    );
  } finally {
    if (connection && typeof connection.close === 'function') {
      await connection.close();
    }
  }
}