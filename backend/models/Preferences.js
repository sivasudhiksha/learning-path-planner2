import mongoose from "mongoose";

const preferencesSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  knownLanguages: [String],
  skillsToDevelop: [String],
  roles: [String],
  createdAt: { type: Date, default: Date.now },
});

const Preferences = mongoose.model("Preferences", preferencesSchema);
export default Preferences;