const { Schema, model, models } = require("mongoose");

const VehicleSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    vehicle_type: { type: String, enum: ["car", "van", "jeep/suv", "double-cab"] },
    model: { type: String, required: true },
    vehicle_condition: { type: String, enum: ["brand-new", "used", "unregister"] },
    year: { type: Number, required: true },
    price: { type: Number, required: true },
    mileage: { type: Number },
    fuelType: { type: String, enum: ["Petrol", "Diesel", "Electric"] },
    transmission: { type: String, enum: ["Manual", "Automatic"] },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number] }, // [longitude, latitude]
    },
    
    description: { type: String },
    images: [{ type: String }],
    status: { type: String, enum: ["Pending", "Active", "Rejected"], default: "Pending" },
    createdAt: { type: Date, default: Date.now },
    views: { type: Number, default: 0 }, // Optional: keep for total views
    viewers: [{ type: Schema.Types.ObjectId, ref: "User" }],
  }, { timestamps: true });

  VehicleSchema.index({ location: "2dsphere" });

  module.exports = models?.Vehicle || model("Vehicle", VehicleSchema);