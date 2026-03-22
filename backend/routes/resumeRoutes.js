import express from "express";
import { analyzeResume, upload, getResumes } from "../controllers/resumeController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/analyze", protect, upload.single("resume"), analyzeResume);
router.get("/", protect, getResumes);

export default router;
