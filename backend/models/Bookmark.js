import mongoose from "mongoose";

const bookmarkSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  skill: { type: String, required: true },
  title: { type: String, required: true },
  url: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Bookmark = mongoose.model("Bookmark", bookmarkSchema);
export default Bookmark;
