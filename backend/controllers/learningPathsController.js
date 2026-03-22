import LearningPath from "../models/LearningPath.js";

// Create a new learning path
export const createLearningPath = async (req, res) => {
  try {
    const { title, description, role, skills } = req.body;

    const newPath = new LearningPath({
      title,
      description,
      role,
      skills,
    });

    await newPath.save();

    res.status(201).json({
      message: "Learning Path Created Successfully",
      data: newPath,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating learning path",
      error: error.message,
    });
  }
};

// Get all learning paths
export const getLearningPaths = async (req, res) => {
  try {
    const paths = await LearningPath.find();
    res.status(200).json(paths);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching learning paths",
      error: error.message,
    });
  }
};