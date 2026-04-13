import mongoose from "mongoose";

const videoSchema = new mongoose.Schema(
  {
    title: String,
    filename: String,
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      default: "processing",
    },
    progress: {
      type: Number,
      default: 0,
    },
    sensitivity: {
      type: String,
      enum: ["pending","safe", "flagged"],
      default: "pending",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Video", videoSchema);
