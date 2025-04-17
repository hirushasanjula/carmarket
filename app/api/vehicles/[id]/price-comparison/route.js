import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Vehicle from "@/models/vehicle";

export async function GET(request, { params }) {
  let connection;
  try {
    const { id } = params;
    connection = await connectToDatabase();
    const vehicle = await Vehicle.findById(id).lean();
    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    const similarVehicles = await Vehicle.find({
      _id: { $ne: vehicle._id },
      vehicle_type: vehicle.vehicle_type,
      model: { $regex: vehicle.model, $options: "i" },
      year: { $gte: vehicle.year - 2, $lte: vehicle.year + 2 },
      vehicle_condition: vehicle.vehicle_condition,
      status: "Active",
    })
      .select("price year mileage")
      .lean();

    if (similarVehicles.length === 0) {
      return NextResponse.json({ comparison: null }, { status: 200 });
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

    const comparison = {
      price: {
        average: Math.round(averagePrice),
        percentile: Number(pricePercentile),
      },
      year: {
        average: Math.round(averageYear * 10) / 10,
        percentile: Number(yearPercentile),
      },
      mileage: mileages.length > 0 ? {
        average: Math.round(averageMileage),
        percentile: Number(mileagePercentile),
      } : null,
      similarCount: similarVehicles.length,
    };

    return NextResponse.json({ comparison }, { status: 200 });
  } catch (error) {
    console.error("Error fetching comparison:", error);
    return NextResponse.json(
      { error: "Failed to fetch comparison", details: error.message },
      { status: 500 }
    );
  } finally {
    if (connection && typeof connection.close === "function") await connection.close();
  }
}