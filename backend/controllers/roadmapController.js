import LearningPath from "../models/LearningPath.js";
import User from "../models/User.js";
import axios from 'axios';

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

  // Java Specific
  "Java Basic": "hBh_CC5y8-s",
  "Java Intermediate": "xk4_1g9ko5o",
  "Java Advanced": "B7WUiV8-99w",
  "Java Project": "xk4_1g9ko5o",
  
  // Explicit Level Mapping (Normalized keys)
  "java-beginner": "hBh_CC5y8-s",
  "java-intermediate": "xk4_1g9ko5o",
  "java-advanced": "B7WUiV8-99w",
  "java-project": "xk4_1g9ko5o",

  "react-beginner": "bMknfKXIFA8",
  "react-advanced": "7YbcZInxlU0",
  "javascript-beginner": "jS4aFq5-91M",
  "node-beginner": "fBNz5xF-Kx4",
  "express-beginner": "SccSCuHhOw0",
  "mongodb-beginner": "ExcRbA782GY",
};

// Helper to normalize titles for better matching
const normalizeTitle = (title) => {
  if (!title) return "";
  let t = title.toLowerCase().trim();
  
  let level = "beginner"; // Default
  if (t.includes("intermediate") || t.includes("concepts")) level = "intermediate";
  else if (t.includes("advanced") || t.includes("technique") || t.includes("expert") || t.includes("deep dive")) level = "advanced";
  else if (t.includes("project") || t.includes("professional") || t.includes("build")) level = "project";
  else if (t.includes("fundamental") || t.includes("basic") || t.includes("intro")) level = "beginner";

  // Extract core subject (e.g., "java", "react", "python")
  const subject = t
    .replace(/fundamentals of /g, "")
    .replace(/intermediate /g, "")
    .replace(/advanced /g, "")
    .replace(/developer/g, "")
    .replace(/concepts/g, "")
    .replace(/techniques/g, "")
    .replace(/project/g, "")
    .replace(/tutorial/g, "")
    .replace(/mastery/g, "")
    .replace(/course/g, "")
    .trim();

  return `${subject}-${level}`;
};

const getDirectVideo = (title) => {
  if (!title) return null;
  const normTitle = normalizeTitle(title);
  
  // Direct match in map
  if (topicVideoMap[title]) return topicVideoMap[title];
  
  // Try mapping by normalized key
  // We'll search the map values or keys that match the normalized format
  const match = Object.keys(topicVideoMap).find(key => normalizeTitle(key) === normTitle);
  return match ? topicVideoMap[match] : null;
};


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
        1. title: The subject title of the module (e.g. "Fundamentals of Java").
        2. content: A detailed text explanation and mastery guide for this module (markdown format).
        3. videos: An array of 1 to 3 relevant YouTube video IDs OR highly specific search queries (e.g. ["hBh_CC5y8-s", "Java Variables & Data Types"]).
        
        CRITICAL: If the topic is Java, prioritize these video IDs if applicable: "hBh_CC5y8-s" (Beginner), "xk4_1g9ko5o" (Intermediate), "B7WUiV8-99w" (Advanced).
        
        Return ONLY a raw JSON array.`;

        const response = await axios.post(
          `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { response_mime_type: "application/json" }
          }
        );
        
        if (!response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
          throw new Error("Invalid AI response structure");
        }

        let textResponse = response.data.candidates[0].content.parts[0].text;
        
        // Clean JSON formatting if Gemini ignores JSON Mode strictness
        if (textResponse.startsWith('```json')) {
            textResponse = textResponse.replace(/^```json/, '').replace(/```$/, '').trim();
        }

        const parsed = JSON.parse(textResponse);
        const aiModules = Array.isArray(parsed) ? parsed : (parsed.modules || parsed.updatedModules || []);
        
        if (!Array.isArray(aiModules)) {
          throw new Error("AI did not return an array of modules");
        }
        
        steps = aiModules.map(mod => {
          const directVideo = getDirectVideo(mod.title);
          const finalVideos = directVideo ? [directVideo, ...(mod.videos || [])] : (mod.videos || []);
          
          return {
            title: mod.title,
            status: "not_started",
            resourceVideo: finalVideos.length > 0 ? finalVideos[0] : "",
            resourceVideos: Array.from(new Set(finalVideos)), // Deduplicate
            resourceText: mod.content || `### 🎯 Mastery Guide: ${mod.title}`,
            learningCompleted: false,
            quizPassed: false,
            projectVerified: false
          };
        });
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
      
      steps = fallbackTopics.map((topic, i) => {
        const videoId = getDirectVideo(topic) || "hBh_CC5y8-s";
        const searchTerms = [
          `${role} ${topic} Tutorial`,
          `${topic} for Beginners`,
          `Best ${role} Course 2024`
        ];
        
        return {
          title: topic,
          status: "not_started",
          resourceVideo: videoId,
          resourceVideos: [videoId, ...searchTerms],
          resourceText: `### 🎯 Mastery Guide: ${topic}\n\nThis module is curated for **${difficultyLevel}** level in **${role}**.\n\n**Core Learning Objectives:**\n1. Master the fundamental concepts of ${topic}.\n2. Build a project using industry standards.\n3. Prepare for practical coding tests.\n\n**Milestone Tasks:**\n- 📺 **Watch**: Follow the suggested video tutorials.\n- 🧠 **Assessment**: Pass the standard quiz.\n- 💻 **Project**: Implement and submit your GitHub Repo.`,
          learningCompleted: false,
          quizPassed: false,
          projectVerified: false
        };
      });
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

export const adaptiveUpdateRoadmap = async (req, res) => {
  try {
    const { id } = req.params;
    const path = await LearningPath.findOne({ _id: id, user: req.user._id });
    if (!path) return res.status(404).json({ message: "Learning path not found" });

    const today = new Date();
    const completedSteps = path.steps.filter(s => s.status === "completed");
    const pendingSteps = path.steps.filter(s => s.status !== "completed");
    
    // Calculate metrics
    const completionRate = Math.round((completedSteps.length / path.steps.length) * 100);
    const missedDeadlines = pendingSteps.filter(s => s.scheduledDate && new Date(s.scheduledDate) < today);
    
    // Determine pace
    let pace = "average";
    let earlyCompletions = 0;
    let lateCompletions = 0;

    completedSteps.forEach(s => {
      if (s.completedDate && s.scheduledDate) {
        if (new Date(s.completedDate) < new Date(s.scheduledDate)) earlyCompletions++;
        else if (new Date(s.completedDate) > new Date(s.scheduledDate)) lateCompletions++;
      }
    });

    if (missedDeadlines.length > 2 || lateCompletions > earlyCompletions) pace = "slow";
    else if (earlyCompletions > lateCompletions && earlyCompletions > 1) pace = "fast";

    // Prepare AI Prompt
    const completedTitles = completedSteps.map(s => s.title).join(", ");
    const pendingTitles = pendingSteps.map(s => s.title).join(", ");
    
    const prompt = `You are an Adaptive Learning Coach for a ${path.role} student.
    CURRENT PROGRESS:
    - Completion Rate: ${completionRate}%
    - Learning Pace: ${pace}
    - Missed Deadlines: ${missedDeadlines.length}
    - Completed Topics: ${completedTitles || "None yet"}
    - Pending Topics: ${pendingTitles}

    Your goal is to REGENERATE the learning plan for the REMAINING topics based on this performance.
    
    INSTRUCTIONS:
    1. Provide 2-3 sentences of personalized feedback/suggestions in an 'advice' field.
    2. Regenerate the milestones for ONLY the pending topics. 
    3. If pace is 'slow', simplify and break down the remaining topics into smaller modules.
    4. If pace is 'fast', add more advanced 'deep-dive' challenges to the remaining modules.
    5. Ensure the new plan is realistic given the remaining duration.
    
    Return a JSON object with:
    {
      "advice": "Your feedback here",
      "updatedModules": [
        { "title": "...", "content": "...", "videos": ["..."] }
      ]
    }
    
    Return ONLY raw JSON.`;

    let updatedModules = [];
    let aiAdvice = "";

    if (process.env.GEMINI_API_KEY) {
      const aiResponse = await axios.post(
        `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { response_mime_type: "application/json" }
        }
      );

      if (!aiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error("Invalid Adaptive AI response structure");
      }

      let textResponse = aiResponse.data.candidates[0].content.parts[0].text;
      if (textResponse.startsWith('```json')) {
          textResponse = textResponse.replace(/^```json/, '').replace(/```$/, '').trim();
      }
      
      const parsedRes = JSON.parse(textResponse);
      aiAdvice = parsedRes.advice || "Your path has been recalibrated based on your progress.";
      updatedModules = parsedRes.updatedModules || (Array.isArray(parsedRes) ? parsedRes : []);
    } else {
      // Fallback if no AI
      aiAdvice = "Keep going! You are making steady progress.";
      updatedModules = pendingSteps.map(s => ({
        title: s.title,
        content: s.resourceText,
        videos: s.resourceVideos
      }));
    }

    // Map AI modules back to Step schema
    const newSteps = updatedModules.map(mod => {
      const directVideo = getDirectVideo(mod.title);
      const finalVideos = directVideo ? [directVideo, ...(mod.videos || [])] : (mod.videos || []);
      
      return {
        title: mod.title,
        status: "not_started",
        resourceVideos: Array.from(new Set(finalVideos)),
        resourceText: mod.content,
        learningCompleted: false,
        quizPassed: false,
        projectVerified: false
      };
    });

    // Combine completed steps with new updated steps
    path.steps = [...completedSteps, ...newSteps];
    path.aiSuggestions = aiAdvice;
    await path.save();

    res.status(200).json(path);
  } catch (error) {
    console.error("Adaptive Update Error:", error);
    res.status(500).json({ message: "Error updating roadmap adaptively", error: error.message });
  }
};
