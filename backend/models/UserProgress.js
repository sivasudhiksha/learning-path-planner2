import mongoose from "mongoose";

const userProgressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  steps: [String], // list of learning steps completed
  projectCompleted: { type: Boolean, default: false },
  language: { type: String },
  percentage: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

const UserProgress = mongoose.model("UserProgress", userProgressSchema);
export default UserProgress;