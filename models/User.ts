import { Schema, models, model } from "mongoose";

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    name: { type: String },
    image: { type: String },
  },
  { timestamps: true },
);

export default models.User ?? model("User", UserSchema);
