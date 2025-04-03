const Project = require('../models/Project');
const Template = require('../models/Template');
const unityService = require('./unityService');
const assetService = require('./assetService');

// Create a new game project
exports.createProject = async (projectData) => {
  try {
    // Find appropriate template based on game type
    const template = await Template.findOne({ type: projectData.gameType });
    
    if (!template) {
      throw new Error(`No template found for game type: ${projectData.gameType}`);
    }
    
    // Create project with template
    const project = new Project({
      ...projectData,
      templateId: template._id,
      status: 'draft'
    });
    
    await project.save();
    return project;
  } catch (error) {
    throw error;
  }
};

// Get all projects for a user
exports.getUserProjects = async (userId) => {
  try {
    return await Project.find({ userId }).sort({ updatedAt: -1 });
  } catch (error) {
    throw error;
  }
};

// Get project by ID
exports.getProjectById = async (projectId) => {
  try {
    return await Project.findById(projectId)
      .populate('templateId')
      .populate('assets');
  } catch (error) {
    throw error;
  }
};

// Start game build process
exports.startGameBuild = async (projectId) => {
  try {
    const project = await Project.findById(projectId);
    
    if (!project) {
      throw new Error('Project not found');
    }
    
    // Update project status
    project.status = 'processing';
    await project.save();
    
    // Prepare assets
    const assets = await assetService.prepareAssetsForBuild(project);
    
    // Create build configuration
    const buildConfig = {
      projectId: project._id,
      templateId: project.templateId,
      gameDesign: project.gameDesignDocument,
      assets: assets
    };
    
    // Start Unity build
    const buildJob = await unityService.createBuildJob(buildConfig);
    
    // Update project with build info
    project.buildInfo = {
      buildId: buildJob.id,
      startTime: new Date(),
      logs: ['Build job created']
    };
    project.status = 'building';
    await project.save();
    
    // Queue the build (could be async)
    unityService.queueBuild(buildJob);
    
    return {
      id: buildJob.id,
      estimatedTime: buildJob.estimatedTime
    };
  } catch (error) {
    throw error;
  }
};

// Get build status
exports.getBuildStatus = async (buildId) => {
  try {
    return await unityService.getBuildStatus(buildId);
  } catch (error) {
    throw error;
  }
};

// Update an existing project
exports.updateProject = async (projectId, updates) => {
  try {
    return await Project.findByIdAndUpdate(
      projectId,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
  } catch (error) {
    throw error;
  }
};

// Delete a project
exports.deleteProject = async (projectId) => {
  try {
    const project = await Project.findById(projectId);
    
    if (!project) {
      throw new Error('Project not found');
    }
    
    // Delete associated build if exists
    if (project.buildInfo && project.buildInfo.buildId) {
      await unityService.deleteBuild(project.buildInfo.buildId);
    }
    
    // Delete the project
    await Project.findByIdAndDelete(projectId);
    
    return true;
  } catch (error) {
    throw error;
  }
};