import mongoose from "mongoose";
import Quiz from "../models/Quiz.js";
import dotenv from "dotenv";

dotenv.config();

const questions = [
  {
    topic: "Fundamentals of java developer",
    questions: [
      {
        questionText: "What is the correct way to declare a variable to store a whole number in Java?",
        options: ["int x = 5;", "float x = 5;", "string x = \"5\";", "boolean x = 5;"],
        correctAnswer: 0
      },
      {
        questionText: "Which of these is a valid identifier in Java?",
        options: ["2ndVariable", "variable_name", "variable-name", "class"],
        correctAnswer: 1
      },
      {
        questionText: "What is the output of System.out.println(5 + 2 + \" \" + 5 + 2);?",
        options: ["7 7", "7 52", "52 52", "14"],
        correctAnswer: 1
      },
      {
        questionText: "Which keyword is used to create an instance of a class?",
        options: ["class", "new", "public", "void"],
        correctAnswer: 1
      },
      {
        questionText: "What is the default value of a local variable in Java?",
        options: ["0", "null", "No default value (must be initialized)", "undefined"],
        correctAnswer: 2
      },
      {
        questionText: "Which loop is guaranteed to execute at least once?",
        options: ["for", "while", "do-while", "none"],
        correctAnswer: 2
      },
      {
        questionText: "What is the size of an int data type in Java?",
        options: ["8-bit", "16-bit", "32-bit", "64-bit"],
        correctAnswer: 2
      },
      {
        questionText: "Which access modifier makes a member accessible only within its own class?",
        options: ["public", "protected", "private", "default"],
        correctAnswer: 2
      },
      {
        questionText: "What does the static keyword mean for a method?",
        options: ["The method belongs to the class, not an instance", "The method cannot be changed", "The method is hidden", "The method runs automatically"],
        correctAnswer: 0
      },
      {
        questionText: "Which of the following is NOT a primitive data type in Java?",
        options: ["int", "boolean", "String", "double"],
        correctAnswer: 2
      },
      {
        questionText: "How do you find the length of a string s in Java?",
        options: ["s.size()", "s.length", "s.length()", "s.count()"],
        correctAnswer: 2
      },
      {
        questionText: "What is the correct syntax to inherit a class in Java?",
        options: ["extends", "implements", "inherits", "using"],
        correctAnswer: 0
      },
      {
        questionText: "Which operator is used for checking equality in Java?",
        options: ["=", "==", "===", "equals"],
        correctAnswer: 1
      },
      {
        questionText: "What is a constructor in Java?",
        options: ["A method to delete objects", "A special method used to initialize objects", "A type of loop", "A way to import packages"],
        correctAnswer: 1
      },
      {
        questionText: "Which package is imported by default in every Java program?",
        options: ["java.util", "java.io", "java.lang", "java.net"],
        correctAnswer: 2
      }
    ]
  }
];

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/learningpathplanner";
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB for seeding...");

    for (const q of questions) {
      await Quiz.findOneAndUpdate(
        { topic: q.topic },
        { $set: { questions: q.questions } },
        { upsert: true, new: true }
      );
      console.log(`Seeded quiz for topic: ${q.topic}`);
    }

    console.log("Seeding completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding database:", err);
    process.exit(1);
  }
};

seedDB();
