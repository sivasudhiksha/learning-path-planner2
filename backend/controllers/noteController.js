import Note from "../models/Note.js";

export const createNote = async (req, res) => {
  try {
    const { learningPathId, skill, content } = req.body;
    const note = await Note.create({
      user: req.user._id,
      learningPath: learningPathId,
      skill,
      content,
    });
    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ message: "Error creating note", error: error.message });
  }
};

export const getNotesByPath = async (req, res) => {
  try {
    const { learningPathId } = req.params;
    const notes = await Note.find({ user: req.user._id, learningPath: learningPathId });
    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ message: "Error fetching notes", error: error.message });
  }
};

export const updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const note = await Note.findOneAndUpdate(
      { _id: id, user: req.user._id },
      { content, updatedAt: Date.now() },
      { new: true }
    );
    res.status(200).json(note);
  } catch (error) {
    res.status(500).json({ message: "Error updating note", error: error.message });
  }
};

export const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    await Note.findOneAndDelete({ _id: id, user: req.user._id });
    res.status(200).json({ message: "Note deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting note", error: error.message });
  }
};
