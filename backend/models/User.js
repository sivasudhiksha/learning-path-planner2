import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profile: {
    role: { type: String },
    skills: [{ type: String }],
    level: { type: String },
    duration: { type: String },
    preference: { type: String },
    education: { type: String },
    linkedin: { type: String },
    github: { type: String },
    leetcode: { type: String }
  },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);
export default User;