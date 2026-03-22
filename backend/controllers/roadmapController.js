import LearningPath from "../models/LearningPath.js";
import User from "../models/User.js";

export const getAllPaths = async (req, res) => {
  try {
    const paths = await LearningPath.find({ user: req.user._id });
    res.status(200).json(paths);
  } catch (error) {
    res.status(500).json({ message: "Error fetching paths", error: error.message });
  }
};

export const getPathById = async (req, res) => {
  try {
    const path = await LearningPath.findById(req.params.id);
    if (!path) return res.status(404).json({ message: "Path not found" });
    res.status(200).json(path);
  } catch (error) {
    res.status(500).json({ message: "Error fetching path", error: error.message });
  }
};

// Dummy data for roadmap generation logic
const topicMaps = {
  "Frontend Developer": [
    "HTML5 & Semantic Web", "Modern CSS & Flexbox/Grid", "JavaScript Fundamentals (ES6+)", 
    "React Hooks & State Management", "Advanced React Patterns", "Performance Optimization", 
    "Unit Testing with Jest", "E2E Testing with Cypress", "Responsive Design Mastery", 
    "Web Accessibility (A11y)", "Build Tools (Vite/Webpack)", "Deployment & CI/CD"
  ],
  "Backend Developer": [
    "Node.js Core Modules", "Express.js Architecture", "RESTful API Design", 
    "MongoDB & Mongoose Modeling", "SQL & Relational DBs", "Redis for Caching", 
    "JWT & OAuth2 Security", "Microservices Concepts", "Docker & Containerization", 
    "Cloud Providers (AWS/GCP)", "Message Queues (RabbitMQ/Kafka)", "GraphQL Foundations"
  ],
  "Fullstack Developer": [
    "Frontend Basics (HTML/CSS)", "JavaScript Deep Dive", "React Framework", 
    "State Management (Redux/Zustand)", "Node.js & Express", "Database Design (NoSQL & SQL)", 
    "API Integration", "Authentication Systems", "Fullstack Testing", 
    "DevOps Basics", "System Scalability", "Final Portfolio Project"
  ],
  "Data Scientist": [
    "Python for Data Science", "Numpy & Pandas Deep Dive", "Data Visualization (Matplotlib/Seaborn)", 
    "Exploratory Data Analysis", "Statistics & Probability", "Linear Regression Models", 
    "Classification Algorithms", "Clustering & Unsupervised Learning", "Neural Networks Basics", 
    "Deep Learning with TensorFlow/PyTorch", "Natural Language Processing", "Big Data Tools (Spark)"
  ],
  "UI/UX Designer": [
    "Design Principles & Color Theory", "Typography & Hierarchy", "User Research Methods", 
    "Wireframing with Figma", "Prototyping & Interactions", "Information Architecture", 
    "Usability Testing", "Design Systems & Components", "Mobile-First Design", 
    "Accessibility in Design", "Portfolio Building", "Handoff to Developers"
  ]
};

const topicVideoMap = {
  // Frontend
  "HTML5 & Semantic Web": "hu-q2zYwEYs",
  "Modern CSS & Flexbox/Grid": "OXGznpKZ_sA",
  "JavaScript Fundamentals (ES6+)": "jS4aFq5-91M",
  "React Hooks & State Management": "bMknfKXIFA8",
  "Advanced React Patterns": "7YbcZInxlU0",
  "Build Tools (Vite/Webpack)": "L8reV6M_oX0",
  "Responsive Design Mastery": "srvUrASNj0s",
  "Web Accessibility (A11y)": "e2nkqAt67Zk",
  
  // Backend
  "Node.js Core Modules": "fBNz5xF-Kx4",
  "Express.js Architecture": "SccSCuHhOw0",
  "RESTful API Design": "7nafaH9SddU",
  "MongoDB & Mongoose Modeling": "ExcRbA782GY",
  "JWT & OAuth2 Security": "7nafaH9SddU",
  "SQL & Relational DBs": "HXV3zeQHqGY",

  // General
  "JavaScript Deep Dive": "jS4aFq5-91M",
  "Frontend Basics (HTML/CSS)": "hu-q2zYwEYs",
  "Database Design (NoSQL & SQL)": "ExcRbA782GY",
  "Python for Data Science": "mkv5MxQ0j2o",
  "Numpy & Pandas Deep Dive": "vLq-497J7V8",
};

import axios from 'axios';

export const generatePersonalizedRoadmap = async (req, res) => {
  try {
    const { role, difficultyLevel, duration, skills, preference } = req.body;
    
    const parsedSkills = skills ? skills.split(",").map(s => s.trim()).filter(Boolean) : [];
    
    // Save to user profile
    await User.findByIdAndUpdate(req.user._id, {
      profile: { role, skills: parsedSkills, level: difficultyLevel, duration, preference }
    });

    let steps = [];
    const durationStr = duration || "4 weeks";

    if (process.env.GEMINI_API_KEY) {
      try {
        const prompt = `You are an expert career counselor. Generate a structured ${durationStr} learning path for a ${difficultyLevel} level ${role}. The user already knows: ${parsedSkills.join(', ') || 'nothing'}. 
        Generate a JSON array of modules representing milestones in the path. 
        For EACH module, strictly include:
        1. title: The subject title of the module.
        2. content: A detailed text explanation and mastery guide for this module (markdown format).
        3. videos: An array of 1 to 3 relevant YouTube search queries or actual YouTube video IDs for learning resources (e.g. "React JS Crash Course").
        
        Return ONLY a raw JSON array.`;

        const response = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { response_mime_type: "application/json" }
          }
        );
        
        let textResponse = response.data.candidates[0].content.parts[0].text;
        
        // Clean JSON formatting if Gemini ignores JSON Mode strictness
        if (textResponse.startsWith('```json')) {
            textResponse = textResponse.replace(/^```json/, '').replace(/```$/, '').trim();
        }

        const aiModules = JSON.parse(textResponse);
        
        steps = aiModules.map(mod => ({
          title: mod.title,
          status: "pending",
          resourceVideo: mod.videos && mod.videos.length > 0 ? mod.videos[0] : "",
          resourceVideos: mod.videos || [],
          resourceText: mod.content || `### 🎯 Mastery Guide: ${mod.title}`,
          learningCompleted: false,
          quizPassed: false,
          projectVerified: false
        }));
      } catch (aiError) {
        console.error("Gemini API Error, falling back to static path:", aiError.response?.data || aiError.message);
      }
    } 
    
    // Fallback if no steps were generated (or no API KEY)
    if (steps.length === 0) {
      const fallbackTopics = [
        `Fundamentals of ${role}`, 
        `Intermediate ${role} Concepts`, 
        `Advanced ${role} Techniques`, 
        `Professional ${role} Project`
      ];
      
      steps = fallbackTopics.map((topic, i) => ({
        title: topic,
        status: "pending",
        resourceVideo: "ScMzIvxBSi4",
        resourceVideos: ["ScMzIvxBSi4", "PkZNo7MFNFg"],
        resourceText: `### 🎯 Mastery Guide: ${topic}\n\nThis module is curated for **${difficultyLevel}** level in **${role}**.\n\n**Core Learning Objectives:**\n1. Master the fundamental concepts of ${topic}.\n2. Build a project using industry standards.\n3. Prepare for practical coding tests.\n\n**Milestone Tasks:**\n- 📺 **Watch**: Follow the suggested video tutorials.\n- 🧠 **Assessment**: Pass the standard quiz.\n- 💻 **Project**: Implement and submit your GitHub Repo.`,
        learningCompleted: false,
        quizPassed: false,
        projectVerified: false
      }));
    }

    const learningPath = await LearningPath.create({
      user: req.user._id,
      title: `${role} Roadmap (${difficultyLevel})`,
      description: `A personalized ${durationStr} path for ${role} mastery based on your selected skills.`,
      role,
      skills: parsedSkills,
      difficultyLevel,
      duration: durationStr,
      preference,
      steps,
      pathCompleted: false
    });

    res.status(201).json(learningPath);
  } catch (error) {
    res.status(500).json({ message: "Error generating roadmap", error: error.message });
  }
};

export const updatePath = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedPath = await LearningPath.findOneAndUpdate(
      { _id: id, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!updatedPath) return res.status(404).json({ message: "Path not found" });
    res.json(updatedPath);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
