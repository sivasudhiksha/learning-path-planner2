import express from "express";
import { generatePersonalizedRoadmap, getAllPaths, getPathById, updatePath } from "../controllers/roadmapController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, generatePersonalizedRoadmap);
router.get("/", protect, getAllPaths);
router.get("/:id", protect, getPathById);
router.put("/:id", protect, updatePath);

export default router;