// backend/services/authService.js

const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { jwtSecret, jwtExpire } = require('../config/environment');

// Register user
exports.registerUser = async (userData) => {
  try {
    const { name, email, password } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('User already exists with that email');
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password
    });

    // Generate token
    const token = user.getSignedJwtToken();

    return {
      success: true,
      token,
      user
    };
  } catch (error) {
    throw error;
  }
};

// Login user
exports.loginUser = async (email, password) => {
  try {
    // Check if email and password are provided
    if (!email || !password) {
      return {
        success: false,
        message: 'Please provide an email and password'
      };
    }

    // Find user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return {
        success: false,
        message: 'Invalid credentials'
      };
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return {
        success: false,
        message: 'Invalid credentials'
      };
    }

    // Generate token
    const token = user.getSignedJwtToken();

    return {
      success: true,
      token,
      user
    };
  } catch (error) {
    throw error;
  }
};

// Forgot password (simplified for now)
exports.forgotPassword = async (email) => {
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return {
        success: false,
        message: 'No user with that email'
      };
    }

    // In a real app, you would generate a token and send an email here
    // For now, we'll just return success
    return {
      success: true
    };
  } catch (error) {
    throw error;
  }
};

// Reset password (simplified for now)
exports.resetPassword = async (token, password) => {
  try {
    // In a real app, you would validate the token and find the user
    // For now, we'll just return success
    return {
      success: true
    };
  } catch (error) {
    throw error;
  }
};