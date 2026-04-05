import mongoose from "mongoose";

const stepSchema = new mongoose.Schema({
  title: { type: String, required: true },
  status: { type: String, enum: ["not_started", "in_progress", "completed", "overdue"], default: "not_started" },
  resourceVideo: { type: String }, // Keep for legacy
  resourceVideos: [{ type: String }], // Array of YouTube IDs or search queries
  resourceText: { type: String }, // Markdown content or URL
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },
  learningCompleted: { type: Boolean, default: false },
  quizPassed: { type: Boolean, default: false },
  projectVerified: { type: Boolean, default: false },
  githubRepo: { type: String },
  scheduledDate: { type: Date },
  completedDate: { type: Date },
});

const learningPathSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  description: { type: String },
  role: { type: String },
  skills: [{ type: String }],
  difficultyLevel: { type: String, enum: ["basic", "intermediate", "advanced"], default: "basic" },
  duration: { type: String }, // e.g., "4 weeks", "2 months"
  preference: { type: String }, // e.g., "Video", "Reading", "Both"
  steps: [stepSchema],
  pathCompleted: { type: Boolean, default: false },
  aiSuggestions: { type: String }, // AI-generated advice based on pace
  createdAt: { type: Date, default: Date.now },
});

const LearningPath = mongoose.model("LearningPath", learningPathSchema);

export default LearningPath;