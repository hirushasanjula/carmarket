// app/api/vehicles/[id]/route.js
import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Vehicle from "@/models/vehicle";
import User from "@/models/user";
import { auth } from "@/auth";
import { uploadToCloudinary } from "@/lib/cloudinary";

// Get vehicle by ID
export async function GET(request, { params }) {
  let connection;
  try {
    const { id } = params;
    
    // Get the authenticated user
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be logged in to view this vehicle" },
        { status: 401 }
      );
    }
    
    // Connect to the database
    connection = await connectToDatabase();
    
    // Find the vehicle
    const vehicle = await Vehicle.findById(id).populate("user", "name email");
    
    if (!vehicle) {
      return NextResponse.json(
        { error: "Vehicle not found" },
        { status: 404 }
      );
    }

    // Track unique viewers
    //vehicle.views = (vehicle.views || 0) + 1;

    if (!vehicle.viewers.includes(User._id)) {
         vehicle.viewers.push(User._id);
         vehicle.views = (vehicle.views || 0) + 1; // Optional: track total too
       }
    
    // Remove the owner check to allow all authenticated users to view the vehicle
    
    // Increment views count (optional)
    vehicle.views = (vehicle.views || 0) + 1;
    await vehicle.save();
    
    return NextResponse.json(vehicle, { status: 200 });
  } catch (error) {
    console.error("Error fetching vehicle:", error);
    return NextResponse.json(
      { error: "Failed to fetch vehicle", details: error.message },
      { status: 500 }
    );
  } finally {
    if (connection && typeof connection.close === 'function') {
      try {
        await connection.close();
      } catch (closeError) {
        console.error("Error closing database connection:", closeError);
      }
    }
  }
}

// Update vehicle by ID
export async function PUT(request, { params }) {
  let connection;
  try {
    const { id } = params;
    
    // Get the authenticated user
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be logged in to update a listing" },
        { status: 401 }
      );
    }
    
    // Connect to the database
    connection = await connectToDatabase();
    
    // Find the vehicle to update
    const vehicle = await Vehicle.findById(id);
    
    if (!vehicle) {
      return NextResponse.json(
        { error: "Vehicle not found" },
        { status: 404 }
      );
    }
    
    // Verify the user is the owner of this vehicle
    const user = await User.findOne({ email: session.user.email });
    
    if (!user || vehicle.user.toString() !== user._id.toString()) {
      return NextResponse.json(
        { error: "You don't have permission to update this vehicle" },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    
    // Don't update the user field to maintain ownership
    delete body.user;
    
    // Handle location if it's present
    if (body.location && typeof body.location === 'string') {
      try {
        body.location = JSON.parse(body.location);
      } catch (error) {
        console.error("Error parsing location:", error);
      }
    }
    
    // Update the vehicle
    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );
    
    return NextResponse.json(updatedVehicle, { status: 200 });
  } catch (error) {
    console.error("Error updating vehicle:", error);
    
    // Check for validation errors
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { 
          error: "Validation failed", 
          details: error.message,
          validationErrors: Object.keys(error.errors).map(field => ({
            field,
            message: error.errors[field].message
          }))
        }, 
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to update vehicle", details: error.message },
      { status: 500 }
    );
  } finally {
    if (connection && typeof connection.close === 'function') {
      try {
        await connection.close();
      } catch (closeError) {
        console.error("Error closing database connection:", closeError);
      }
    }
  }
}

// Delete vehicle by ID
export async function DELETE(request, { params }) {
  let connection;
  try {
    const id = params.id; // Consistent with PATCH
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be logged in to delete a listing" },
        { status: 401 }
      );
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
    if (connection && typeof connection.close === "function") {
      await connection.close();
    }
  }
}


export async function PATCH(request, { params }) {
  let connection;
  try {
    const id = params.id;
    console.log("Vehicle ID from params:", id);

    const session = await auth();
    console.log("Session:", JSON.stringify(session, null, 2));

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be logged in to perform this action" },
        { status: 401 }
      );
    }

    connection = await connectToDatabase();
    const user = await User.findOne({ email: session.user.email });
    console.log("User:", user ? JSON.stringify(user, null, 2) : "Not found");

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
    console.log("Request body:", JSON.stringify(body, null, 2));
    vehicle.status = body.status || "Active";
    await vehicle.save();
    console.log("Updated vehicle:", JSON.stringify(vehicle, null, 2));

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
    if (connection && typeof connection.close === "function") {
      await connection.close();
    }
  }
}

// Ensure DELETE handler uses the same params syntax
