const { Schema, model, models } = require("mongoose");

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  viewedVehicles: [{ type: Schema.Types.ObjectId, ref: "Vehicle" }],
  likedVehicles: [{ type: Schema.Types.ObjectId, ref: "Vehicle" }],
  createdAt: { type: Date, default: Date.now },
  otp: { type: String }, // OTP for password reset
  otpExpires: { type: Date },
});

// Ensure models exists before accessing models.User
module.exports = models?.User || model("User", UserSchema);

