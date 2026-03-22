import mongoose from "mongoose";

const quizSchema = new mongoose.Schema({
  topic: { type: String, required: true },
  questions: [
    {
      questionText: { type: String, required: true },
      options: [{ type: String, required: true }],
      correctAnswer: { type: Number, required: true }, // Index of the correct option
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

const Quiz = mongoose.model("Quiz", quizSchema);
export default Quiz;
