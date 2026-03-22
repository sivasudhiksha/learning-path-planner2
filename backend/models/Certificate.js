import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  issuer: { type: String, required: true },
  date: { type: Date, required: true },
  certificateImage: { type: String }, // Path to file
  verified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const Certificate = mongoose.model("Certificate", certificateSchema);
export default Certificate;
