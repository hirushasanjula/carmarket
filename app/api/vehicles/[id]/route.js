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
    const { id } = params;
    
    // Get the authenticated user
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be logged in to delete a listing" },
        { status: 401 }
      );
    }
    
    // Connect to the database
    connection = await connectToDatabase();
    
    // Find the vehicle to delete
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
        { error: "You don't have permission to delete this vehicle" },
        { status: 403 }
      );
    }
    
    // Delete the vehicle
    await Vehicle.findByIdAndDelete(id);
    
    // Optional: Delete associated images from Cloudinary
    // This would require implementing a function to delete images from Cloudinary
    
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
    if (connection && typeof connection.close === 'function') {
      try {
        await connection.close();
      } catch (closeError) {
        console.error("Error closing database connection:", closeError);
      }
    }
  }
}