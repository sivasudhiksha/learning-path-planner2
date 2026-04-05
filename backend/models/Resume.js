import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  fileName: { type: String, required: true },
  filePath: { type: String, required: true },
  extractedSkills: [String],
  role: { type: String },
  missingSkills: [String],
  alignmentScore: { type: Number, default: 0 },
  alignmentSuggestions: { type: String },
  suggestedRoadmap: { type: mongoose.Schema.Types.ObjectId, ref: "LearningPath" },
  createdAt: { type: Date, default: Date.now },
});

const Resume = mongoose.model("Resume", resumeSchema);
export default Resume;
