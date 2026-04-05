
import mongoose from "mongoose";
import { analyzeResume } from "./controllers/resumeController.js";
import dotenv from "dotenv";
import User from "./models/User.js";
import fs from "fs";
import path from "path";

dotenv.config();

const testAlignment = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");
        console.log("Using API Key:", process.env.GEMINI_API_KEY ? "PRESENT" : "MISSING");

        const user = await User.findOne({ email: "testuser1@example.com" });
        if (!user) throw new Error("User not found");

        // Mock Request and Response
        const req = {
            user: { _id: user._id },
            body: { role: "Machine Learning Engineer" },
            file: {
                path: "e:/learningpathplanner/backend/uploads/resumes/1774326375578-MachineLearning_Resume.pdf",
                originalname: "1774326375578-MachineLearning_Resume.pdf"
            }
        };

        const res = {
            status: function(code) {
                console.log("Response Status:", code);
                return this;
            },
            json: function(data) {
                console.log("Response Data (AI RESULT):", JSON.stringify(data, null, 2));
            }
        };

        console.log("Starting Full AI Analysis for Role: Machine Learning Engineer...");
        await analyzeResume(req, res);

        await mongoose.disconnect();
    } catch (err) {
        console.error("Test Failed:", err);
    }
};

testAlignment();
