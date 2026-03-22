import Streak from "../models/Streak.js";

export const getStreak = async (req, res) => {
  try {
    let streak = await Streak.findOne({ user: req.user._id });
    if (!streak) {
      streak = await Streak.create({ user: req.user._id, count: 1, history: [new Date()] });
    }
    res.status(200).json(streak);
  } catch (error) {
    res.status(500).json({ message: "Error fetching streak", error: error.message });
  }
};

export const updateStreak = async (req, res) => {
  try {
    let streak = await Streak.findOne({ user: req.user._id });
    const today = new Date().setHours(0, 0, 0, 0);

    if (!streak) {
      streak = await Streak.create({ user: req.user._id, count: 1, history: [new Date()] });
    } else {
      const lastDate = new Date(streak.lastActivityDate).setHours(0, 0, 0, 0);
      const diff = (today - lastDate) / (1000 * 60 * 60 * 24);

      if (diff === 1) {
        // Consecutive day
        streak.count += 1;
        streak.lastActivityDate = new Date();
        streak.history.push(new Date());
        if (streak.count > streak.longestStreak) streak.longestStreak = streak.count;
      } else if (diff > 1) {
        // Missed day
        streak.count = 1;
        streak.lastActivityDate = new Date();
        streak.history.push(new Date());
      }
      // if diff === 0, already updated today
      await streak.save();
    }
    res.status(200).json(streak);
  } catch (error) {
    res.status(500).json({ message: "Error updating streak", error: error.message });
  }
};
