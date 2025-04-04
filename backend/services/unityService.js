// backend/services/unityService.js
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs').promises;
const BuildJob = require('../models/BuildJob');
const Project = require('../models/Project');
const { createDirectoryIfNotExists } = require('../utils/fileUtils');

// Base directory for builds
const BUILDS_DIR = process.env.BUILDS_DIR || path.join(__dirname, '../../builds');
// Public URL for accessing builds
const BUILDS_URL = process.env.BUILDS_URL || 'http://localhost:5000/builds';

/**
 * Create a new Unity build job
 * @param {Object} buildConfig - Configuration for the build
 * @returns {Object} - Created build job
 */
exports.createBuildJob = async (buildConfig) => {
  try {
    console.log('Starting build job creation with config:', JSON.stringify(buildConfig, null, 2));
    
    // Generate unique build ID
    const buildId = uuidv4();
    console.log('Generated build ID:', buildId);
    
    // Create build directory
    const buildDir = path.join(BUILDS_DIR, buildId);
    console.log('Creating build directory at:', buildDir);
    await createDirectoryIfNotExists(buildDir);
    
    // Create build configuration file
    const configPath = path.join(buildDir, 'build-config.json');
    console.log('Writing build config to:', configPath);
    await fs.writeFile(configPath, JSON.stringify(buildConfig, null, 2));
    
    // Create build job
    console.log('Creating build job document in MongoDB');
    const buildJob = new BuildJob({
      id: buildId,
      projectId: buildConfig.projectId,
      status: 'queued',
      config: buildConfig,
      buildDirectory: buildDir,
      publicUrl: `${BUILDS_URL}/${buildId}`,
      estimatedTime: estimateBuildTime(buildConfig),
      logs: ['Build job created'],
      createdAt: new Date()
    });
    
    console.log('Saving build job');
    await buildJob.save();
    console.log('Build job saved successfully with ID:', buildId);
    
    return {
      id: buildJob.id,
      estimatedTime: buildJob.estimatedTime
    };
  } catch (error) {
    console.error('Error creating build job:', error);
    throw new Error(`Failed to create build job: ${error.message}`);
  }
};

/**
 * Queue a build job for processing
 * @param {Object} buildJob - The build job to queue
 */
exports.queueBuild = async (buildJob) => {
  try {
    console.log(`Queueing build job ${buildJob.id}`);
    
    // Update job status
    await BuildJob.findOneAndUpdate(
      { id: buildJob.id },
      { status: 'processing' }
    );
    
    // Process the build (simulated for now)
    await processBuild(buildJob.id);
  } catch (error) {
    console.error('Error queuing build:', error);
    
    try {
      await BuildJob.findOneAndUpdate(
        { id: buildJob.id }, 
        { 
          status: 'failed',
          error: error.message,
          logs: [...(await getBuildLogs(buildJob.id)), `Build failed: ${error.message}`]
        }
      );
      
      // Update project status
      await Project.findByIdAndUpdate(buildJob.projectId, { 
        status: 'failed',
        'buildInfo.logs': [...(await getProjectLogs(buildJob.projectId)), `Build failed: ${error.message}`]
      });
    } catch (updateErr) {
      console.error('Error updating build status after failure:', updateErr);
    }
  }
};

/**
 * Process a build job (mock implementation)
 * @param {string} buildId - ID of the build to process
 */
async function processBuild(buildId) {
  try {
    console.log(`Processing build ${buildId}...`);
    
    // Get build job
    const buildJob = await BuildJob.findOne({ id: buildId });
    if (!buildJob) {
      throw new Error('Build job not found');
    }
    
    // Update project status
    await Project.findByIdAndUpdate(buildJob.projectId, { 
      status: 'building',
      'buildInfo.logs': ['Build process started']
    });
    
    // Simulate build process
    console.log(`Simulating build process for ${buildId}`);
    // In production, you would call Unity CLI
    await new Promise(resolve => setTimeout(resolve, 5000)); // 5 seconds delay to simulate processing
    
    // Create mock build output
    const buildDir = buildJob.buildDirectory;
    const webglDir = path.join(buildDir, 'webgl');
    console.log(`Creating WebGL directory at ${webglDir}`);
    await createDirectoryIfNotExists(webglDir);
    await createDirectoryIfNotExists(path.join(webglDir, 'Build'));
    
    // Create mock Unity WebGL files
    console.log(`Creating mock Unity WebGL files in ${webglDir}`);
    await createMockUnityFiles(webglDir);
    
    // Update build job
    console.log(`Updating build job ${buildId} with completion info`);
    buildJob.status = 'completed';
    buildJob.completedAt = new Date();
    buildJob.buildUrl = `${buildJob.publicUrl}/webgl`;
    buildJob.logs = [...buildJob.logs, 'Build completed successfully'];
    await buildJob.save();
    
    // Update project
    console.log(`Updating project with completed build info`);
    await Project.findByIdAndUpdate(buildJob.projectId, { 
      status: 'preview',
      'buildInfo.buildUrl': buildJob.buildUrl,
      'buildInfo.previewUrl': buildJob.buildUrl,
      'buildInfo.logs': [...(await getProjectLogs(buildJob.projectId)), 'Build completed successfully']
    });
    
    console.log(`Build ${buildId} completed successfully`);
  } catch (error) {
    console.error(`Error processing build ${buildId}:`, error);
    
    // Update build job
    try {
      await BuildJob.findOneAndUpdate(
        { id: buildId }, 
        { 
          status: 'failed',
          error: error.message,
          completedAt: new Date(),
          logs: [...(await getBuildLogs(buildId)), `Build failed: ${error.message}`]
        }
      );
      
      // Get project ID
      const buildJob = await BuildJob.findOne({ id: buildId });
      if (buildJob && buildJob.projectId) {
        // Update project
        await Project.findByIdAndUpdate(buildJob.projectId, { 
          status: 'failed',
          'buildInfo.logs': [...(await getProjectLogs(buildJob.projectId)), `Build failed: ${error.message}`]
        });
      }
    } catch (updateErr) {
      console.error('Error updating status after build failure:', updateErr);
    }
    
    throw error;
  }
}

/**
 * Get build status
 * @param {string} buildId - ID of the build
 * @returns {Object} - Build status information
 */
exports.getBuildStatus = async (buildId) => {
  try {
    const buildJob = await BuildJob.findOne({ id: buildId });
    
    if (!buildJob) {
      throw new Error('Build job not found');
    }
    
    return {
      id: buildJob.id,
      status: buildJob.status,
      progress: calculateBuildProgress(buildJob),
      estimatedTime: buildJob.estimatedTime,
      startedAt: buildJob.createdAt,
      completedAt: buildJob.completedAt,
      buildUrl: buildJob.buildUrl,
      error: buildJob.error
    };
  } catch (error) {
    console.error('Error getting build status:', error);
    throw new Error(`Failed to get build status: ${error.message}`);
  }
};

/**
 * Get build logs
 * @param {string} buildId - Build ID
 * @returns {Array} - Array of log messages
 */
async function getBuildLogs(buildId) {
  try {
    const buildJob = await BuildJob.findOne({ id: buildId });
    return buildJob?.logs || [];
  } catch (error) {
    console.error('Error getting build logs:', error);
    return [];
  }
}

/**
 * Delete a build
 * @param {string} buildId - ID of the build to delete
 * @returns {boolean} - Success status
 */
exports.deleteBuild = async (buildId) => {
  try {
    const buildJob = await BuildJob.findOne({ id: buildId });
    
    if (!buildJob) {
      throw new Error('Build job not found');
    }
    
    // Delete build directory
    try {
      await fs.rmdir(buildJob.buildDirectory, { recursive: true });
    } catch (error) {
      console.error(`Error deleting build directory: ${error}`);
      // Continue even if directory deletion fails
    }
    
    // Delete build job
    await BuildJob.findOneAndDelete({ id: buildId });
    
    return true;
  } catch (error) {
    console.error('Error deleting build:', error);
    throw new Error(`Failed to delete build: ${error.message}`);
  }
};

/**
 * Estimate build time based on configuration
 * @param {Object} buildConfig - Build configuration
 * @returns {number} - Estimated time in seconds
 */
function estimateBuildTime(buildConfig) {
  // In a real implementation, this would be based on game complexity
  // For now, just return a fixed time
  return 30; // 30 seconds
}

/**
 * Calculate build progress percentage
 * @param {Object} buildJob - Build job information
 * @returns {number} - Progress percentage
 */
function calculateBuildProgress(buildJob) {
  if (buildJob.status === 'completed') {
    return 100;
  }
  
  if (buildJob.status === 'queued') {
    return 0;
  }
  
  if (buildJob.status === 'failed') {
    return 0;
  }
  
  // Calculate progress based on elapsed time vs estimated time
  const now = new Date();
  const elapsed = (now - buildJob.createdAt) / 1000; // in seconds
  const progress = Math.min(95, Math.floor((elapsed / buildJob.estimatedTime) * 100));
  
  return progress;
}

/**
 * Get project build logs
 * @param {string} projectId - Project ID
 * @returns {Array} - Array of log messages
 */
async function getProjectLogs(projectId) {
  try {
    const project = await Project.findById(projectId);
    return project.buildInfo?.logs || [];
  } catch (error) {
    console.error('Error getting project logs:', error);
    return [];
  }
}

/**
 * Create mock Unity WebGL files for development
 * @param {string} webglDir - WebGL directory
 */
async function createMockUnityFiles(webglDir) {
  try {
    const buildDir = path.join(webglDir, 'Build');
    
    // Create mock loader file
    const loaderJs = `
      function createUnityInstance(canvas, config, onProgress) {
        return new Promise((resolve, reject) => {
          // Mock Unity WebGL loader
          const interval = setInterval(() => {
            onProgress({
              progress: Math.min(1, window.mockProgress || 0)
            });
            window.mockProgress = (window.mockProgress || 0) + 0.1;
            
            if (window.mockProgress >= 1) {
              clearInterval(interval);
              resolve({
                SetFullscreen: function() { console.log('SetFullscreen called'); },
                SendMessage: function() { console.log('SendMessage called'); }
              });
            }
          }, 500);
        });
      }
    `;
    
    await fs.writeFile(path.join(buildDir, 'webgl.loader.js'), loaderJs);
    
    // Create mock Unity data file
    await fs.writeFile(path.join(buildDir, 'webgl.data'), 'MOCK_UNITY_DATA');
    
    // Create mock Unity framework file
    await fs.writeFile(path.join(buildDir, 'webgl.framework.js'), 'console.log("Unity WebGL Framework");');
    
    // Create mock Unity WebAssembly file
    await fs.writeFile(path.join(buildDir, 'webgl.wasm'), 'MOCK_WASM_BINARY');
    
    // Create a simple index.html for the WebGL build
    const indexHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <title>Unity WebGL Player</title>
        <script src="Build/webgl.loader.js"></script>
        <style>
          body { margin: 0; padding: 0; }
          #unity-container { width: 100%; height: 100vh; }
          #unity-canvas { width: 100%; height: 100%; background: #231F20; }
        </style>
      </head>
      <body>
        <div id="unity-container">
          <canvas id="unity-canvas"></canvas>
        </div>
        <script>
          var canvas = document.querySelector("#unity-canvas");
          var config = {
            dataUrl: "Build/webgl.data",
            frameworkUrl: "Build/webgl.framework.js",
            codeUrl: "Build/webgl.wasm",
            streamingAssetsUrl: "StreamingAssets",
            companyName: "AIGameGenerator",
            productName: "AI Game",
            productVersion: "1.0",
          };
          
          createUnityInstance(canvas, config, (progress) => {
            console.log('Loading progress: ' + Math.round(progress.progress * 100) + '%');
          }).then((unityInstance) => {
            window.unityInstance = unityInstance;
          }).catch((error) => {
            console.error('Error loading Unity WebGL build:', error);
          });
        </script>
      </body>
      </html>
    `;
    
    await fs.writeFile(path.join(webglDir, 'index.html'), indexHtml);
    console.log('Successfully created mock Unity files');
  } catch (error) {
    console.error('Error creating mock Unity files:', error);
    throw new Error(`Failed to create mock Unity files: ${error.message}`);
  }
}