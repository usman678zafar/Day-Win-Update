import { Schema, models, model } from "mongoose";

const MemberSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: {
      type: String,
      enum: ["admin", "member"],
      required: true,
      default: "member",
    },
  },
  { _id: false },
);

const SquadSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    members: { type: [MemberSchema], default: [] },
  },
  { timestamps: true },
);

SquadSchema.index({ "members.user": 1 });

export default models.Squad ?? model("Squad", SquadSchema);
