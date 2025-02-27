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
    mobile: { type: Number, required: true },
    description: { type: String },
    images: [{ type: String }],
    createdAt: { type: Date, default: Date.now }
  }, { timestamps: true });

  VehicleSchema.index({ location: "2dsphere" });

  module.exports = models?.Vehicle || model("Vehicle", VehicleSchema);