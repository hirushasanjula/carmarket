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
    region: { type: String, required: true },
    city: { type: String, required: true },
    coordinates: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] }, // [longitude, latitude]
    },
  },
  description: { type: String },
  images: [{ type: String }],
  status: { type: String, enum: ["Pending", "Active", "Rejected"], default: "Pending" },
  views: { type: Number, default: 0 },
  viewers: [{ type: Schema.Types.ObjectId, ref: "User" }],
  contactPhone: { type: String },
}, { timestamps: true });

VehicleSchema.index({ "location.coordinates": "2dsphere" });

module.exports = models?.Vehicle || model("Vehicle", VehicleSchema);