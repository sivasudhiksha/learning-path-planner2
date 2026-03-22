import express from "express";
import { getQuizByTopic, submitQuiz } from "../controllers/quizController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:topic", protect, getQuizByTopic);
router.post("/submit", protect, submitQuiz);

export default router;
