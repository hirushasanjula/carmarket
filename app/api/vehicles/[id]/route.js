import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Vehicle from "@/models/vehicle";
import User from "@/models/user";
import { auth } from "@/auth";

// Get vehicle by ID
export async function GET(request, { params }) {
  let connection;
  try {
    const { id } = params;
    connection = await connectToDatabase();
    const vehicle = await Vehicle.findById(id).populate("user", "name email mobile");
    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }
    const session = await auth();
    if (session && session.user) {
      const user = await User.findOne({ email: session.user.email });
      if (user && !vehicle.viewers.includes(user._id)) {
        vehicle.viewers.push(user._id);
        vehicle.views = (vehicle.views || 0) + 1;
        await vehicle.save();
      } else if (user) {
        vehicle.views = (vehicle.views || 0) + 1;
        await vehicle.save();
      }
    }
    return NextResponse.json(vehicle, { status: 200 });
  } catch (error) {
    console.error("Error fetching vehicle:", error);
    return NextResponse.json(
      { error: "Failed to fetch vehicle", details: error.message },
      { status: 500 }
    );
  } finally {
    if (connection && typeof connection.close === "function") await connection.close();
  }
}

// Update vehicle by ID
export async function PUT(request, { params }) {
  let connection;
  try {
    const { id } = params;
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "You must be logged in to update a listing" }, { status: 401 });
    }
    connection = await connectToDatabase();
    const vehicle = await Vehicle.findById(id);
    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }
    const user = await User.findOne({ email: session.user.email });
    if (!user || vehicle.user.toString() !== user._id.toString()) {
      return NextResponse.json(
        { error: "You don't have permission to update this vehicle" },
        { status: 403 }
      );
    }
    const body = await request.json();
    delete body.user;

    if (body.location) {
      if (!body.location.region || !body.location.city) {
        return NextResponse.json(
          { error: "Location must include region and city" },
          { status: 400 }
        );
      }
      body.location = {
        region: body.location.region,
        city: body.location.city,
      };
    }

    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );
    return NextResponse.json(updatedVehicle, { status: 200 });
  } catch (error) {
    console.error("Error updating vehicle:", error);
    if (error.name === "ValidationError") {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: error.message,
          validationErrors: Object.keys(error.errors).map((field) => ({
            field,
            message: error.errors[field].message,
          })),
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update vehicle", details: error.message },
      { status: 500 }
    );
  } finally {
    if (connection && typeof connection.close === "function") await connection.close();
  }
}

// Delete vehicle by ID
export async function DELETE(request, { params }) {
  let connection;
  try {
    const { id } = params;
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "You must be logged in to delete a listing" }, { status: 401 });
    }
    connection = await connectToDatabase();
    const vehicle = await Vehicle.findById(id);
    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }
    const user = await User.findOne({ email: session.user.email });
    if (!user || (vehicle.user.toString() !== user._id.toString() && user.role !== "admin")) {
      return NextResponse.json(
        { error: "You don't have permission to delete this vehicle" },
        { status: 403 }
      );
    }
    await Vehicle.findByIdAndDelete(id);
    return NextResponse.json(
      { success: true, message: "Vehicle deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting vehicle:", error);
    return NextResponse.json(
      { error: "Failed to delete vehicle", details: error.message },
      { status: 500 }
    );
  } finally {
    if (connection && typeof connection.close === "function") await connection.close();
  }
}

// Update vehicle status by ID (admin only)
export async function PATCH(request, { params }) {
  let connection;
  try {
    const { id } = params;
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be logged in to perform this action" },
        { status: 401 }
      );
    }
    connection = await connectToDatabase();
    const user = await User.findOne({ email: session.user.email });
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "You don't have permission to perform this action" },
        { status: 403 }
      );
    }
    const vehicle = await Vehicle.findById(id);
    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }
    const body = await request.json().catch(() => ({}));
    vehicle.status = body.status || "Active";
    await vehicle.save();
    return NextResponse.json(
      { success: true, message: `Vehicle listing set to ${vehicle.status}`, vehicle },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating vehicle status:", error);
    return NextResponse.json(
      { error: "Failed to update vehicle status", details: error.message },
      { status: 500 }
    );
  } finally {
    if (connection && typeof connection.close === "function") await connection.close();
  }
}