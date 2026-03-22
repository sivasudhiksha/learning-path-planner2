import express from "express";
import { updateProgress, getProgress } from "../controllers/userProgressController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Update/create progress
router.post("/update", protect, updateProgress);

// Get user progress
router.get("/", protect, getProgress);

export default router;