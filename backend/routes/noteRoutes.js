import express from "express";
import { createNote, getNotesByPath, updateNote, deleteNote } from "../controllers/noteController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createNote);
router.get("/:learningPathId", protect, getNotesByPath);
router.put("/:id", protect, updateNote);
router.delete("/:id", protect, deleteNote);

export default router;
