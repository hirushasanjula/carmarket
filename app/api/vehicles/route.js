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

    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be logged in to create a listing" },
        { status: 401 }
      );
    }

    connection = await connectToDatabase();

    const userEmail = session.user.email;
    if (!userEmail) {
      return NextResponse.json(
        { error: "User email not found in session" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 404 }
      );
    }

    const formData = await request.formData();
    let location = {};
    try {
      const locationString = formData.get("location");
      if (locationString) {
        location = JSON.parse(locationString);
      }
    } catch (error) {
      console.error("Error parsing location:", error);
      return NextResponse.json(
        { error: "Invalid location format", details: error.message },
        { status: 400 }
      );
    }

    if (!location.region || !location.city) {
      return NextResponse.json(
        { error: "Location must include region and city" },
        { status: 400 }
      );
    }

    const imageFiles = formData.getAll("images");
    const imageUrls = [];
    if (imageFiles && imageFiles.length > 0) {
      for (const imageFile of imageFiles) {
        if (imageFile instanceof Blob) {
          try {
            const result = await uploadToCloudinary(imageFile);
            if (result && result.secure_url) {
              imageUrls.push(result.secure_url);
            }
          } catch (uploadError) {
            console.error("Image upload error:", uploadError);
          }
        }
      }
    }

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
      location: {
        region: location.region,
        city: location.city,
        coordinates: {
          type: "Point",
          coordinates: location.coordinates?.coordinates || [0, 0],
        },
      },
      description: formData.get("description") || undefined,
      images: imageUrls.length > 0 ? imageUrls : [],
      status: "Pending",
      contactPhone: formData.get("contactPhone") || undefined,
    };

    const newVehicle = await Vehicle.create(vehicleData);

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
      await connection.close();
    }
  }
}

// GET method 
export async function GET(request) {
  let connection;
  try {
    const session = await auth();
    const url = new URL(request.url);
    const showAll = url.searchParams.get("showAll") === "true";
    const searchQuery = url.searchParams.get("search")?.trim();
    const vehicleType = url.searchParams.get("vehicle_type")?.trim();
    const model = url.searchParams.get("model")?.trim();
    const year = url.searchParams.get("year")?.trim();
    const fuelType = url.searchParams.get("fuelType")?.trim();
    const minPrice = url.searchParams.get("minPrice")?.trim();
    const maxPrice = url.searchParams.get("maxPrice")?.trim();
    const region = url.searchParams.get("region")?.trim(); 
    const city = url.searchParams.get("city")?.trim();

    connection = await connectToDatabase();

    let query = { status: "Active" };

    if (session && session.user && !showAll) {
      const userEmail = session.user.email;
      if (!userEmail) {
        return NextResponse.json({ error: "User email not found in session" }, { status: 400 });
      }
      const user = await User.findOne({ email: userEmail });
      if (!user) {
        return NextResponse.json({ error: "User not found in database" }, { status: 404 });
      }
      query = { user: user._id, status: { $in: ["Pending", "Active"] } };
    }

    if (searchQuery) {
      query.$or = [{ model: { $regex: searchQuery, $options: "i" } }];
      const numericQuery = Number(searchQuery);
      const isValidYear = !isNaN(numericQuery) && Number.isInteger(numericQuery) && numericQuery >= 1900 && numericQuery <= new Date().getFullYear();
      if (isValidYear) {
        query.$or.push({ year: numericQuery });
      }
    }

    if (vehicleType) {
      query.vehicle_type = { $regex: vehicleType, $options: "i" };
    }

    if (model) {
      query.model = { $regex: model, $options: "i" };
    }

    if (year) {
      const numericYear = Number(year);
      if (!isNaN(numericYear) && Number.isInteger(numericYear) && numericYear >= 1900 && numericYear <= new Date().getFullYear()) {
        query.year = numericYear;
      }
    }

    if (fuelType) {
      query.fuelType = { $regex: fuelType, $options: "i" };
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) {
        const min = Number(minPrice);
        if (!isNaN(min)) query.price.$gte = min;
      }
      if (maxPrice) {
        const max = Number(maxPrice);
        if (!isNaN(max)) query.price.$lte = max;
      }
    }

    if (region) {
      query["location.region"] = { $regex: region, $options: "i" };
    }
    if (city) {
      query["location.city"] = { $regex: city, $options: "i" };
    }

    const vehicles = await Vehicle.find(query)
      .sort({ createdAt: -1 })
      .populate("user", "name email")
      .exec();

    console.log("Vehicles fetched:", vehicles.length, "Filters:", { searchQuery, vehicleType, model, year, fuelType, minPrice, maxPrice });
    const vehicleData = vehicles.map((v) => v.toObject());

    return NextResponse.json(vehicleData, { status: 200 });
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    return NextResponse.json(
      { error: "Failed to fetch vehicles", details: error.message },
      { status: 500 }
    );
  } finally {
    if (connection && typeof connection.close === "function") {
      try {
        await connection.close();
      } catch (closeError) {
        console.error("Error closing database connection:", closeError);
      }
    }
  }
}