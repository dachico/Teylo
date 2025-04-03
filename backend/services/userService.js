const User = require('../models/User');
const Project = require('../models/Project');
const bcrypt = require('bcryptjs');

// Get user by ID
exports.getUserById = async (userId) => {
  try {
    return await User.findById(userId);
  } catch (error) {
    throw error;
  }
};

// Update user
exports.updateUser = async (userId, updates) => {
  try {
    return await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true, runValidators: true }
    );
  } catch (error) {
    throw error;
  }
};

// Change password
exports.changePassword = async (userId, currentPassword, newPassword) => {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      return {
        success: false,
        message: 'User not found'
      };
    }
    
    // Check if current password is correct
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    
    if (!isMatch) {
      return {
        success: false,
        message: 'Current password is incorrect'
      };
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    await user.save();
    
    return {
      success: true,
      message: 'Password changed successfully'
    };
  } catch (error) {
    throw error;
  }
};

// Get user statistics
exports.getUserStats = async (userId) => {
  try {
    // Get counts of projects by status
    const projectStats = await Project.aggregate([
      { $match: { userId } },
      { $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Format project stats
    const formattedStats = {};
    projectStats.forEach(stat => {
      formattedStats[stat._id] = stat.count;
    });
    
    // Get total project count
    const totalProjects = await Project.countDocuments({ userId });
    
    // Get latest projects
    const latestProjects = await Project.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name status createdAt');
    
    return {
      totalProjects,
      projectsByStatus: formattedStats,
      latestProjects
    };
  } catch (error) {
    throw error;
  }
};

// Delete user
exports.deleteUser = async (userId) => {
  try {
    // Delete all user's projects
    await Project.deleteMany({ userId });
    
    // Delete user
    await User.findByIdAndDelete(userId);
    
    return true;
  } catch (error) {
    throw error;
  }
};