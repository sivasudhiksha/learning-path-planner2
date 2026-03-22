import Quiz from "../models/Quiz.js";

export const getQuizByTopic = async (req, res) => {
  try {
    const { topic } = req.params;
    const quiz = await Quiz.findOne({ topic });
    if (!quiz) {
      // Return a dummy quiz for demo if not found
      return res.status(200).json({
        topic,
        questions: Array.from({ length: 15 }, (_, i) => ({
          questionText: `Sample question ${i + 1} about ${topic}?`,
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctAnswer: 0
        }))
      });
    }
    res.status(200).json(quiz);
  } catch (error) {
    res.status(500).json({ message: "Error fetching quiz", error: error.message });
  }
};

export const submitQuiz = async (req, res) => {
  try {
    const { topic, score } = req.body;
    // Logic to update user progress or just return result
    res.status(200).json({ message: `Quiz for ${topic} submitted. Score: ${score}/15` });
  } catch (error) {
    res.status(500).json({ message: "Error submitting quiz", error: error.message });
  }
};
