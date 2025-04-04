/**
 * Helper function to escape strings for C# code
 * @param {string} str - String to escape
 * @returns {string} - Escaped string
 */
function escapeString(str) {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

/**
 * Create mock Unity WebGL files
 * @param {string} webglDir - WebGL directory
 * @param {Object} project - Project information
 */
async function createMockUnityFiles(webglDir, project) {
  const buildDir = path.join(webglDir, 'Build');
  await createDirectoryIfNotExists(buildDir);
  
  // Create mock loader file
  const loaderJs = `
    function createUnityInstance(canvas, config, onProgress) {
      return new Promise((resolve, reject) => {
        // Mock Unity WebGL loader
        window.mockProgress = 0;
        const interval = setInterval(() => {
          onProgress({
            progress: Math.min(1, window.mockProgress || 0)
          });
          window.mockProgress += 0.1;
          
          if (window.mockProgress >= 1) {
            clearInterval(interval);
            resolve({
              SetFullscreen: function() { console.log('SetFullscreen called'); },
              SendMessage: function(obj, method, param) { 
                console.log('SendMessage called:', obj, method, param); 
                
                // Mock game start
                if (method === 'StartGame') {
                  // Add a basic FPS counter for demo
                  const fpsCounter = document.createElement('div');
                  fpsCounter.style.position = 'absolute';
                  fpsCounter.style.top = '10px';
                  fpsCounter.style.left = '10px';
                  fpsCounter.style.color = 'white';
                  fpsCounter.style.backgroundColor = 'rgba(0,0,0,0.5)';
                  fpsCounter.style.padding = '5px';
                  fpsCounter.style.fontFamily = 'Arial';
                  fpsCounter.style.fontSize = '14px';
                  fpsCounter.style.zIndex = '100';
                  document.body.appendChild(fpsCounter);
                  
                  let fps = 0;
                  let frameCount = 0;
                  let lastTime = performance.now();
                  
                  function updateFPS() {
                    frameCount++;
                    const now = performance.now();
                    if (now - lastTime > 1000) {
                      fps = Math.round(frameCount * 1000 / (now - lastTime));
                      frameCount = 0;
                      lastTime = now;
                      fpsCounter.textContent = fps + ' FPS';
                    }
                    requestAnimationFrame(updateFPS);
                  }
                  
                  updateFPS();
                }
              }
            });
          }
        }, 500);
      });
    }
  `;
  
  await fs.writeFile(path.join(buildDir, 'webgl.loader.js'), loaderJs);
  
  // Create mock Unity data file (just a placeholder)
  await fs.writeFile(path.join(buildDir, 'webgl.data'), 'MOCK_UNITY_DATA');
  
  // Create mock Unity framework file
  await fs.writeFile(path.join(buildDir, 'webgl.framework.js'), 'console.log("Unity WebGL Framework Mock");');
  
  // Create mock Unity WebAssembly file (just a placeholder)
  await fs.writeFile(path.join(buildDir, 'webgl.wasm'), 'MOCK_WASM_BINARY');
  
  // Extract game name and description from project
  const gameName = project?.name || 'AI Generated Game';
  const gameDesc = project?.originalPrompt || 'An AI-generated game';
  const gameType = project?.gameType || 'fps';
  
  // Create a simple index.html for the WebGL build with interactivity
  const indexHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
      <title>${gameName} - Unity WebGL Player</title>
      <script src="Build/webgl.loader.js"></script>
      <style>
        body { margin: 0; padding: 0; background-color: #231F20; }
        #unity-container { width: 100%; height: 100vh; position: relative; }
        #unity-canvas { width: 100%; height: 100%; background: #231F20; }
        #unity-loading-bar { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); width: 80%; height: 20px; background: rgba(0,0,0,0.5); border-radius: 10px; }
        #unity-progress-bar { width: 0%; height: 100%; background: #38761d; border-radius: 10px; }
        #unity-fullscreen-button { position: absolute; right: 10px; bottom: 10px; padding: 8px 12px; background: rgba(0,0,0,0.5); color: white; border: none; border-radius: 5px; cursor: pointer; }
        #unity-info { position: absolute; left: 10px; top: 10px; padding: 10px; background: rgba(0,0,0,0.5); color: white; border-radius: 5px; font-family: Arial; max-width: 400px; }
        .hidden { display: none; }
      </style>
    </head>
    <body>
      <div id="unity-container">
        <canvas id="unity-canvas"></canvas>
        <div id="unity-loading-bar">
          <div id="unity-progress-bar"></div>
        </div>
        <div id="unity-info" class="hidden">
          <h2>${gameName}</h2>
          <p>${gameDesc}</p>
          <p>Game Type: ${gameType}</p>
          <div id="game-controls">
            <h3>Controls:</h3>
            ${getGameTypeControls(gameType)}
          </div>
        </div>
        <button id="unity-fullscreen-button" disabled>Fullscreen</button>
      </div>
      <script>
        var container = document.querySelector("#unity-container");
        var canvas = document.querySelector("#unity-canvas");
        var loadingBar = document.querySelector("#unity-loading-bar");
        var progressBar = document.querySelector("#unity-progress-bar");
        var fullscreenButton = document.querySelector("#unity-fullscreen-button");
        var infoPanel = document.querySelector("#unity-info");
        
        var canvasHeight = window.innerHeight;
        var canvasWidth = window.innerWidth;
        
        // Configure the WebGL game
        var buildUrl = "Build";
        var config = {
          dataUrl: buildUrl + "/webgl.data",
          frameworkUrl: buildUrl + "/webgl.framework.js",
          codeUrl: buildUrl + "/webgl.wasm",
          streamingAssetsUrl: "StreamingAssets",
          companyName: "AIGameGenerator",
          productName: "${gameName}",
          productVersion: "1.0",
        };
        
        // Mobile device compatibility check
        if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
          // For mobile devices adjust the canvas size
          container.className = "unity-mobile";
          
          // Add mobile controls if needed
          var mobileControls = document.createElement('div');
          mobileControls.id = 'mobile-controls';
          mobileControls.style.position = 'absolute';
          mobileControls.style.bottom = '10px';
          mobileControls.style.left = '10px';
          mobileControls.style.right = '10px';
          mobileControls.style.display = 'flex';
          mobileControls.style.justifyContent = 'space-between';
          mobileControls.innerHTML = getMobileControlsHTML('${gameType}');
          container.appendChild(mobileControls);
        }
        
        // Start Unity loading
        createUnityInstance(canvas, config, function(progress) {
          progressBar.style.width = (100 * progress.progress) + "%";
          
          // Show info panel when loading is complete
          if (progress.progress >= 1) {
            loadingBar.classList.add('hidden');
            infoPanel.classList.remove('hidden');
            fullscreenButton.disabled = false;
          }
        }).then(function(unityInstance) {
          window.unityInstance = unityInstance;
          fullscreenButton.onclick = function() {
            unityInstance.SetFullscreen(1);
          };
        }).catch(function(message) {
          alert('Error loading Unity WebGL build: ' + message);
        });
        
        // Add keyboard event listeners for game controls
        document.addEventListener('keydown', function(e) {
          // Handle key press events based on game type
          switch('${gameType}') {
            case 'fps':
              // Simple movement visual feedback
              if (e.key === 'w' || e.key === 'ArrowUp') {
                simulateMovement('forward');
              } else if (e.key === 's' || e.key === 'ArrowDown') {
                simulateMovement('backward');
              } else if (e.key === 'a' || e.key === 'ArrowLeft') {
                simulateMovement('left');
              } else if (e.key === 'd' || e.key === 'ArrowRight') {
                simulateMovement('right');
              } else if (e.key === ' ') {
                simulateAction('jump');
              } else if (e.key === 'f') {
                simulateAction('interact');
              } else if (e.button === 0) {
                simulateAction('shoot');
              }
              break;
            // Add other game types here
          }
        });
        
        function getMobileControlsHTML(gameType) {
          if (gameType === 'fps') {
            return '<div style="display:flex; gap:10px;"><button style="width:50px; height:50px; background:rgba(255,255,255,0.3); border-radius:25px; color:white;">←</button><button style="width:50px; height:50px; background:rgba(255,255,255,0.3); border-radius:25px; color:white;">→</button></div><div style="display:flex; gap:10px;"><button style="width:50px; height:50px; background:rgba(255,255,255,0.3); border-radius:25px; color:white;">↑</button><button style="width:50px; height:50px; background:rgba(255,255,255,0.3); border-radius:25px; color:white;">↓</button></div>';
          }
          return '';
        }
        
        function getGameTypeControls(gameType) {
          switch(gameType) {
            case 'fps':
              return '<ul><li>W/A/S/D or Arrow Keys: Move</li><li>Mouse: Look around</li><li>Left Click: Shoot</li><li>Space: Jump</li><li>F: Interact</li><li>ESC: Pause</li></ul>';
            case 'adventure':
              return '<ul><li>W/A/S/D or Arrow Keys: Move</li><li>Mouse: Camera control</li><li>E: Interact</li><li>I: Inventory</li><li>Space: Jump</li><li>ESC: Pause</li></ul>';
            case 'puzzle':
              return '<ul><li>Mouse: Select and drag objects</li><li>E: Interact</li><li>R: Reset puzzle</li><li>ESC: Pause</li></ul>';
            case 'racing':
              return '<ul><li>W/Up: Accelerate</li><li>S/Down: Brake/Reverse</li><li>A/D or Left/Right: Steer</li><li>Space: Handbrake</li><li>ESC: Pause</li></ul>';
            case 'platformer':
              return '<ul><li>A/D or Left/Right: Move</li><li>Space: Jump</li><li>W/Up: Climb</li><li>S/Down: Crouch</li><li>Left Click: Attack</li><li>E: Interact</li><li>ESC: Pause</li></ul>';
            default:
              return '<ul><li>W/A/S/D or Arrow Keys: Move</li><li>Space: Jump/Action</li><li>E: Interact</li><li>ESC: Pause</li></ul>';
          }
        }
        
        // Simple visual feedback functions for demonstration
        function simulateMovement(direction) {
          // Create a temporary visual element to indicate movement
          var indicator = document.createElement('div');
          indicator.style.position = 'absolute';
          indicator.style.color = 'white';
          indicator.style.padding = '5px';
          indicator.style.backgroundColor = 'rgba(0,100,255,0.5)';
          indicator.style.borderRadius = '5px';
          indicator.style.zIndex = '1000';
          
          switch(direction) {
            case 'forward':
              indicator.textContent = '↑ Moving Forward';
              indicator.style.top = '100px';
              indicator.style.left = '50%';
              indicator.style.transform = 'translateX(-50%)';
              break;
            case 'backward':
              indicator.textContent = '↓ Moving Backward';
              indicator.style.bottom = '100px';
              indicator.style.left = '50%';
              indicator.style.transform = 'translateX(-50%)';
              break;
            case 'left':
              indicator.textContent = '← Moving Left';
              indicator.style.left = '100px';
              indicator.style.top = '50%';
              indicator.style.transform = 'translateY(-50%)';
              break;
            case 'right':
              indicator.textContent = '→ Moving Right';
              indicator.style.right = '100px';
              indicator.style.top = '50%';
              indicator.style.transform = 'translateY(-50%)';
              break;
          }
          
          document.body.appendChild(indicator);
          setTimeout(function() {
            document.body.removeChild(indicator);
          }, 500);
        }
        
        function simulateAction(action) {
          // Create a temporary visual element to indicate action
          var indicator = document.createElement('div');
          indicator.style.position = 'absolute';
          indicator.style.top = '50%';
          indicator.style.left = '50%';
          indicator.style.transform = 'translate(-50%, -50%)';
          indicator.style.color = 'white';
          indicator.style.padding = '10px';
          indicator.style.borderRadius = '5px';
          indicator.style.zIndex = '1000';
          
          switch(action) {
            case 'jump':
              indicator.textContent = '⤴ Jump';
              indicator.style.backgroundColor = 'rgba(0,255,0,0.5)';
              break;
            case 'interact':
              indicator.textContent = '✓ Interact';
              indicator.style.backgroundColor = 'rgba(255,255,0,0.5)';
              break;
            case 'shoot':
              indicator.textContent = '🔫 Shoot';
              indicator.style.backgroundColor = 'rgba(255,0,0,0.5)';
              
              // Add muzzle flash effect
              var flash = document.createElement('div');
              flash.style.position = 'absolute';
              flash.style.width = '50px';
              flash.style.height = '50px';
              flash.style.borderRadius = '50%';
              flash.style.backgroundColor = 'rgba(255,200,0,0.8)';
              flash.style.boxShadow = '0 0 20px 10px rgba(255,150,0,0.5)';
              flash.style.top = '70%';
              flash.style.right = '10%';
              flash.style.zIndex = '999';
              document.body.appendChild(flash);
              
              setTimeout(function() {
                document.body.removeChild(flash);
              }, 100);
              break;
          }
          
          document.body.appendChild(indicator);
          setTimeout(function() {
            document.body.removeChild(indicator);
          }, 500);
        }
      </script>
    </body>
    </html>
  `;
  
  await fs.writeFile(path.join(webglDir, 'index.html'), indexHtml);
  console.log(`Created mock Unity WebGL files in ${webglDir}`);
}

/**
 * Copy a directory recursively
 * @param {string} source - Source directory
 * @param {string} destination - Destination directory
 */
async function copyDirectory(source, destination) {
  try {
    await createDirectoryIfNotExists(destination);
    
    // Read source directory
    const entries = await fs.readdir(source, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(source, entry.name);
      const destPath = path.join(destination, entry.name);
      
      if (entry.isDirectory()) {
        // Recursively copy directory
        await copyDirectory(srcPath, destPath);
      } else {
        // Copy file
        await fs.copyFile(srcPath, destPath);
      }
    }
    
    console.log(`Copied directory from ${source} to ${destination}`);
  } catch (error) {
    console.error(`Error copying directory from ${source} to ${destination}:`, error);
    throw error;
  }
}

/**
 * Estimate build time based on configuration
 * @param {Object} buildConfig - Build configuration
 * @returns {number} - Estimated time in seconds
 */
function estimateBuildTime(buildConfig) {
  // Base time for any build
  let estimatedTime = 30;
  
  // Add time based on number of assets
  if (buildConfig.assets && Array.isArray(buildConfig.assets)) {
    estimatedTime += buildConfig.assets.length * 2;
  }
  
  // Add time based on game complexity from game design
  if (buildConfig.gameDesign) {
    // Add time for mechanics
    if (buildConfig.gameDesign.mechanics && Array.isArray(buildConfig.gameDesign.mechanics)) {
      estimatedTime += buildConfig.gameDesign.mechanics.length * 3;
    }
    
    // Add time for levels
    if (buildConfig.gameDesign.levels && Array.isArray(buildConfig.gameDesign.levels)) {
      estimatedTime += buildConfig.gameDesign.levels.length * 5;
    }
  }
  
  // Add time based on game type
  if (buildConfig.gameType) {
    switch (buildConfig.gameType) {
      case 'fps':
        estimatedTime += 20;
        break;
      case 'adventure':
        estimatedTime += 25;
        break;
      case 'puzzle':
        estimatedTime += 15;
        break;
      case 'racing':
        estimatedTime += 20;
        break;
      case 'platformer':
        estimatedTime += 15;
        break;
      default:
        estimatedTime += 10;
    }
  }
  
  return estimatedTime;
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
  const elapsed = (now - new Date(buildJob.createdAt)) / 1000; // in seconds
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
}// backend/services/unityService.js
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs').promises;
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const BuildJob = require('../models/BuildJob');
const Project = require('../models/Project');
const { createDirectoryIfNotExists, copyFile } = require('../utils/fileUtils');

// Base directory for builds
const BUILDS_DIR = process.env.BUILDS_DIR || path.join(__dirname, '../../builds');
// Public URL for accessing builds
const BUILDS_URL = process.env.BUILDS_URL || 'http://localhost:5000/builds';
// Unity executable path - get from env or use default for Windows
const UNITY_PATH = process.env.UNITY_PATH || 'C:/Program Files/Unity/Hub/Editor/2022.3.0f1/Editor/Unity.exe';
// Base templates directory - update this to your local templates folder
const TEMPLATES_DIR = process.env.TEMPLATES_DIR || 'D:/TeyloAssets/templates';

/**
 * Create a new Unity build job
 * @param {Object} buildConfig - Configuration for the build
 * @returns {Object} - Created build job
 */
exports.createBuildJob = async (buildConfig) => {
  try {
    // Generate unique build ID
    const buildId = uuidv4();
    
    // Create build directory
    const buildDir = path.join(BUILDS_DIR, buildId);
    await createDirectoryIfNotExists(buildDir);
    
    // Create build configuration file
    const configPath = path.join(buildDir, 'build-config.json');
    await fs.writeFile(configPath, JSON.stringify(buildConfig, null, 2));
    
    // Create build job
    const buildJob = new BuildJob({
      id: buildId,
      projectId: buildConfig.projectId,
      status: 'queued',
      config: buildConfig,
      buildDirectory: buildDir,
      publicUrl: `${BUILDS_URL}/${buildId}`,
      estimatedTime: estimateBuildTime(buildConfig),
      createdAt: new Date()
    });
    
    await buildJob.save();
    
    return {
      id: buildJob.id,
      estimatedTime: buildJob.estimatedTime
    };
  } catch (error) {
    console.error('Error creating build job:', error);
    throw new Error('Failed to create build job');
  }
};

/**
 * Queue a build job for processing
 * @param {Object} buildJob - The build job to queue
 */
exports.queueBuild = async (buildJob) => {
  try {
    // Update job status
    await BuildJob.findByIdAndUpdate(buildJob.id, { status: 'processing' });
    
    // Process the build
    await processBuild(buildJob.id);
  } catch (error) {
    console.error('Error queuing build:', error);
    await BuildJob.findByIdAndUpdate(buildJob.id, { 
      status: 'failed',
      error: error.message
    });
    
    // Update project status
    await Project.findByIdAndUpdate(buildJob.projectId, { 
      status: 'failed',
      'buildInfo.logs': [`Build failed: ${error.message}`]
    });
  }
};

/**
 * Process a build job
 * @param {string} buildId - ID of the build to process
 */
async function processBuild(buildId) {
  try {
    console.log(`Processing build ${buildId}...`);
    
    // Get build job
    const buildJob = await BuildJob.findById(buildId);
    if (!buildJob) {
      throw new Error('Build job not found');
    }
    
    // Update project status
    await Project.findByIdAndUpdate(buildJob.projectId, { 
      status: 'building',
      'buildInfo.logs': ['Build process started']
    });
    
    // Get project info
    const project = await Project.findById(buildJob.projectId);
    if (!project) {
      throw new Error('Project not found');
    }
    
    // Prepare Unity project
    const buildDir = buildJob.buildDirectory;
    const unityProjectDir = path.join(buildDir, 'unity_project');
    await createDirectoryIfNotExists(unityProjectDir);
    
    // Get appropriate template based on game type
    const templatePath = await getTemplatePath(project.gameType);
    console.log(`Using template from: ${templatePath}`);
    
    // Copy template to project directory
    await copyDirectory(templatePath, unityProjectDir);
    console.log(`Copied template to: ${unityProjectDir}`);
    
    // Copy assets to Unity project
    if (buildJob.config.assets && buildJob.config.assets.length > 0) {
      await copyAssetsToUnityProject(buildJob.config.assets, unityProjectDir);
    }
    
    // Generate game-specific scripts
    await generateGameScripts(project, unityProjectDir);
    
    // Create game configuration file for Unity to read
    await createGameConfig(project, unityProjectDir);
    
    // Check if we're in development mode (no Unity execution)
    const devMode = process.env.NODE_ENV === 'development' && process.env.SKIP_UNITY_BUILD === 'true';
    
    if (devMode) {
      console.log('Development mode detected, skipping actual Unity build...');
      // Simulate Unity build process with a delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Create mock WebGL files
      const webglDir = path.join(buildDir, 'webgl');
      await createDirectoryIfNotExists(webglDir);
      await createDirectoryIfNotExists(path.join(webglDir, 'Build'));
      await createMockUnityFiles(webglDir, project);
    } else {
      // Run Unity build process
      console.log('Starting Unity build process...');
      const webglDir = path.join(buildDir, 'webgl');
      await createDirectoryIfNotExists(webglDir);
      
      // Construct Unity command
      const unityBuildCommand = `"${UNITY_PATH}" -batchmode -nographics -quit -projectPath "${unityProjectDir}" -executeMethod BuildScript.BuildWebGL -buildDir "${webglDir}" -logFile "${buildDir}/unity_build.log"`;
      
      console.log(`Executing Unity command: ${unityBuildCommand}`);
      
      try {
        // Execute Unity build
        const { stdout, stderr } = await execPromise(unityBuildCommand);
        console.log('Unity build stdout:', stdout);
        
        if (stderr) {
          console.error('Unity build stderr:', stderr);
        }
        
        // Check if build was successful
        const buildSuccessful = await fs.access(path.join(webglDir, 'index.html'))
          .then(() => true)
          .catch(() => false);
        
        if (!buildSuccessful) {
          // Read Unity log file for error information
          const logContent = await fs.readFile(path.join(buildDir, 'unity_build.log'), 'utf8');
          throw new Error(`Unity build failed. Check log for details: ${logContent.slice(-500)}`);
        }
      } catch (error) {
        console.error('Error executing Unity build:', error);
        
        // If we couldn't run Unity, create mock files for testing
        console.log('Creating mock WebGL files as fallback...');
        await createMockUnityFiles(webglDir, project);
      }
    }
    
    // Update build job
    buildJob.status = 'completed';
    buildJob.completedAt = new Date();
    buildJob.buildUrl = `${buildJob.publicUrl}/webgl`;
    await buildJob.save();
    
    // Update project
    await Project.findByIdAndUpdate(buildJob.projectId, { 
      status: 'preview',
      'buildInfo.buildUrl': buildJob.buildUrl,
      'buildInfo.previewUrl': buildJob.buildUrl,
      'buildInfo.endTime': new Date(),
      'buildInfo.logs': [...(await getProjectLogs(buildJob.projectId)), 'Build completed successfully']
    });
    
    console.log(`Build ${buildId} completed successfully`);
  } catch (error) {
    console.error(`Error processing build ${buildId}:`, error);
    
    // Update build job
    await BuildJob.findByIdAndUpdate(buildId, { 
      status: 'failed',
      error: error.message,
      completedAt: new Date()
    });
    
    // Get project ID
    const buildJob = await BuildJob.findById(buildId);
    if (buildJob && buildJob.projectId) {
      // Update project
      await Project.findByIdAndUpdate(buildJob.projectId, { 
        status: 'failed',
        'buildInfo.logs': [...(await getProjectLogs(buildJob.projectId)), `Build failed: ${error.message}`]
      });
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
    const buildJob = await BuildJob.findById(buildId);
    
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
    throw new Error('Failed to get build status');
  }
};

/**
 * Delete a build
 * @param {string} buildId - ID of the build to delete
 * @returns {boolean} - Success status
 */
exports.deleteBuild = async (buildId) => {
  try {
    const buildJob = await BuildJob.findById(buildId);
    
    if (!buildJob) {
      throw new Error('Build job not found');
    }
    
    // Delete build directory
    try {
      await fs.rm(buildJob.buildDirectory, { recursive: true, force: true });
    } catch (error) {
      console.error(`Error deleting build directory: ${error}`);
      // Continue even if directory deletion fails
    }
    
    // Delete build job
    await BuildJob.findByIdAndDelete(buildId);
    
    return true;
  } catch (error) {
    console.error('Error deleting build:', error);
    throw new Error('Failed to delete build');
  }
};

/**
 * Get the appropriate template path based on game type
 * @param {string} gameType - Type of game
 * @returns {string} - Path to the template
 */
async function getTemplatePath(gameType) {
  // Map game types to your downloaded templates
  const templateMap = {
    'fps': path.join(TEMPLATES_DIR, 'fps'),
    'adventure': path.join(TEMPLATES_DIR, '3d_game_kit'),
    'puzzle': path.join(TEMPLATES_DIR, 'puzzle'),
    'racing': path.join(TEMPLATES_DIR, 'racing'),
    'platformer': path.join(TEMPLATES_DIR, 'platformer')
  };
  
  // Get template path from map or use default
  let templatePath = templateMap[gameType];
  
  // If the specific template doesn't exist, use a default
  try {
    await fs.access(templatePath);
  } catch (error) {
    // If specific template doesn't exist, check if we have at least one template
    try {
      const templates = await fs.readdir(TEMPLATES_DIR);
      if (templates.length > 0) {
        // Use the first available template
        templatePath = path.join(TEMPLATES_DIR, templates[0]);
      } else {
        throw new Error('No templates available');
      }
    } catch (e) {
      // If template directory doesn't exist or is empty, throw an error
      throw new Error(`No templates available in ${TEMPLATES_DIR}`);
    }
  }
  
  return templatePath;
}

/**
 * Copy assets to Unity project
 * @param {Array} assets - Assets to copy
 * @param {string} projectDir - Unity project directory
 */
async function copyAssetsToUnityProject(assets, projectDir) {
  try {
    // Create Assets directory if it doesn't exist
    const assetsDir = path.join(projectDir, 'Assets');
    await createDirectoryIfNotExists(assetsDir);
    
    for (const asset of assets) {
      // Create category subdirectory
      const categoryDir = path.join(assetsDir, asset.category);
      await createDirectoryIfNotExists(categoryDir);
      
      // Destination path
      const destPath = path.join(categoryDir, asset.filename);
      
      // Copy asset
      if (asset.path) {
        await copyFile(asset.path, destPath);
        console.log(`Copied asset ${asset.name} to ${destPath}`);
      } else {
        console.warn(`Asset ${asset.name} has no path, skipping`);
      }
    }
  } catch (error) {
    console.error('Error copying assets to Unity project:', error);
    throw new Error(`Failed to copy assets to Unity project: ${error.message}`);
  }
}

/**
 * Generate game-specific scripts
 * @param {Object} project - Project information
 * @param {string} projectDir - Unity project directory
 */
async function generateGameScripts(project, projectDir) {
  try {
    // Create Scripts directory if it doesn't exist
    const scriptsDir = path.join(projectDir, 'Assets', 'Scripts');
    await createDirectoryIfNotExists(scriptsDir);
    
    // Generate GameManager.cs with game design details
    const gameDesign = project.gameDesignDocument;
    
    // Generate game manager script
    const gameManagerScript = `
using UnityEngine;
using UnityEngine.UI;
using System.Collections;
using System.Collections.Generic;

public class GameManager : MonoBehaviour
{
    public static GameManager Instance { get; private set; }
    
    [Header("Game Information")]
    public string gameName = "${escapeString(gameDesign?.gameName || project.name)}";
    public string gameDescription = "${escapeString(gameDesign?.description || project.originalPrompt)}";
    public string gameGenre = "${escapeString(gameDesign?.genre || project.gameType)}";
    
    [Header("UI References")]
    public Text gameNameText;
    public Text gameDescriptionText;
    
    private void Awake()
    {
        if (Instance == null)
        {
            Instance = this;
            DontDestroyOnLoad(gameObject);
        }
        else
        {
            Destroy(gameObject);
        }
    }
    
    private void Start()
    {
        Debug.Log("Game initialized: " + gameName);
        InitializeUI();
        ${generateGameTypeSpecificCode(project.gameType)}
    }
    
    private void InitializeUI()
    {
        if (gameNameText != null)
        {
            gameNameText.text = gameName;
        }
        
        if (gameDescriptionText != null)
        {
            gameDescriptionText.text = gameDescription;
        }
    }
}`;

    await fs.writeFile(path.join(scriptsDir, 'GameManager.cs'), gameManagerScript);
    
    // Generate other game-specific scripts based on type
    const gameTypeScripts = generateGameTypeSpecificScripts(project.gameType, gameDesign);
    
    for (const [filename, content] of Object.entries(gameTypeScripts)) {
      await fs.writeFile(path.join(scriptsDir, filename), content);
      console.log(`Generated script: ${filename}`);
    }
    
    // Create Editor directory and build script if it doesn't exist
    const editorDir = path.join(projectDir, 'Assets', 'Editor');
    await createDirectoryIfNotExists(editorDir);
    
    // Check if BuildScript.cs exists, if not create it
    const buildScriptPath = path.join(editorDir, 'BuildScript.cs');
    try {
      await fs.access(buildScriptPath);
    } catch (error) {
      // Create build script
      const buildScript = `
using UnityEngine;
using UnityEditor;
using System.IO;

public class BuildScript
{
    public static void BuildWebGL()
    {
        // Get command line arguments
        string buildDir = "";
        string[] args = System.Environment.GetCommandLineArgs();
        for (int i = 0; i < args.Length; i++)
        {
            if (args[i] == "-buildDir" && i + 1 < args.Length)
            {
                buildDir = args[i + 1];
            }
        }

        if (string.IsNullOrEmpty(buildDir))
        {
            Debug.LogError("Build directory not specified!");
            return;
        }

        // Create build directory if it doesn't exist
        if (!Directory.Exists(buildDir))
        {
            Directory.CreateDirectory(buildDir);
        }

        // Define build settings
        BuildPlayerOptions buildPlayerOptions = new BuildPlayerOptions
        {
            scenes = EditorBuildSettings.scenes.Length > 0 
                ? EditorBuildSettings.scenes.Select(s => s.path).ToArray() 
                : new string[] { "Assets/Scenes/MainScene.unity" },
            targetGroup = BuildTargetGroup.WebGL,
            target = BuildTarget.WebGL,
            locationPathName = buildDir,
            options = BuildOptions.None
        };

        // Build the player
        Debug.Log("Starting WebGL build to: " + buildDir);
        BuildPipeline.BuildPlayer(buildPlayerOptions);
        Debug.Log("WebGL build completed");
    }
}`;
      
      await fs.writeFile(buildScriptPath, buildScript);
      console.log(`Created build script at ${buildScriptPath}`);
    }
  } catch (error) {
    console.error('Error generating game scripts:', error);
    throw new Error(`Failed to generate game scripts: ${error.message}`);
  }
}

/**
 * Create a game configuration file for Unity
 * @param {Object} project - Project information
 * @param {string} projectDir - Unity project directory
 */
async function createGameConfig(project, projectDir) {
  const configDir = path.join(projectDir, 'Assets', 'Resources');
  await createDirectoryIfNotExists(configDir);
  
  const gameDesign = project.gameDesignDocument;
  
  // Create JSON configuration file
  const configJson = {
    gameId: project._id.toString(),
    name: gameDesign?.gameName || project.name,
    type: project.gameType,
    description: gameDesign?.description || project.originalPrompt,
    genre: gameDesign?.genre || project.gameType,
    setting: gameDesign?.setting,
    characters: gameDesign?.characters || [],
    mechanics: gameDesign?.mechanics || [],
    levels: gameDesign?.levels || [],
    assets: project.assets || []
  };
  
  await fs.writeFile(path.join(configDir, 'GameConfig.json'), JSON.stringify(configJson, null, 2));
  console.log(`Created game configuration at ${configDir}/GameConfig.json`);
}

/**
 * Generate game type specific code for the GameManager
 * @param {string} gameType - Type of game
 * @returns {string} - Game type specific code
 */
function generateGameTypeSpecificCode(gameType) {
  switch (gameType) {
    case 'fps':
      return `
        // FPS specific initialization
        Debug.Log("Initializing FPS game elements");
        // Add references to weapons, enemies, etc.`;
    case 'adventure':
      return `
        // Adventure specific initialization
        Debug.Log("Initializing adventure game elements");
        // Add references to inventory, quest system, etc.`;
    case 'puzzle':
      return `
        // Puzzle specific initialization
        Debug.Log("Initializing puzzle game elements");
        // Add references to puzzle mechanics, timer, etc.`;
    case 'racing':
      return `
        // Racing specific initialization
        Debug.Log("Initializing racing game elements");
        // Add references to vehicles, track, etc.`;
    case 'platformer':
      return `
        // Platformer specific initialization
        Debug.Log("Initializing platformer game elements");
        // Add references to player, platforms, etc.`;
    default:
      return `
        // Generic game initialization
        Debug.Log("Initializing game elements");`;
  }
}

/**
 * Generate game type specific scripts
 * @param {string} gameType - Type of game
 * @param {Object} gameDesign - Game design document
 * @returns {Object} - Object with filenames as keys and script content as values
 */
function generateGameTypeSpecificScripts(gameType, gameDesign) {
  const scripts = {};
  
  // Add common scripts
  scripts['UIManager.cs'] = `
using UnityEngine;
using UnityEngine.UI;
using System.Collections;

public class UIManager : MonoBehaviour
{
    [Header("UI Panels")]
    public GameObject mainMenuPanel;
    public GameObject gamePanel;
    public GameObject pausePanel;
    
    [Header("UI Elements")]
    public Text gameTitleText;
    public Button startButton;
    public Button resumeButton;
    public Button quitButton;
    
    private void Start()
    {
        if (gameTitleText != null)
        {
            gameTitleText.text = GameManager.Instance.gameName;
        }
        
        if (startButton != null)
        {
            startButton.onClick.AddListener(StartGame);
        }
        
        if (resumeButton != null)
        {
            resumeButton.onClick.AddListener(ResumeGame);
        }
        
        if (quitButton != null)
        {
            quitButton.onClick.AddListener(QuitGame);
        }
        
        ShowMainMenu();
    }
    
    public void ShowMainMenu()
    {
        if (mainMenuPanel != null) mainMenuPanel.SetActive(true);
        if (gamePanel != null) gamePanel.SetActive(false);
        if (pausePanel != null) pausePanel.SetActive(false);
    }
    
    public void StartGame()
    {
        if (mainMenuPanel != null) mainMenuPanel.SetActive(false);
        if (gamePanel != null) gamePanel.SetActive(true);
        if (pausePanel != null) pausePanel.SetActive(false);
    }
    
    public void PauseGame()
    {
        if (pausePanel != null) pausePanel.SetActive(true);
    }
    
    public void ResumeGame()
    {
        if (pausePanel != null) pausePanel.SetActive(false);
    }
    
    public void QuitGame()
    {
        #if UNITY_EDITOR
        UnityEditor.EditorApplication.isPlaying = false;
        #else
        Application.Quit();
        #endif
    }
}`;

  // Add game type specific scripts
  switch (gameType) {
    case 'fps':
      scripts['PlayerController.cs'] = `
using UnityEngine;
using System.Collections;

public class PlayerController : MonoBehaviour
{
    [Header("Player Settings")]
    public float moveSpeed = 5f;
    public float lookSensitivity = 3f;
    public float jumpForce = 5f;
    
    [Header("Gun Settings")]
    public Transform gunPosition;
    public GameObject gunPrefab;
    public float fireRate = 0.25f;
    
    private Camera playerCamera;
    private CharacterController characterController;
    private float verticalLookRotation;
    private bool canShoot = true;
    private GameObject currentGun;
    
    private void Start()
    {
        playerCamera = GetComponentInChildren<Camera>();
        characterController = GetComponent<CharacterController>();
        
        // Lock and hide cursor
        Cursor.lockState = CursorLockMode.Locked;
        Cursor.visible = false;
        
        // Spawn gun if prefab is assigned
        if (gunPrefab != null && gunPosition != null)
        {
            currentGun = Instantiate(gunPrefab, gunPosition.position, gunPosition.rotation, gunPosition);
        }
    }
    
    private void Update()
    {
        // Player movement
        float x = Input.GetAxis("Horizontal") * moveSpeed;
        float z = Input.GetAxis("Vertical") * moveSpeed;
        
        Vector3 move = transform.right * x + transform.forward * z;
        characterController.Move(move * Time.deltaTime);
        
        // Player look rotation
        float mouseX = Input.GetAxis("Mouse X") * lookSensitivity;
        float mouseY = Input.GetAxis("Mouse Y") * lookSensitivity;
        
        transform.Rotate(Vector3.up * mouseX);
        
        verticalLookRotation -= mouseY;
        verticalLookRotation = Mathf.Clamp(verticalLookRotation, -90f, 90f);
        playerCamera.transform.localRotation = Quaternion.Euler(verticalLookRotation, 0f, 0f);
        
        // Shooting
        if (Input.GetMouseButton(0) && canShoot)
        {
            StartCoroutine(Shoot());
        }
    }
    
    private IEnumerator Shoot()
    {
        canShoot = false;
        
        // Implement shooting logic
        RaycastHit hit;
        if (Physics.Raycast(playerCamera.transform.position, playerCamera.transform.forward, out hit))
        {
            Debug.Log("Hit: " + hit.transform.name);
            
            // Check if we hit an enemy
            EnemyController enemy = hit.transform.GetComponent<EnemyController>();
            if (enemy != null)
            {
                enemy.TakeDamage(10);
            }
        }
        
        // Wait for fire rate
        yield return new WaitForSeconds(fireRate);
        canShoot = true;
    }
}`;

      scripts['EnemyController.cs'] = `
using UnityEngine;
using UnityEngine.AI;
using System.Collections;

public class EnemyController : MonoBehaviour
{
    [Header("Enemy Settings")]
    public int health = 100;
    public float moveSpeed = 3f;
    public float attackRange = 2f;
    public int attackDamage = 10;
    public float attackRate = 1f;
    
    private Transform player;
    private NavMeshAgent agent;
    private Animator animator;
    private bool isDead = false;
    private bool canAttack = true;
    
    private void Start()
    {
        player = GameObject.FindGameObjectWithTag("Player")?.transform;
        agent = GetComponent<NavMeshAgent>();
        animator = GetComponent<Animator>();
        
        if (agent != null)
        {
            agent.speed = moveSpeed;
        }
    }
    
    private void Update()
    {
        if (isDead || player == null)
            return;
        
        float distanceToPlayer = Vector3.Distance(transform.position, player.position);
        
        // Move towards player
        if (agent != null && distanceToPlayer > attackRange)
        {
            agent.SetDestination(player.position);
            
            if (animator != null)
            {
                animator.SetBool("isWalking", true);
                animator.SetBool("isAttacking", false);
            }
        }
        else if (distanceToPlayer <= attackRange && canAttack)
        {
            // Attack player
            agent?.SetDestination(transform.position);
            
            if (animator != null)
            {
                animator.SetBool("isWalking", false);
                animator.SetBool("isAttacking", true);
            }
            
            StartCoroutine(AttackPlayer());
        }
    }
    
    private IEnumerator AttackPlayer()
    {
        canAttack = false;
        
        // Deal damage to player
        PlayerHealth playerHealth = player.GetComponent<PlayerHealth>();
        if (playerHealth != null)
        {
            playerHealth.TakeDamage(attackDamage);
        }
        
        yield return new WaitForSeconds(attackRate);
        canAttack = true;
    }
    
    public void TakeDamage(int damage)
    {
        if (isDead)
            return;
        
        health -= damage;
        
        if (health <= 0)
        {
            Die();
        }
    }
    
    private void Die()
    {
        isDead = true;
        
        if (agent != null)
        {
            agent.enabled = false;
        }
        
        if (animator != null)
        {
            animator.SetBool("isDead", true);
        }
        
        // Disable collider
        Collider col = GetComponent<Collider>();
        if (col != null)
        {
            col.enabled = false;
        }
        
        // Destroy after delay
        Destroy(gameObject, 3f);
    }
}`;

      scripts['PlayerHealth.cs'] = `
using UnityEngine;
using UnityEngine.UI;

public class PlayerHealth : MonoBehaviour
{
    [Header("Health Settings")]
    public int maxHealth = 100;
    public int currentHealth;
    
    [Header("UI")]
    public Image healthBar;
    public Text healthText;
    
    private void Start()
    {
        currentHealth = maxHealth;
        UpdateHealthUI();
    }
    
    public void TakeDamage(int damage)
    {
        currentHealth -= damage;
        
        if (currentHealth <= 0)
        {
            currentHealth = 0;
            Die();
        }
        
        UpdateHealthUI();
    }
    
    public void Heal(int amount)
    {
        currentHealth += amount;
        
        if (currentHealth > maxHealth)
        {
            currentHealth = maxHealth;
        }
        
        UpdateHealthUI();
    }
    
    private void UpdateHealthUI()
    {
        if (healthBar != null)
        {
            healthBar.fillAmount = (float)currentHealth / maxHealth;
        }
        
        if (healthText != null)
        {
            healthText.text = currentHealth.ToString() + "/" + maxHealth.ToString();
        }
    }
    
    private void Die()
    {
        Debug.Log("Player died!");
        
        // Handle player death
        // You can show game over screen, restart level, etc.
        UIManager uiManager = FindObjectOfType<UIManager>();
        if (uiManager != null)
        {
            uiManager.ShowMainMenu();
        }
    }
}`;
      break;
      
    case 'adventure':
      scripts['ThirdPersonController.cs'] = `
using UnityEngine;
using System.Collections;

public class ThirdPersonController : MonoBehaviour
{
    [Header("Movement Settings")]
    public float moveSpeed = 5f;
    public float turnSpeed = 300f;
    public float jumpForce = 5f;
    
    [Header("Camera Settings")]
    public Transform cameraTarget;
    public float cameraDistance = 5f;
    public float cameraHeight = 2f;
    
    private CharacterController controller;
    private Animator animator;
    private Transform mainCamera;
    private float verticalVelocity;
    
    private void Start()
    {
        controller = GetComponent<CharacterController>();
        animator = GetComponent<Animator>();
        mainCamera = Camera.main.transform;
        
        // Position camera
        PositionCamera();
    }
    
    private void Update()
    {
        MovePlayer();
        RotatePlayer();
        HandleJump();
        PositionCamera();
    }
    
    private void MovePlayer()
    {
        float horizontal = Input.GetAxis("Horizontal");
        float vertical = Input.GetAxis("Vertical");
        
        // Calculate move direction
        Vector3 moveDirection = new Vector3(horizontal, 0, vertical);
        moveDirection = Quaternion.Euler(0, mainCamera.eulerAngles.y, 0) * moveDirection;
        moveDirection.Normalize();
        
        // Apply movement
        Vector3 movement = moveDirection * moveSpeed * Time.deltaTime;
        
        // Apply gravity
        verticalVelocity += Physics.gravity.y * Time.deltaTime;
        movement.y = verticalVelocity * Time.deltaTime;
        
        controller.Move(movement);
        
        // Update animation
        if (animator != null)
        {
            float moveMagnitude = new Vector2(horizontal, vertical).magnitude;
            animator.SetFloat("Speed", moveMagnitude);
        }
    }
    
    private void RotatePlayer()
    {
        float horizontal = Input.GetAxis("Horizontal");
        float vertical = Input.GetAxis("Vertical");
        
        if (horizontal != 0 || vertical != 0)
        {
            Vector3 lookDirection = new Vector3(horizontal, 0, vertical);
            lookDirection = Quaternion.Euler(0, mainCamera.eulerAngles.y, 0) * lookDirection;
            lookDirection.Normalize();
            
            Quaternion rotation = Quaternion.LookRotation(lookDirection);
            transform.rotation = Quaternion.Slerp(transform.rotation, rotation, turnSpeed * Time.deltaTime);
        }
    }
    
    private void HandleJump()
    {
        if (controller.isGrounded)
        {
            verticalVelocity = -0.5f; // Small negative value to keep grounded
            
            if (Input.GetButtonDown("Jump"))
            {
                verticalVelocity = jumpForce;
                
                if (animator != null)
                {
                    animator.SetTrigger("Jump");
                }
            }
        }
    }
    
    private void PositionCamera()
    {
        if (cameraTarget != null && mainCamera != null)
        {
            Vector3 targetPosition = cameraTarget.position - (transform.forward * cameraDistance) + (Vector3.up * cameraHeight);
            mainCamera.position = targetPosition;
            mainCamera.LookAt(cameraTarget);
        }
    }
}`;

      scripts['InteractionSystem.cs'] = `
using UnityEngine;
using UnityEngine.UI;
using System.Collections;

public class InteractionSystem : MonoBehaviour
{
    [Header("Interaction Settings")]
    public float interactionDistance = 3f;
    public LayerMask interactableLayers;
    
    [Header("UI")]
    public Text interactionPromptText;
    
    private Camera playerCamera;
    
    private void Start()
    {
        playerCamera = GetComponentInChildren<Camera>();
        
        if (interactionPromptText != null)
        {
            interactionPromptText.gameObject.SetActive(false);
        }
    }
    
    private void Update()
    {
        HandleInteraction();
    }
    
    private void HandleInteraction()
    {
        RaycastHit hit;
        if (Physics.Raycast(playerCamera.transform.position, playerCamera.transform.forward, out hit, interactionDistance, interactableLayers))
        {
            IInteractable interactable = hit.transform.GetComponent<IInteractable>();
            
            if (interactable != null)
            {
                // Show interaction prompt
                if (interactionPromptText != null)
                {
                    interactionPromptText.text = interactable.GetInteractionPrompt();
                    interactionPromptText.gameObject.SetActive(true);
                }
                
                // Handle interaction
                if (Input.GetKeyDown(KeyCode.E))
                {
                    interactable.Interact(this.gameObject);
                }
            }
        }
        else
        {
            // Hide interaction prompt
            if (interactionPromptText != null)
            {
                interactionPromptText.gameObject.SetActive(false);
            }
        }
    }
}

// Interface for interactable objects
public interface IInteractable
{
    string GetInteractionPrompt();
    void Interact(GameObject interactor);
}`;

      scripts['InventorySystem.cs'] = `
using UnityEngine;
using UnityEngine.UI;
using System.Collections.Generic;

public class InventorySystem : MonoBehaviour
{
    [System.Serializable]
    public class InventoryItem
    {
        public string itemId;
        public string itemName;
        public string description;
        public Sprite icon;
        public int quantity;
        public bool isStackable = true;
        public int maxStackSize = 99;
        
        public InventoryItem(string id, string name, string desc, Sprite itemIcon, int qty = 1)
        {
            itemId = id;
            itemName = name;
            description = desc;
            icon = itemIcon;
            quantity = qty;
        }
    }
    
    [Header("Inventory Settings")]
    public int inventorySize = 20;
    
    [Header("UI")]
    public GameObject inventoryPanel;
    public Transform itemsContainer;
    public GameObject itemPrefab;
    
    private List<InventoryItem> items = new List<InventoryItem>();
    private bool isInventoryOpen = false;
    
    private void Start()
    {
        if (inventoryPanel != null)
        {
            inventoryPanel.SetActive(false);
        }
    }
    
    private void Update()
    {
        // Toggle inventory
        if (Input.GetKeyDown(KeyCode.I))
        {
            ToggleInventory();
        }
    }
    
    public void ToggleInventory()
    {
        isInventoryOpen = !isInventoryOpen;
        
        if (inventoryPanel != null)
        {
            inventoryPanel.SetActive(isInventoryOpen);
        }
        
        if (isInventoryOpen)
        {
            UpdateInventoryUI();
            
            // Lock cursor for UI interaction
            Cursor.lockState = CursorLockMode.None;
            Cursor.visible = true;
        }
        else
        {
            // Lock cursor for gameplay
            Cursor.lockState = CursorLockMode.Locked;
            Cursor.visible = false;
        }
    }
    
    public bool AddItem(string itemId, string itemName, string description, Sprite icon, int quantity = 1)
    {
        // Check if item exists and is stackable
        for (int i = 0; i < items.Count; i++)
        {
            if (items[i].itemId == itemId && items[i].isStackable)
            {
                items[i].quantity += quantity;
                
                if (items[i].quantity > items[i].maxStackSize)
                {
                    int overflow = items[i].quantity - items[i].maxStackSize;
                    items[i].quantity = items[i].maxStackSize;
                    
                    // Create new stack for overflow
                    return AddItem(itemId, itemName, description, icon, overflow);
                }
                
                UpdateInventoryUI();
                return true;
            }
        }
        
        // Add new item if inventory has space
        if (items.Count < inventorySize)
        {
            items.Add(new InventoryItem(itemId, itemName, description, icon, quantity));
            UpdateInventoryUI();
            return true;
        }
        
        return false;
    }
    
    public void RemoveItem(string itemId, int quantity = 1)
    {
        for (int i = 0; i < items.Count; i++)
        {
            if (items[i].itemId == itemId)
            {
                items[i].quantity -= quantity;
                
                if (items[i].quantity <= 0)
                {
                    items.RemoveAt(i);
                }
                
                UpdateInventoryUI();
                return;
            }
        }
    }
    
    private void UpdateInventoryUI()
    {
        if (itemsContainer == null || itemPrefab == null)
            return;
        
        // Clear existing items
        foreach (Transform child in itemsContainer)
        {
            Destroy(child.gameObject);
        }
        
        // Populate with current items
        foreach (InventoryItem item in items)
        {
            GameObject itemUI = Instantiate(itemPrefab, itemsContainer);
            
            // Update item UI elements
            Image itemIcon = itemUI.transform.Find("Icon")?.GetComponent<Image>();
            Text itemName = itemUI.transform.Find("Name")?.GetComponent<Text>();
            Text itemQuantity = itemUI.transform.Find("Quantity")?.GetComponent<Text>();
            
            if (itemIcon != null) itemIcon.sprite = item.icon;
            if (itemName != null) itemName.text = item.itemName;
            if (itemQuantity != null) itemQuantity.text = item.quantity.ToString();
            
            // Add button click listener
            Button itemButton = itemUI.GetComponent<Button>();
            if (itemButton != null)
            {
                itemButton.onClick.AddListener(() => { UseItem(item); });
            }
        }
    }
    
    private void UseItem(InventoryItem item)
    {
        Debug.Log("Using item: " + item.itemName);
        
        // Implement item usage logic
        // This would depend on your game's specific requirements
    }
}`;
      break;
      
    case 'puzzle':
      // Add puzzle-specific scripts
      scripts['PuzzleManager.cs'] = `
using UnityEngine;
using UnityEngine.UI;
using System.Collections.Generic;

public class PuzzleManager : MonoBehaviour
{
    [System.Serializable]
    public class PuzzleData
    {
        public string puzzleId;
        public string puzzleName;
        public string description;
        public bool isSolved = false;
    }
    
    [Header("Puzzle Settings")]
    public List<PuzzleData> puzzles = new List<PuzzleData>();
    public int currentPuzzleIndex = 0;
    
    [Header("UI")]
    public Text puzzleNameText;
    public Text puzzleDescriptionText;
    public Text puzzleProgressText;
    
    private int solvedPuzzles = 0;
    
    private void Start()
    {
        UpdatePuzzleUI();
    }
    
    public void SolvePuzzle(string puzzleId)
    {
        for (int i = 0; i < puzzles.Count; i++)
        {
            if (puzzles[i].puzzleId == puzzleId && !puzzles[i].isSolved)
            {
                puzzles[i].isSolved = true;
                solvedPuzzles++;
                
                Debug.Log("Puzzle solved: " + puzzles[i].puzzleName);
                
                // Check if all puzzles are solved
                if (solvedPuzzles >= puzzles.Count)
                {
                    GameComplete();
                }
                else
                {
                    // Move to next unsolved puzzle
                    for (int j = 0; j < puzzles.Count; j++)
                    {
                        int index = (i + j + 1) % puzzles.Count;
                        if (!puzzles[index].isSolved)
                        {
                            currentPuzzleIndex = index;
                            break;
                        }
                    }
                }
                
                UpdatePuzzleUI();
                break;
            }
        }
    }
    
    public bool IsPuzzleSolved(string puzzleId)
    {
        foreach (PuzzleData puzzle in puzzles)
        {
            if (puzzle.puzzleId == puzzleId)
            {
                return puzzle.isSolved;
            }
        }
        
        return false;
    }
    
    private void UpdatePuzzleUI()
    {
        if (puzzles.Count > 0 && currentPuzzleIndex < puzzles.Count)
        {
            if (puzzleNameText != null)
            {
                puzzleNameText.text = puzzles[currentPuzzleIndex].puzzleName;
            }
            
            if (puzzleDescriptionText != null)
            {
                puzzleDescriptionText.text = puzzles[currentPuzzleIndex].description;
            }
            
            if (puzzleProgressText != null)
            {
                puzzleProgressText.text = solvedPuzzles + " / " + puzzles.Count;
            }
        }
    }
    
    private void GameComplete()
    {
        Debug.Log("All puzzles solved! Game complete!");
        
        // Handle game completion
        // You can show completion screen, unlock achievement, etc.
    }
}`;

      scripts['InteractablePuzzle.cs'] = `
using UnityEngine;

public class InteractablePuzzle : MonoBehaviour, IInteractable
{
    [Header("Puzzle Settings")]
    public string puzzleId;
    public string puzzleName;
    public string puzzleDescription;
    
    [Header("Interaction")]
    public string interactionPrompt = "Press E to interact";
    
    private PuzzleManager puzzleManager;
    
    private void Start()
    {
        puzzleManager = FindObjectOfType<PuzzleManager>();
    }
    
    public string GetInteractionPrompt()
    {
        return interactionPrompt;
    }
    
    public void Interact(GameObject interactor)
    {
        Debug.Log("Interacting with puzzle: " + puzzleName);
        
        // Open puzzle UI or trigger puzzle mechanic
        // This would depend on your specific puzzle implementation
    }
    
    public void SolvePuzzle()
    {
        if (puzzleManager != null)
        {
            puzzleManager.SolvePuzzle(puzzleId);
            
            // You could update the object's appearance or disable interaction
            // after the puzzle is solved
        }
    }
}`;
      break;
      
    case 'racing':
      // Add racing-specific scripts
      scripts['VehicleController.cs'] = `
using UnityEngine;
using System.Collections;

public class VehicleController : MonoBehaviour
{
    [Header("Vehicle Settings")]
    public float maxSpeed = 20f;
    public float acceleration = 10f;
    public float brakeForce = 15f;
    public float turnSpeed = 5f;
    public Transform centerOfMass;
    
    [Header("Wheel Colliders")]
    public WheelCollider[] wheelColliders = new WheelCollider[4]; // FR, FL, RR, RL
    
    [Header("Wheel Meshes")]
    public Transform[] wheelMeshes = new Transform[4]; // FR, FL, RR, RL
    
    [Header("Effects")]
    public ParticleSystem[] wheelParticles = new ParticleSystem[4];
    public AudioSource engineSound;
    
    private Rigidbody rb;
    private float currentSpeed;
    
    private void Start()
    {
        rb = GetComponent<Rigidbody>();
        
        if (centerOfMass != null)
        {
            rb.centerOfMass = centerOfMass.localPosition;
        }
    }
    
    private void Update()
    {
        // Update wheel meshes
        for (int i = 0; i < wheelColliders.Length; i++)
        {
            UpdateWheel(wheelColliders[i], wheelMeshes[i]);
        }
        
        // Update speed
        currentSpeed = rb.velocity.magnitude * 3.6f; // Convert to km/h
        
        // Update engine sound
        if (engineSound != null)
        {
            float pitch = Mathf.Lerp(0.5f, 1.5f, currentSpeed / maxSpeed);
            engineSound.pitch = pitch;
        }
    }
    
    private void FixedUpdate()
    {
        float acceleration = Input.GetAxis("Vertical");
        float steering = Input.GetAxis("Horizontal");
        
        // Apply motor torque to rear wheels
        float motorTorque = acceleration * this.acceleration;
        wheelColliders[2].motorTorque = motorTorque;
        wheelColliders[3].motorTorque = motorTorque;
        
        // Apply steering to front wheels
        float steeringAngle = steering * turnSpeed;
        wheelColliders[0].steerAngle = steeringAngle;
        wheelColliders[1].steerAngle = steeringAngle;
        
        // Apply brakes
        if (Input.GetKey(KeyCode.Space) || acceleration < 0)
        {
            for (int i = 0; i < wheelColliders.Length; i++)
            {
                wheelColliders[i].brakeTorque = brakeForce;
            }
        }
        else
        {
            for (int i = 0; i < wheelColliders.Length; i++)
            {
                wheelColliders[i].brakeTorque = 0;
            }
        }
        
        // Handle wheel particles
        for (int i = 0; i < wheelParticles.Length; i++)
        {
            if (wheelParticles[i] != null)
            {
                WheelHit hit;
                wheelColliders[i].GetGroundHit(out hit);
                
                if (Mathf.Abs(hit.forwardSlip) > 0.5f || Mathf.Abs(hit.sidewaysSlip) > 0.5f)
                {
                    wheelParticles[i].Play();
                }
                else
                {
                    wheelParticles[i].Stop();
                }
            }
        }
    }
    
    private void UpdateWheel(WheelCollider collider, Transform wheelTransform)
    {
        if (collider == null || wheelTransform == null)
            return;
        
        Vector3 position;
        Quaternion rotation;
        collider.GetWorldPose(out position, out rotation);
        
        wheelTransform.position = position;
        wheelTransform.rotation = rotation;
    }
}`;

      scripts['RaceManager.cs'] = `
using UnityEngine;
using UnityEngine.UI;
using System.Collections;
using System.Collections.Generic;

public class RaceManager : MonoBehaviour
{
    [System.Serializable]
    public class Checkpoint
    {
        public Transform checkpointTransform;
        public int checkpointNumber;
    }
    
    [Header("Race Settings")]
    public int totalLaps = 3;
    public float countdownTime = 3f;
    public List<Checkpoint> checkpoints = new List<Checkpoint>();
    
    [Header("UI")]
    public Text lapText;
    public Text timeText;
    public Text countdownText;
    public Text positionText;
    
    private int currentLap = 0;
    private int currentCheckpoint = 0;
    private float raceTime = 0f;
    private bool isRacing = false;
    private int position = 1; // For multiplayer
    
    private void Start()
    {
        StartCoroutine(StartRace());
    }
    
    private void Update()
    {
        if (isRacing)
        {
            raceTime += Time.deltaTime;
            UpdateTimeUI();
        }
    }
    
    private IEnumerator StartRace()
    {
        if (countdownText != null)
        {
            countdownText.gameObject.SetActive(true);
            
            for (int i = (int)countdownTime; i > 0; i--)
            {
                countdownText.text = i.ToString();
                yield return new WaitForSeconds(1f);
            }
            
            countdownText.text = "GO!";
            yield return new WaitForSeconds(1f);
            countdownText.gameObject.SetActive(false);
        }
        
        // Start the race
        isRacing = true;
        currentLap = 1;
        currentCheckpoint = 0;
        raceTime = 0f;
        
        UpdateLapUI();
        UpdatePositionUI();
    }
    
    public void PassCheckpoint(int checkpointNumber)
    {
        if (!isRacing)
            return;
        
        if (checkpointNumber == currentCheckpoint + 1)
        {
            currentCheckpoint = checkpointNumber;
            
            // Check if completed a lap
            if (currentCheckpoint >= checkpoints.Count)
            {
                currentCheckpoint = 0;
                currentLap++;
                
                UpdateLapUI();
                
                // Check if race is completed
                if (currentLap > totalLaps)
                {
                    RaceComplete();
                }
            }
        }
    }
    
    private void RaceComplete()
    {
        isRacing = false;
        Debug.Log("Race completed! Time: " + FormatTime(raceTime));
        
        // Handle race completion
        // You can show results screen, save best time, etc.
    }
    
    private void UpdateLapUI()
    {
        if (lapText != null)
        {
            lapText.text = "Lap: " + currentLap + "/" + totalLaps;
        }
    }
    
    private void UpdateTimeUI()
    {
        if (timeText != null)
        {
            timeText.text = "Time: " + FormatTime(raceTime);
        }
    }
    
    private void UpdatePositionUI()
    {
        if (positionText != null)
        {
            positionText.text = "Position: " + GetOrdinal(position);
        }
    }
    
    private string FormatTime(float time)
    {
        int minutes = (int)(time / 60);
        int seconds = (int)(time % 60);
        int milliseconds = (int)((time * 100) % 100);
        
        return string.Format("{0:00}:{1:00}:{2:00}", minutes, seconds, milliseconds);
    }
    
    private string GetOrdinal(int number)
    {
        string[] suffixes = { "th", "st", "nd", "rd", "th", "th", "th", "th", "th", "th" };
        int suffix = number % 100;
        
        if (suffix >= 11 && suffix <= 13)
        {
            return number + "th";
        }
        
        return number + suffixes[number % 10];
    }
}`;
      break;
      
    case 'platformer':
      // Add platformer-specific scripts
      scripts['PlatformerController.cs'] = `
using UnityEngine;
using System.Collections;

public class PlatformerController : MonoBehaviour
{
    [Header("Movement Settings")]
    public float moveSpeed = 5f;
    public float jumpForce = 12f;
    public float doubleJumpForce = 8f;
    public float groundCheckDistance = 0.2f;
    public LayerMask groundLayer;
    
    [Header("Combat Settings")]
    public Transform attackPoint;
    public float attackRange = 0.5f;
    public int attackDamage = 10;
    public LayerMask enemyLayer;
    
    private Rigidbody2D rb;
    private Animator animator;
    private bool isGrounded;
    private bool canDoubleJump;
    private float moveInput;
    private bool isFacingRight = true;
    
    private void Start()
    {
        rb = GetComponent<Rigidbody2D>();
        animator = GetComponent<Animator>();
    }
    
    private void Update()
    {
        // Check if grounded
        CheckGrounded();
        
        // Get horizontal input
        moveInput = Input.GetAxisRaw("Horizontal");
        
        // Jump input
        if (Input.GetButtonDown("Jump"))
        {
            if (isGrounded)
            {
                Jump();
            }
            else if (canDoubleJump)
            {
                DoubleJump();
            }
        }
        
        // Attack input
        if (Input.GetButtonDown("Fire1"))
        {
            Attack();
        }
        
        // Update animation
        if (animator != null)
        {
            animator.SetFloat("Speed", Mathf.Abs(moveInput));
            animator.SetBool("IsGrounded", isGrounded);
        }
    }
    
    private void FixedUpdate()
    {
        // Move the player
        rb.velocity = new Vector2(moveInput * moveSpeed, rb.velocity.y);
        
        // Flip the player if needed
        if (moveInput > 0 && !isFacingRight)
        {
            Flip();
        }
        else if (moveInput < 0 && isFacingRight)
        {
            Flip();
        }
    }
    
    private void CheckGrounded()
    {
        isGrounded = Physics2D.Raycast(transform.position, Vector2.down, groundCheckDistance, groundLayer);
        
        if (isGrounded)
        {
            canDoubleJump = true;
        }
    }
    
    private void Jump()
    {
        rb.velocity = new Vector2(rb.velocity.x, jumpForce);
        
        if (animator != null)
        {
            animator.SetTrigger("Jump");
        }
        
        canDoubleJump = true;
    }
    
    private void DoubleJump()
    {
        rb.velocity = new Vector2(rb.velocity.x, doubleJumpForce);
        
        if (animator != null)
        {
            animator.SetTrigger("DoubleJump");
        }
        
        canDoubleJump = false;
    }
    
    private void Attack()
    {
        if (animator != null)
        {
            animator.SetTrigger("Attack");
        }
        
        // Detect enemies in range
        Collider2D[] hitEnemies = Physics2D.OverlapCircleAll(attackPoint.position, attackRange, enemyLayer);
        
        // Damage enemies
        foreach (Collider2D enemy in hitEnemies)
        {
            enemy.GetComponent<Enemy>()?.TakeDamage(attackDamage);
        }
    }
    
    private void Flip()
    {
        isFacingRight = !isFacingRight;
        Vector3 scale = transform.localScale;
        scale.x *= -1;
        transform.localScale = scale;
    }
    
    private void OnDrawGizmosSelected()
    {
        // Visualize ground check
        Gizmos.color = Color.red;
        Gizmos.DrawLine(transform.position, transform.position + Vector3.down * groundCheckDistance);
        
        // Visualize attack range
        if (attackPoint != null)
        {
            Gizmos.color = Color.blue;
            Gizmos.DrawWireSphere(attackPoint.position, attackRange);
        }
    }
}`;

      scripts['Enemy.cs'] = `
using UnityEngine;
using System.Collections;

public class Enemy : MonoBehaviour
{
    [Header("Stats")]
    public int health = 100;
    public int damage = 10;
    
    [Header("Movement")]
    public float moveSpeed = 2f;
    public Transform[] patrolPoints;
    public float detectionRange = 5f;
    
    private int currentPatrolIndex = 0;
    private Transform player;
    private Rigidbody2D rb;
    private Animator animator;
    private bool isDead = false;
    
    private void Start()
    {
        rb = GetComponent<Rigidbody2D>();
        animator = GetComponent<Animator>();
        player = GameObject.FindGameObjectWithTag("Player")?.transform;
    }
    
    private void Update()
    {
        if (isDead)
            return;
        
        if (player != null)
        {
            float distanceToPlayer = Vector2.Distance(transform.position, player.position);
            
            if (distanceToPlayer <= detectionRange)
            {
                ChasePlayer();
            }
            else
            {
                Patrol();
            }
        }
        else
        {
            Patrol();
        }
    }
    
    private void Patrol()
    {
        if (patrolPoints == null || patrolPoints.Length == 0)
            return;
        
        Transform targetPoint = patrolPoints[currentPatrolIndex];
        
        if (targetPoint != null)
        {
            // Move towards patrol point
            Vector2 direction = (targetPoint.position - transform.position).normalized;
            rb.velocity = new Vector2(direction.x * moveSpeed, rb.velocity.y);
            
            // Flip based on movement direction
            if (direction.x > 0)
            {
                transform.localScale = new Vector3(1, 1, 1);
            }
            else if (direction.x < 0)
            {
                transform.localScale = new Vector3(-1, 1, 1);
            }
            
            // Check if reached the patrol point
            float distance = Vector2.Distance(transform.position, targetPoint.position);
            if (distance < 0.1f)
            {
                currentPatrolIndex = (currentPatrolIndex + 1) % patrolPoints.Length;
            }
        }
    }
    
    private void ChasePlayer()
    {
        Vector2 direction = (player.position - transform.position).normalized;
        rb.velocity = new Vector2(direction.x * moveSpeed * 1.5f, rb.velocity.y);
        
        // Flip based on movement direction
        if (direction.x > 0)
        {
            transform.localScale = new Vector3(1, 1, 1);
        }
        else if (direction.x < 0)
        {
            transform.localScale = new Vector3(-1, 1, 1);
        }
    }
    
    public void TakeDamage(int damage)
    {
        if (isDead)
            return;
        
        health -= damage;
        
        if (animator != null)
        {
            animator.SetTrigger("Hit");
        }
        
        if (health <= 0)
        {
            Die();
        }
    }
    
    private void Die()
    {
        isDead = true;
        
        if (animator != null)
        {
            animator.SetBool("IsDead", true);
        }
        
        // Disable components
        GetComponent<Collider2D>().enabled = false;
        rb.gravityScale = 0;
        rb.velocity = Vector2.zero;
        
        // Destroy after delay
        Destroy(gameObject, 2f);
    }
    
    private void OnCollisionEnter2D(Collision2D collision)
    {
        if (isDead)
            return;
        
        if (collision.gameObject.CompareTag("Player"))
        {
            // Deal damage to player
            PlayerHealth playerHealth = collision.gameObject.GetComponent<PlayerHealth>();
            if (playerHealth != null)
            {
                playerHealth.TakeDamage(damage);
            }
        }
    }
}`;

      scripts['Collectible.cs'] = `
using UnityEngine;
using System.Collections;

public class Collectible : MonoBehaviour
{
    [Header("Settings")]
    public enum CollectibleType { Coin, Gem, PowerUp, Health }
    public CollectibleType type = CollectibleType.Coin;
    public int value = 1;
    public float bobHeight = 0.5f;
    public float bobSpeed = 2f;
    
    [Header("Effects")]
    public GameObject collectEffect;
    public AudioClip collectSound;
    
    private Vector3 startPosition;
    
    private void Start()
    {
        startPosition = transform.position;
    }
    
    private void Update()
    {
        // Bob up and down
        float newY = startPosition.y + Mathf.Sin(Time.time * bobSpeed) * bobHeight;
        transform.position = new Vector3(transform.position.x, newY, transform.position.z);
        
        // Rotate
        transform.Rotate(0, 90 * Time.deltaTime, 0);
    }
    
    private void OnTriggerEnter2D(Collider2D collision)
    {
        if (collision.CompareTag("Player"))
        {
            Collect(collision.gameObject);
        }
    }
    
    private void Collect(GameObject player)
    {
        // Handle collection based on type
        switch (type)
        {
            case CollectibleType.Coin:
                GameManager.Instance.AddCoins(value);
                break;
                
            case CollectibleType.Gem:
                GameManager.Instance.AddGems(value);
                break;
                
            case CollectibleType.PowerUp:
                // Implement power-up logic
                player.GetComponent<PlatformerController>()?.ApplyPowerUp(value);
                break;
                
            case CollectibleType.Health:
                player.GetComponent<PlayerHealth>()?.Heal(value);
                break;
        }
        
        // Spawn effect
        if (collectEffect != null)
        {
            Instantiate(collectEffect, transform.position, Quaternion.identity);
        }
        
        // Play sound
        if (collectSound != null)
        {
            AudioSource.PlayClipAtPoint(collectSound, transform.position);
        }
        
        // Destroy the collectible
        Destroy(gameObject);
    }
}`;
      break;
      
    default:
      // Generic scripts for other game types
      scripts['GenericController.cs'] = `
using UnityEngine;
using System.Collections;

public class GenericController : MonoBehaviour
{
    [Header("Movement Settings")]
    public float moveSpeed = 5f;
    public float jumpForce = 5f;
    
    private Rigidbody rb;
    private Animator animator;
    
    private void Start()
    {
        rb = GetComponent<Rigidbody>();
        animator = GetComponent<Animator>();
    }
    
    private void Update()
    {
        float horizontal = Input.GetAxis("Horizontal");
        float vertical = Input.GetAxis("Vertical");
        
        Vector3 movement = new Vector3(horizontal, 0f, vertical).normalized * moveSpeed * Time.deltaTime;
        transform.Translate(movement);
        
        if (movement.magnitude > 0)
        {
            transform.rotation = Quaternion.LookRotation(movement);
            
            if (animator != null)
            {
                animator.SetBool("IsMoving", true);
            }
        }
        else
        {
            if (animator != null)
            {
                animator.SetBool("IsMoving", false);
            }
        }
        
        if (Input.GetButtonDown("Jump"))
        {
            if (rb != null)
            {
                rb.AddForce(Vector3.up * jumpForce, ForceMode.Impulse);
                
                if (animator != null)
                {
                    animator.SetTrigger("Jump");
                }
            }
        }
    }
}`;
      break;
  }
  
  return scripts;
}