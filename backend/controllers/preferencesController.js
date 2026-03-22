import Preferences from "../models/Preferences.js";

// CREATE OR UPDATE PREFERENCES
export const savePreferences = async (req, res) => {
  try {
    const { knownLanguages, skillsToDevelop, roles } = req.body;

    let preferences = await Preferences.findOne({ user: req.user._id });

    if (preferences) {
      // Update existing preferences
      preferences.knownLanguages = knownLanguages;
      preferences.skillsToDevelop = skillsToDevelop;
      preferences.roles = roles;
      await preferences.save();
    } else {
      // Create new preferences
      preferences = await Preferences.create({
        user: req.user._id,
        knownLanguages,
        skillsToDevelop,
        roles,
      });
    }

    res.status(200).json({ message: "Preferences saved", preferences });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};