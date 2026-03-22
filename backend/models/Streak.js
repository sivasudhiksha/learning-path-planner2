import mongoose from "mongoose";

const streakSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  count: { type: Number, default: 0 },
  lastActivityDate: { type: Date, default: Date.now },
  history: [Date],
  longestStreak: { type: Number, default: 0 },
});

const Streak = mongoose.model("Streak", streakSchema);
export default Streak;
