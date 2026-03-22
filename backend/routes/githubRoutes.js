import express from "express";
import { verifyGithubRepo } from "../controllers/githubController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/verify", protect, verifyGithubRepo);

export default router;
