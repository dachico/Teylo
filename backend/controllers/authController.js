const authService = require('../services/authService');

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    
    // Register user
    const result = await authService.registerUser({ name, email, password });
    
    res.status(201).json({
      success: true,
      token: result.token,
      user: {
        id: result.user._id,
        name: result.user.name,
        email: result.user.email
      }
    });
  } catch (error) {
    next(error);
  }
};

// Login user
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Login user
    const result = await authService.loginUser(email, password);
    
    if (!result.success) {
      return res.status(401).json({
        success: false,
        error: result.message
      });
    }
    
    res.status(200).json({
      success: true,
      token: result.token,
      user: {
        id: result.user._id,
        name: result.user.name,
        email: result.user.email
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get current user
exports.getCurrentUser = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email
      }
    });
  } catch (error) {
    next(error);
  }
};

// Forgot password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    const result = await authService.forgotPassword(email);
    
    res.status(200).json({
      success: true,
      message: 'Password reset instructions sent to email'
    });
  } catch (error) {
    next(error);
  }
};

// Reset password
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    
    const result = await authService.resetPassword(token, password);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.message
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    next(error);
  }
};