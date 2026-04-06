// server.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import routes
import authRoutes from "./routes/authRoutes.js";
import preferencesRoutes from "./routes/preferencesRoutes.js";
import userProgressRoutes from "./routes/userProgressRoutes.js";
import learningPathsRoutes from "./routes/learningPathsRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";
import noteRoutes from "./routes/noteRoutes.js";
import bookmarkRoutes from "./routes/bookmarkRoutes.js";
import streakRoutes from "./routes/streakRoutes.js";
import githubRoutes from "./routes/githubRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import userRoutes from "./routes/userRoutes.js";



const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/preferences", preferencesRoutes);
app.use("/api/progress", userProgressRoutes);
app.use("/api/paths", learningPathsRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/bookmarks", bookmarkRoutes);
app.use("/api/streaks", streakRoutes);
app.use("/api/github", githubRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/users", userRoutes);

// Serve Frontend in Production
if (process.env.NODE_ENV === "production") {
  // Set static folder
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  // Final fallback: serve index.html for any other route
  app.use((req, res) => {
    res.sendFile(path.resolve(__dirname, "../frontend", "dist", "index.html"));
  });
} else {
  // Test root route for dev
  app.get("/", (req, res) => res.send("API is running..."));
}

// Connect MongoDB and start server
const startServer = async () => {
  try {
    console.log("Connecting to MongoDB...");

    const mongoUri =
      process.env.MONGO_URI || "mongodb://127.0.0.1:27017/learningpathplanner";

    // Correct MongoDB connection (no deprecated options)
    await mongoose.connect(mongoUri);

    console.log("MongoDB Connected");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
};

startServer();