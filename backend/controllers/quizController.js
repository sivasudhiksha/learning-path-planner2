import Quiz from "../models/Quiz.js";

export const getQuizByTopic = async (req, res) => {
  try {
    const { topic } = req.params;
    const quiz = await Quiz.findOne({ topic });
    if (!quiz) {
      // Return a simulated high-quality quiz for demo if specific topic not yet seeded
      return res.status(200).json({
        topic,
        questions: [
          {
            questionText: `Which of the following best describes a core concept of "${topic}" in a professional context?`,
            options: ["Structural Organization", "Scalability & Performance", "Security Protocols", "All of the Above"],
            correctAnswer: 3
          },
          {
            questionText: `What is the primary objective of mastering "${topic}" for a modern developer?`,
            options: ["Legacy Maintenance", "Clean Code Architecture", "Manual Documentation", "Simplistic Scripting"],
            correctAnswer: 1
          },
          {
            questionText: `In the study of "${topic}", which factor is most critical for long-term system stability?`,
            options: ["Ad-hoc Patching", "Automated Testing & Validation", "Complex Hierarchy", "Minimal Resource Usage"],
            correctAnswer: 1
          },
          // More simulated questions can be added or dynamically generated
        ]
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
