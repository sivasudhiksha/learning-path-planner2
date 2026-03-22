import express from "express";
import { getStreak, updateStreak } from "../controllers/streakController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getStreak);
router.post("/update", protect, updateStreak);

export default router;
