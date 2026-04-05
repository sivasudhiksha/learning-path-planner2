import multer from "multer";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");
import path from "path";
import fs from "fs";
import Resume from "../models/Resume.js";
import { roleSkillMaps } from "../utils/roadmaps.js";
import axios from 'axios';

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

    // AI Alignment Analysis & Skill Extraction
    let alignmentScore = 0;
    let alignmentSuggestions = "AI Analysis failed to generate suggestions. Please check your API key configuration.";
    let extractedSkills = [];
    let missingSkills = [];

    if (!process.env.GEMINI_API_KEY) {
      console.error("CRITICAL: GEMINI_API_KEY is missing from environment variables.");
    }

    // Helper for Keyword-Based Fallback
    const performKeywordFallback = (textContent, targetRole) => {
      const commonRoles = {
        "Frontend": ["React", "JavaScript", "HTML", "CSS", "TypeScript", "Tailwind", "Next.js", "Redux", "Frontend"],
        "Backend": ["Node.js", "Express", "MongoDB", "PostgreSQL", "Python", "Django", "Docker", "Redis", "Backend", "API"],
        "Java": ["Java", "Spring Boot", "Hibernate", "Maven", "JDBC", "JSP", "Servlets"],
        "Python": ["Python", "Django", "Flask", "Pandas", "Numpy", "Scikit-learn"],
        "Full Stack": ["React", "Node.js", "Express", "MongoDB", "JavaScript", "HTML", "CSS"],
        "Data": ["SQL", "Python", "Pandas", "Tableau", "PowerBI", "Machine Learning", "Data"]
      };

      let tSkills = [];
      Object.keys(commonRoles).forEach(key => {
        if (targetRole.toLowerCase().includes(key.toLowerCase())) {
          tSkills = [...new Set([...tSkills, ...commonRoles[key]])];
        }
      });

      if (tSkills.length === 0) {
        tSkills = ["Problem Solving", "Coding", "Software Development", "Communication"];
      }

      const eSkills = [];
      const mSkills = [];
      tSkills.forEach(skill => {
        if (textContent.includes(skill.toLowerCase())) {
          eSkills.push(skill);
        } else {
          mSkills.push(skill);
        }
      });

      return {
        score: Math.round((eSkills.length / (tSkills.length || 1)) * 100),
        extractedSkills: eSkills,
        missingSkills: mSkills,
        suggestions: `### 💡 Basic Analysis (AI Unavailable)
- Found **${eSkills.length}** relevant skills.
- Missing **${mSkills.length}** key skills for a **${targetRole}**.
- Your resume has been analyzed using our standard skill-matching engine.`
      };
    };

    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY is missing. Using keyword-based fallback.");
      const fallback = performKeywordFallback(text, role);
      alignmentScore = fallback.score;
      extractedSkills = fallback.extractedSkills;
      missingSkills = fallback.missingSkills;
      alignmentSuggestions = fallback.suggestions;
    }

    if (process.env.GEMINI_API_KEY) {
      try {
        const aiPrompt = `
          You are a professional Career Coach and Technical Recruiter.
          TARGET ROLE: ${role}
          RESUME CONTENT:
          "${text.substring(0, 5000)}" 
          
          TASK:
          1. Calculate an Alignment Score (0-100) based on how well this resume fits the "${role}" role.
          2. Provide 3-4 specific, actionable suggestions to improve this resume for this specific role.
          3. Extract a list of "Detected Skills" found in the resume that are relevant to a "${role}".
          4. Extract a list of "Missing Skills" that are typically required for a "${role}" but are absent from this resume.
          
          RESPONSE FORMAT (Strict JSON):
          {
            "score": number,
            "suggestions": "string (markdown list format)",
            "detectedSkills": ["skill1", "skill2"],
            "missingSkills": ["skill3", "skill4"]
          }
        `;

        const aiResponse = await axios.post(
          `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            contents: [{ parts: [{ text: aiPrompt }] }],
            generationConfig: { response_mime_type: "application/json" }
          }
        );

        const aiText = aiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (aiText) {
          const parsed = JSON.parse(aiText);
          extractedSkills = parsed.detectedSkills || [];
          missingSkills = parsed.missingSkills || [];
          alignmentScore = parsed.score || Math.round((extractedSkills.length / (extractedSkills.length + missingSkills.length || 1)) * 100);
          alignmentSuggestions = parsed.suggestions || "";
        }
      } catch (aiError) {
        console.error("AI Alignment Error:", aiError.message);
        // Fallback to basic analysis if AI fails
        const fallback = performKeywordFallback(text, role);
        alignmentScore = fallback.score;
        extractedSkills = fallback.extractedSkills;
        missingSkills = fallback.missingSkills;
        alignmentSuggestions = `AI Error: ${aiError.message}. Switching to basic mapping.\n\n${fallback.suggestions}`;
      }
    }

    // Save to DB
    const resume = await Resume.create({
      user: req.user._id,
      fileName: req.file.originalname,
      filePath: filePath,
      extractedSkills,
      role,
      missingSkills,
      alignmentScore,
      alignmentSuggestions,
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
