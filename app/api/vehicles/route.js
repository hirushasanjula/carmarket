// app/api/vehicles/route.js
import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Vehicle from "@/models/vehicle";
import User from "@/models/user";
import { auth } from "../auth/[...nextauth]/route";
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
    const user = await User.findOne({ email: userEmail });
    console.log("User found:", user ? "Yes" : "No", "User ID:", user?._id);

    if (!user) {
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 404 }
      );
    }

    // Get the form data
    const formData = await request.formData();
    console.log("Form data keys:", [...formData.keys()]);

    // Parse location data
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

    // Create a new vehicle listing
    const vehicleData = {
      user: user._id,
      vehicle_type: formData.get("vehicle_type"),
      model: formData.get("model"),
      vehicle_condition: formData.get("vehicle_condition"),
      year: Number(formData.get("year")),
      price: Number(formData.get("price")),
      mileage: formData.get("mileage") ? Number(formData.get("mileage")) : undefined,
      fuelType: formData.get("fuelType") || undefined,
      transmission: formData.get("transmission") || undefined,
      location: location.coordinates
        ? { type: "Point", coordinates: location.coordinates }
        : undefined,
      description: formData.get("description") || undefined,
      images: imageUrls.length > 0 ? imageUrls : [],
      status: "Pending", // Explicitly set for clarity
    };

    console.log("Vehicle data to save:", JSON.stringify(vehicleData, null, 2));

    console.log("Creating vehicle document...");
    const newVehicle = await Vehicle.create(vehicleData);
    console.log("Vehicle created:", JSON.stringify(newVehicle, null, 2)); // Detailed log

    // Verify the vehicle was saved
    console.log("Verifying vehicle was saved...");
    const savedVehicle = await Vehicle.findById(newVehicle._id);
    console.log("Saved vehicle:", JSON.stringify(savedVehicle, null, 2));

    return NextResponse.json(
      {
        success: true,
        message: "Vehicle listing created successfully",
        vehicle: newVehicle,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating vehicle listing:", error);
    console.error("Error stack:", error.stack);
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
    if (error.name === "MongoServerError" && error.code === 11000) {
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
    if (connection && typeof connection.close === "function") {
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

export async function GET(request) {
  let connection;
  try {
    console.log("Vehicles route: Fetching session...");
    const session = await auth();
    console.log("Vehicles route: Session:", session);

    const url = new URL(request.url);
    const showAll = url.searchParams.get("showAll") === "true";
    const searchQuery = url.searchParams.get("search")?.trim();
    const vehicleType = url.searchParams.get("vehicle_type")?.trim();
    const model = url.searchParams.get("model")?.trim();
    const year = url.searchParams.get("year")?.trim();
    const fuelType = url.searchParams.get("fuelType")?.trim();
    const minPrice = url.searchParams.get("minPrice") ? parseInt(url.searchParams.get("minPrice")) : null;
    const maxPrice = url.searchParams.get("maxPrice") ? parseInt(url.searchParams.get("maxPrice")) : null;

    connection = await connectToDatabase();
    console.log("Vehicles route: MongoDB connected");

    let query = {};
    if (!showAll && !session?.user) {
      query.active = true; // Only active vehicles for unauthenticated users
    }
    if (searchQuery) {
      query.$or = [
        { model: { $regex: searchQuery, $options: "i" } },
        { description: { $regex: searchQuery, $options: "i" } },
      ];
    }
    if (vehicleType) query.vehicle_type = { $regex: vehicleType, $options: "i" };
    if (model) query.model = { $regex: model, $options: "i" };
    if (year) query.year = parseInt(year);
    if (fuelType) query.fuelType = { $regex: fuelType, $options: "i" };
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = minPrice;
      if (maxPrice) query.price.$lte = maxPrice;
    }

    const vehicles = await Vehicle.find(query);
    console.log("Vehicles fetched:", vehicles.length, "Filters:", {
      searchQuery,
      vehicleType,
      model,
      year,
      fuelType,
      minPrice,
      maxPrice,
    });

    return new Response(JSON.stringify(vehicles), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Vehicles route error:", error.message, error.stack);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}