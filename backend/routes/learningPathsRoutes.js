import express from "express";
import { generatePersonalizedRoadmap, getAllPaths, getPathById, updatePath, adaptiveUpdateRoadmap } from "../controllers/roadmapController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, generatePersonalizedRoadmap);
router.get("/", protect, getAllPaths);
router.get("/:id", protect, getPathById);
router.put("/:id", protect, updatePath);
router.post("/:id/update", protect, adaptiveUpdateRoadmap);

export default router;