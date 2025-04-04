// backend/controllers/projectController.js
const projectService = require('../services/gameService');
const promptService = require('../services/promptService');

// Create a new game project from prompt
exports.createProject = async (req, res, next) => {
  try {
    const { prompt, name } = req.body;
    const userId = req.user.id;

    if (!prompt || prompt.trim().length < 10) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a detailed game description'
      });
    }

    console.log(`Processing prompt from user ${userId}: "${prompt.slice(0, 100)}${prompt.length > 100 ? '...' : ''}"`);

    // Process the prompt to generate game design document
    const gameDesign = await promptService.processGamePrompt(prompt);
    console.log(`Generated game design document for type: ${gameDesign.gameType}`);
    
    // Create the project
    const project = await projectService.createProject({
      userId,
      name: name || gameDesign.suggestedName,
      originalPrompt: prompt,
      gameType: gameDesign.gameType,
      gameDesignDocument: gameDesign
    });

    console.log(`Created new project with ID: ${project._id}`);

    res.status(201).json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Error creating project:', error);
    
    // Provide a more helpful error message to the client
    const errorMessage = error.message || 'An error occurred while creating the project';
    
    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
};

// Get all projects for a user
exports.getUserProjects = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const projects = await projectService.getUserProjects(userId);
    
    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    next(error);
  }
};

// Get a single project
exports.getProject = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;
    
    const project = await projectService.getProjectById(projectId);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }
    
    // Ensure the user can only access their own projects
    if (project.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized access to this project'
      });
    }
    
    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Error getting project:', error);
    next(error);
  }
};

// Build the game
exports.buildGame = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;
    
    // Verify project ownership
    const project = await projectService.getProjectById(projectId);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }
    
    if (project.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized access to this project'
      });
    }
    
    console.log(`Starting build for project ${projectId}`);
    const buildJob = await projectService.startGameBuild(projectId);
    
    res.status(200).json({
      success: true,
      message: 'Build started successfully',
      data: {
        buildId: buildJob.id,
        estimatedTime: buildJob.estimatedTime
      }
    });
  } catch (error) {
    console.error('Error starting build:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to start build process'
    });
  }
};

// Get build status
exports.getBuildStatus = async (req, res, next) => {
  try {
    const buildId = req.params.buildId;
    const status = await projectService.getBuildStatus(buildId);
    
    res.status(200).json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Error getting build status:', error);
    next(error);
  }
};

// Update an existing project
exports.updateProject = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;
    const updates = req.body;
    
    // Verify project ownership
    const project = await projectService.getProjectById(projectId);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }
    
    if (project.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized access to this project'
      });
    }
    
    const updatedProject = await projectService.updateProject(projectId, updates);
    
    res.status(200).json({
      success: true,
      data: updatedProject
    });
  } catch (error) {
    console.error('Error updating project:', error);
    next(error);
  }
};

// Delete a project
exports.deleteProject = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;
    
    // Verify project ownership
    const project = await projectService.getProjectById(projectId);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }
    
    if (project.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized access to this project'
      });
    }
    
    await projectService.deleteProject(projectId);
    
    res.status(200).json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    next(error);
  }
}