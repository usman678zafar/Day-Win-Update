import { Schema, models, model } from "mongoose";

const HabitSchema = new Schema(
  {
    squad: { type: Schema.Types.ObjectId, ref: "Squad", required: true },
    /** Admin (or creator) who defined this squad-wide habit; all members track it with their own logs. */
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

HabitSchema.index({ squad: 1 });

export default models.Habit ?? model("Habit", HabitSchema);
