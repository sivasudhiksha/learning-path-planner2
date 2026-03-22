import Bookmark from "../models/Bookmark.js";

export const createBookmark = async (req, res) => {
  try {
    const { skill, title, url } = req.body;
    const bookmark = await Bookmark.create({
      user: req.user._id,
      skill,
      title,
      url,
    });
    res.status(201).json(bookmark);
  } catch (error) {
    res.status(500).json({ message: "Error creating bookmark", error: error.message });
  }
};

export const getBookmarks = async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ user: req.user._id });
    res.status(200).json(bookmarks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching bookmarks", error: error.message });
  }
};

export const deleteBookmark = async (req, res) => {
  try {
    const { id } = req.params;
    await Bookmark.findOneAndDelete({ _id: id, user: req.user._id });
    res.status(200).json({ message: "Bookmark deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting bookmark", error: error.message });
  }
};
