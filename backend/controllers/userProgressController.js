import UserProgress from "../models/UserProgress.js";

// CREATE OR UPDATE PROGRESS
export const updateProgress = async (req, res) => {
  try {
    const { learningPathId, stepsCompleted, project, certificate } = req.body;

    let progress = await UserProgress.findOne({
      user: req.user._id,
      learningPath: learningPathId,
    });

    if (progress) {
      // Update progress
      if (stepsCompleted) progress.stepsCompleted += stepsCompleted;
      if (project) progress.projectsCompleted.push(project);
      if (certificate) progress.certificates.push(certificate);

      // Update percentage
      progress.completionPercentage = Math.min(
        100,
        (progress.stepsCompleted / progress.totalSteps) * 100
      );

      progress.updatedAt = Date.now();
      await progress.save();
    } else {
      // Create new progress
      progress = await UserProgress.create({
        user: req.user._id,
        learningPath: learningPathId,
        stepsCompleted: stepsCompleted || 0,
        totalSteps: 10, // you can customize per path
        projectsCompleted: project ? [project] : [],
        certificates: certificate ? [certificate] : [],
        completionPercentage: stepsCompleted ? (stepsCompleted / 10) * 100 : 0,
      });
    }

    res.status(200).json({ message: "Progress updated", progress });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET USER PROGRESS
export const getProgress = async (req, res) => {
  try {
    const progress = await UserProgress.find({ user: req.user._id }).populate("learningPath");
    res.status(200).json({ progress });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};