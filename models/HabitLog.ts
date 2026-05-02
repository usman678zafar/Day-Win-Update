import { Schema, models, model } from "mongoose";

const HabitLogSchema = new Schema(
  {
    habit: { type: Schema.Types.ObjectId, ref: "Habit", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    dateKey: { type: String, required: true },
    completed: { type: Boolean, required: true, default: true },
  },
  { timestamps: true },
);

HabitLogSchema.index({ habit: 1, user: 1, dateKey: 1 }, { unique: true });

export default models.HabitLog ?? model("HabitLog", HabitLogSchema);
