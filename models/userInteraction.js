import { Schema, model, models } from "mongoose";

const UserInteractionSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  vehicle: { type: Schema.Types.ObjectId, ref: "Vehicle", required: true },
  action: { type: String, enum: ["view", "like"], required: true },
  timestamp: { type: Date, default: Date.now },
});

export default models?.UserInteraction || model("UserInteraction", UserInteractionSchema);