import express from "express";
import { createBookmark, getBookmarks, deleteBookmark } from "../controllers/bookmarkController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createBookmark);
router.get("/", protect, getBookmarks);
router.delete("/:id", protect, deleteBookmark);

export default router;
