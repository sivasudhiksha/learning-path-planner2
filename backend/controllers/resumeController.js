import multer from "multer";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");
import path from "path";
import fs from "fs";
import Resume from "../models/Resume.js";
import { roleSkillMaps } from "../utils/roadmaps.js";

// Multer Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "./uploads/resumes";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

export const upload = multer({ storage });

export const analyzeResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { role } = req.body;
    const filePath = req.file.path;
    const dataBuffer = fs.readFileSync(filePath);

    // Parse PDF
    const data = await pdf(dataBuffer);
    const text = data.text.toLowerCase();

    // Extract Skills
    const targetSkills = roleSkillMaps[role] || [];
    const extractedSkills = [];
    const missingSkills = [];

    targetSkills.forEach((skill) => {
      if (text.includes(skill.toLowerCase())) {
        extractedSkills.push(skill);
      } else {
        missingSkills.push(skill);
      }
    });

    // Save to DB
    const resume = await Resume.create({
      user: req.user._id,
      fileName: req.file.originalname,
      filePath: filePath,
      extractedSkills,
      role,
      missingSkills,
    });

    res.status(200).json({
      message: "Resume Analyzed Successfully",
      data: resume,
    });
  } catch (error) {
    console.error("Resume Analysis Error:", error);
    res.status(500).json({ message: `Error analyzing resume: ${error.message}`, error: error.message });
  }
};

export const getResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(resumes);
  } catch (error) {
    res.status(500).json({ message: "Error fetching resumes", error: error.message });
  }
};
