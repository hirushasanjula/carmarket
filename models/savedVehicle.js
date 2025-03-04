const { Schema, model, models } = require("mongoose");

const SavedVehicleSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  vehicle: { type: Schema.Types.ObjectId, ref: "Vehicle", required: true },
  savedAt: { type: Date, default: Date.now }
});

// Ensure unique combination of user and vehicle
SavedVehicleSchema.index({ user: 1, vehicle: 1 }, { unique: true });

module.exports = models?.SavedVehicle || model("SavedVehicle", SavedVehicleSchema);