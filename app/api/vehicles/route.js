// app/api/vehicles/route.js
import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Vehicle from "@/models/vehicle";
import User from "@/models/user";
import { auth } from "@/auth";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function POST(request) {
  let connection;
  try {
    console.log("Vehicle API route called");
    
    // Get the authenticated user
    const session = await auth();
    console.log("Session:", JSON.stringify(session, null, 2));
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be logged in to create a listing" }, 
        { status: 401 }
      );
    }
    
    // Connect to the database
    console.log("Connecting to database...");
    connection = await connectToDatabase();
    console.log("Database connection established");
    
    // Look up the user in the database by email
    const userEmail = session.user.email;
    if (!userEmail) {
      return NextResponse.json(
        { error: "User email not found in session" }, 
        { status: 400 }
      );
    }
    
    console.log("Looking up user with email:", userEmail);
    // Find the user by email to get their MongoDB ID
    const user = await User.findOne({ email: userEmail });
    console.log("User found:", user ? "Yes" : "No");
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found in database" }, 
        { status: 404 }
      );
    }
    
    // Get the form data
    const formData = await request.formData();
    console.log("Form data keys:", [...formData.keys()]);
    
    // Parse location data which is sent as a JSON string
    let location = {};
    try {
      const locationString = formData.get("location");
      console.log("Location string:", locationString);
      if (locationString) {
        location = JSON.parse(locationString);
      }
    } catch (error) {
      console.error("Error parsing location:", error);
    }
    
    // Handle image uploads to Cloudinary
    const imageFiles = formData.getAll("images");
    console.log("Number of image files:", imageFiles.length);
    const imageUrls = [];
    
    if (imageFiles && imageFiles.length > 0) {
      for (const imageFile of imageFiles) {
        if (imageFile instanceof Blob) {
          try {
            console.log("Uploading image to Cloudinary...");
            const result = await uploadToCloudinary(imageFile);
            console.log("Cloudinary result:", result ? "Success" : "Failed");
            if (result && result.secure_url) {
              imageUrls.push(result.secure_url);
            }
          } catch (uploadError) {
            console.error("Image upload error:", uploadError);
          }
        }
      }
    }
    
    console.log("Image URLs:", imageUrls);
    
    // Create a new vehicle listing using the user's MongoDB ID
    const vehicleData = {
      user: user._id, // Use the MongoDB _id from the user document
      vehicle_type: formData.get("vehicle_type"),
      model: formData.get("model"),
      vehicle_condition: formData.get("vehicle_condition"),
      year: Number(formData.get("year")),
      price: Number(formData.get("price")),
      mileage: formData.get("mileage") ? Number(formData.get("mileage")) : undefined,
      fuelType: formData.get("fuelType") || undefined,
      transmission: formData.get("transmission") || undefined,
      location: location.coordinates ? {
        type: "Point",
        coordinates: location.coordinates,
      } : undefined,
      description: formData.get("description") || undefined,
      images: imageUrls.length > 0 ? imageUrls : [],
    };
    
    console.log("Vehicle data to save:", JSON.stringify(vehicleData, null, 2));
    
    console.log("Creating vehicle document...");
    const newVehicle = await Vehicle.create(vehicleData);
    console.log("Vehicle created:", newVehicle ? "Yes" : "No");
    console.log("New vehicle ID:", newVehicle?._id);
    
    // Verify the vehicle was saved by retrieving it
    console.log("Verifying vehicle was saved...");
    const savedVehicle = await Vehicle.findById(newVehicle._id);
    console.log("Vehicle verification:", savedVehicle ? "Success" : "Failed");
    
    return NextResponse.json({ 
      success: true, 
      message: "Vehicle listing created successfully",
      vehicle: newVehicle
    }, { status: 201 });
    
  } catch (error) {
    console.error("Error creating vehicle listing:", error);
    // Log the full error stack
    console.error(error.stack);
    
    // Check for specific MongoDB errors
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
    
    if (error.name === 'MongoServerError' && error.code === 11000) {
      return NextResponse.json(
        { error: "Duplicate key error", details: error.message }, 
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to create vehicle listing", details: error.message }, 
      { status: 500 }
    );
  } finally {
    // Ensure database connection is properly handled
    if (connection && typeof connection.close === 'function') {
      try {
        console.log("Closing database connection...");
        await connection.close();
        console.log("Database connection closed");
      } catch (closeError) {
        console.error("Error closing database connection:", closeError);
      }
    }
  }
}