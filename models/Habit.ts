import { Schema, models, model } from "mongoose";

const HabitSchema = new Schema(
  {
    squad: { type: Schema.Types.ObjectId, ref: "Squad", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

HabitSchema.index({ squad: 1, user: 1 });

export default models.Habit ?? model("Habit", HabitSchema);
