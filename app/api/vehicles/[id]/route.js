import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Vehicle from "@/models/vehicle";
import User from "@/models/user";
import { auth } from "@/auth";

async function geocodeCity(region, city) {
  try {
    const query = `${city}, ${region}`;
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`
    );
    const data = await response.json();
    if (data && data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
      };
    }
    return { latitude: 0, longitude: 0 }; // Fallback
  } catch (error) {
    console.error("Geocoding error:", error);
    return { latitude: 0, longitude: 0 };
  }
}

async function getComparison(vehicle) {
  try {
    const similarVehicles = await Vehicle.find({
      _id: { $ne: vehicle._id }, // Exclude the current vehicle
      vehicle_type: vehicle.vehicle_type,
      model: { $regex: vehicle.model, $options: "i" },
      year: { $gte: vehicle.year - 2, $lte: vehicle.year + 2 }, // Within 2 years
      vehicle_condition: vehicle.vehicle_condition,
      status: "Active",
    })
      .select("price year mileage")
      .lean();

    if (similarVehicles.length === 0) {
      return null;
    }

    const prices = similarVehicles.map((v) => v.price);
    const years = similarVehicles.map((v) => v.year);
    const mileages = similarVehicles.filter((v) => v.mileage != null).map((v) => v.mileage);

    const averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const averageYear = years.reduce((sum, year) => sum + year, 0) / years.length;
    const averageMileage = mileages.length > 0 ? mileages.reduce((sum, mileage) => sum + mileage, 0) / mileages.length : null;

    const pricePercentile =
      prices.length > 1
        ? ((prices.filter((p) => p < vehicle.price).length / prices.length) * 100).toFixed(0)
        : 50;
    const yearPercentile =
      years.length > 1
        ? ((years.filter((y) => y < vehicle.year).length / years.length) * 100).toFixed(0)
        : 50;
    const mileagePercentile =
      mileages.length > 1
        ? ((mileages.filter((m) => m < vehicle.mileage).length / mileages.length) * 100).toFixed(0)
        : 50;

    return {
      price: {
        average: Math.round(averagePrice),
        percentile: Number(pricePercentile),
      },
      year: {
        average: Math.round(averageYear * 10) / 10, // Round to 1 decimal
        percentile: Number(yearPercentile),
      },
      mileage: mileages.length > 0 ? {
        average: Math.round(averageMileage),
        percentile: Number(mileagePercentile),
      } : null,
      similarCount: similarVehicles.length,
    };
  } catch (error) {
    console.error("Error computing comparison:", error);
    return null;
  }
}

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

    // Geocode city for display
    const cityLocation = await geocodeCity(vehicle.location.region, vehicle.location.city);
    const vehicleData = vehicle.toObject();
    vehicleData.displayLocation = {
      latitude: cityLocation.latitude,
      longitude: cityLocation.longitude,
    };

    // Add comparison data
    vehicleData.comparison = await getComparison(vehicle);

    return NextResponse.json(vehicleData, { status: 200 });
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
        coordinates: body.location.coordinates || vehicle.location.coordinates,
      };
    }

    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      id,
      { $set: { ...body, status: "Pending", updatedAt: new Date() } },
      { new: true, runValidators: true }
    ).populate("user", "name email mobile");

    return NextResponse.json(
      {
        success: true,
        message: "Vehicle listing updated successfully",
        vehicle: updatedVehicle,
      },
      { status: 200 }
    );
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