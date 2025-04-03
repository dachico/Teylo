const projectService = require('../services/gameService');
const promptService = require('../services/promptService');

// Create a new game project from prompt
exports.createProject = async (req, res, next) => {
  try {
    const { prompt, name } = req.body;
    const userId = req.user.id;

    // Process the prompt to generate game design document
    const gameDesign = await promptService.processGamePrompt(prompt);
    
    // Create the project
    const project = await projectService.createProject({
      userId,
      name: name || gameDesign.suggestedName,
      originalPrompt: prompt,
      gameType: gameDesign.gameType,
      gameDesignDocument: gameDesign
    });

    res.status(201).json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
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
    const project = await projectService.getProjectById(projectId);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
};

// Build the game
exports.buildGame = async (req, res, next) => {
  try {
    const projectId = req.params.id;
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
    next(error);
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
    next(error);
  }
};

// Update an existing project
exports.updateProject = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const updates = req.body;
    
    const updatedProject = await projectService.updateProject(projectId, updates);
    
    if (!updatedProject) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: updatedProject
    });
  } catch (error) {
    next(error);
  }
};

// Delete a project
exports.deleteProject = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    await projectService.deleteProject(projectId);
    
    res.status(200).json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};