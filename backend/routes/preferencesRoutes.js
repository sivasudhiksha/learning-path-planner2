// routes/preferencesRoutes.js
import express from "express";
import { savePreferences } from "../controllers/preferencesController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/preferences/save
router.post("/save", protect, savePreferences);

export default router;