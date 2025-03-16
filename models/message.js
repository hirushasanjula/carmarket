const { Schema, model, models } = require("mongoose");

const MessageSchema = new Schema({
  sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
  receiver: { type: Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  vehicle: { type: Schema.Types.ObjectId, ref: "Vehicle", required: false }, // Optional: link to a vehicle
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = models?.Message || model("Message", MessageSchema);