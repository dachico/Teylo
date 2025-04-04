// backend/services/gameService.js
const Project = require('../models/Project');
const Template = require('../models/Template');
const unityService = require('./unityService');
const assetService = require('./assetService');

// Create a new game project
exports.createProject = async (projectData) => {
  try {
    console.log('Creating new project with data:', JSON.stringify(projectData, null, 2));
    
    // Find appropriate template based on game type
    const template = await Template.findOne({ type: projectData.gameType });
    
    if (!template) {
      console.error(`No template found for game type: ${projectData.gameType}`);
      throw new Error(`No template found for game type: ${projectData.gameType}`);
    }
    
    console.log(`Found template for ${projectData.gameType} with ID: ${template._id}`);
    
    // Create project with template
    const project = new Project({
      ...projectData,
      templateId: template._id,
      status: 'draft'
    });
    
    await project.save();
    console.log(`Project created with ID: ${project._id}`);
    
    return project;
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
};

// Get all projects for a user
exports.getUserProjects = async (userId) => {
  try {
    return await Project.find({ userId }).sort({ updatedAt: -1 });
  } catch (error) {
    console.error('Error getting user projects:', error);
    throw error;
  }
};

// Get project by ID
exports.getProjectById = async (projectId) => {
  try {
    return await Project.findById(projectId)
      .populate('templateId');
  } catch (error) {
    console.error('Error getting project by ID:', error);
    throw error;
  }
};

// Start game build process
exports.startGameBuild = async (projectId) => {
  try {
    console.log(`Starting build process for project ${projectId}`);
    
    const project = await Project.findById(projectId);
    
    if (!project) {
      console.error('Project not found for ID:', projectId);
      throw new Error('Project not found');
    }
    
    // Update project status
    console.log('Updating project status to processing');
    project.status = 'processing';
    await project.save();
    
    // Prepare assets
    console.log('Preparing assets for build');
    const assets = await assetService.prepareAssetsForBuild(project);
    console.log(`Prepared ${assets.length} assets for build`);
    
    // Create build configuration
    const buildConfig = {
      projectId: project._id,
      templateId: project.templateId,
      gameDesign: project.gameDesignDocument,
      assets: assets
    };
    
    console.log('Build configuration created:', JSON.stringify(buildConfig, null, 2));
    
    // Start Unity build
    console.log('Creating build job');
    const buildJob = await unityService.createBuildJob(buildConfig);
    console.log(`Build job created with ID: ${buildJob.id}`);
    
    // Update project with build info
    console.log('Updating project with build info');
    project.buildInfo = {
      buildId: buildJob.id,
      startTime: new Date(),
      logs: ['Build job created']
    };
    project.status = 'building';
    await project.save();
    
    // Queue the build (could be async)
    console.log('Queueing build job');
    unityService.queueBuild(buildJob);
    
    return {
      id: buildJob.id,
      estimatedTime: buildJob.estimatedTime
    };
  } catch (error) {
    console.error('Error starting game build:', error);
    
    // Update project status to failed if an error occurs
    try {
      if (projectId) {
        await Project.findByIdAndUpdate(projectId, {
          status: 'failed',
          'buildInfo.logs': ['Build failed to start: ' + error.message]
        });
      }
    } catch (updateError) {
      console.error('Error updating project status after build failure:', updateError);
    }
    
    throw error;
  }
};

// Get build status
exports.getBuildStatus = async (buildId) => {
  try {
    return await unityService.getBuildStatus(buildId);
  } catch (error) {
    console.error('Error getting build status:', error);
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
    console.error('Error updating project:', error);
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
    console.error('Error deleting project:', error);
    throw error;
  }
};