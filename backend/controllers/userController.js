import User from "../models/User.js";

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        profile: user.profile || {},
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;

      if (req.body.profile) {
        if (!user.profile) user.profile = {};
        
        // Define fields explicitly to avoid Mongoose spread operator bugs
        const fieldsToUpdate = ['education', 'skills', 'linkedin', 'github', 'leetcode', 'role', 'level', 'duration', 'preference'];
        
        fieldsToUpdate.forEach(field => {
          if (req.body.profile[field] !== undefined) {
            user.profile[field] = req.body.profile[field];
          }
        });
      }

      // Important: Users might want to update password here later, skipping for now
      
      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        profile: updatedUser.profile,
        // Typically we'd return a new token here if they changed their email, but it's fine for now
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
