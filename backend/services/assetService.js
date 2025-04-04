// backend/services/assetService.js
const path = require('path');
const fs = require('fs').promises;
const { createDirectoryIfNotExists, copyFile } = require('../utils/fileUtils');

// Set base asset directory to your custom path
const ASSETS_DIR = process.env.ASSETS_DIR || 'D:/TeyloAssets';

/**
 * Prepare assets for a build
 * @param {Object} project - Project information
 * @returns {Array} - List of prepared assets
 */
exports.prepareAssetsForBuild = async (project) => {
  try {
    const gameType = project.gameType;
    const assets = [];
    
    // Create assets directory
    const projectAssetsDir = path.join(__dirname, '../../assets', project._id.toString());
    await createDirectoryIfNotExists(projectAssetsDir);
    
    // Get appropriate assets based on game design document
    const selectedAssets = await selectAssetsForGameDesign(gameType, project.gameDesignDocument);
    
    // Copy assets to project directory
    for (const asset of selectedAssets) {
      const assetDestPath = path.join(projectAssetsDir, asset.filename);
      
      if (asset.sourcePath) {
        // Copy the asset from the source path
        await copyFile(asset.sourcePath, assetDestPath);
      } else if (asset.data) {
        // Save asset data directly (for backward compatibility)
        await fs.writeFile(assetDestPath, asset.data);
      }
      
      assets.push({
        ...asset,
        path: assetDestPath,
        projectPath: `Assets/${asset.category}/${asset.filename}`
      });
    }
    
    console.log(`Prepared ${assets.length} assets for project ${project._id}`);
    return assets;
  } catch (error) {
    console.error('Error preparing assets:', error);
    throw new Error(`Failed to prepare assets for build: ${error.message}`);
  }
};

/**
 * Select assets based on game design document and game type
 * @param {string} gameType - Type of game
 * @param {Object} gameDesign - Game design document
 * @returns {Array} - Selected assets for the game
 */
async function selectAssetsForGameDesign(gameType, gameDesign) {
  try {
    // These are the asset categories we want to include based on game type
    const assetTypes = getRequiredAssetTypes(gameType);
    const assets = [];

    // Get specific assets based on downloaded Unity assets
    // This uses the assets you specifically mentioned downloading
    const specificAssets = await getSpecificDownloadedAssets(gameType, gameDesign);
    assets.push(...specificAssets);
    
    console.log(`Selected ${assets.length} specific assets for ${gameType} game`);

    // If specific assets don't cover all required categories, add generic ones
    const coveredCategories = new Set(assets.map(asset => asset.category));
    for (const type of assetTypes) {
      if (!coveredCategories.has(type)) {
        const genericAssets = await getGenericAssets(type, gameType);
        assets.push(...genericAssets);
      }
    }

    return assets;
  } catch (error) {
    console.error('Error selecting assets:', error);
    return getDefaultAssetsForGameType(gameType);
  }
}

/**
 * Get required asset types for a specific game type
 * @param {string} gameType - Type of game
 * @returns {Array} - Required asset types
 */
function getRequiredAssetTypes(gameType) {
  const commonTypes = ['environment', 'ui', 'audio'];
  
  const specificTypes = {
    fps: ['characters', 'weapons', 'fx'],
    adventure: ['characters', 'items', 'fx'],
    puzzle: ['props', 'fx'],
    racing: ['vehicles', 'fx'],
    platformer: ['characters', 'props', 'fx']
  };
  
  return [...commonTypes, ...(specificTypes[gameType] || [])];
}

/**
 * Get specific downloaded assets based on the game type and design
 * Using the assets you mentioned downloading from Unity Asset Store
 * @param {string} gameType - Type of game
 * @param {Object} gameDesign - Game design document
 * @returns {Array} - Specific assets
 */
async function getSpecificDownloadedAssets(gameType, gameDesign) {
  const assets = [];
  
  // Map game types to specific downloaded assets
  const assetMappings = {
    fps: [
      {
        name: 'Zombie Character',
        category: 'characters',
        filename: 'zombie.fbx',
        sourcePath: path.join(ASSETS_DIR, 'characters/zombies/zombie.fbx'),
        type: 'model'
      },
      {
        name: 'Zombie Attack Animation',
        category: 'animations',
        filename: 'zombie_attack.fbx',
        sourcePath: path.join(ASSETS_DIR, 'animations/Zombie Attack.fbx'),
        type: 'animation'
      },
      {
        name: 'FPS Gun',
        category: 'weapons',
        filename: 'gun.fbx',
        sourcePath: path.join(ASSETS_DIR, 'weapons/guns/gun.fbx'),
        type: 'model'
      },
      {
        name: 'Gun Sound FX',
        category: 'audio',
        filename: 'gun_sound.wav',
        sourcePath: path.join(ASSETS_DIR, 'audio/weapons/fog_of_war_gun_sound.wav'),
        type: 'audio'
      },
      {
        name: 'First Person Controller',
        category: 'characters',
        filename: 'fps_controller.prefab',
        sourcePath: path.join(ASSETS_DIR, 'characters/modular_first_person_controller.prefab'),
        type: 'prefab'
      },
      {
        name: 'Forest Environment',
        category: 'environment',
        filename: 'forest_environment.prefab',
        sourcePath: path.join(ASSETS_DIR, 'environments/forest/fantasy_forest_environment.prefab'),
        type: 'prefab'
      }
    ],
    adventure: [
      {
        name: '3D Game Kit Environment',
        category: 'environment',
        filename: 'game_kit_environment.prefab',
        sourcePath: path.join(ASSETS_DIR, 'environments/3d_game_kit.prefab'),
        type: 'prefab'
      },
      {
        name: 'First Person Controller',
        category: 'characters',
        filename: 'fps_controller.prefab',
        sourcePath: path.join(ASSETS_DIR, 'characters/modular_first_person_controller.prefab'),
        type: 'prefab'
      },
      {
        name: 'Simple UI Kit',
        category: 'ui',
        filename: 'simple_ui_kit.prefab',
        sourcePath: path.join(ASSETS_DIR, 'ui/simple_ui_kit.prefab'),
        type: 'prefab'
      }
    ],
    // Other game types...
  };
  
  // Add assets specific to the game type
  const typeAssets = assetMappings[gameType] || [];
  assets.push(...typeAssets);
  
  return assets;
}

/**
 * Get generic assets for a category
 * @param {string} category - Asset category
 * @param {string} gameType - Type of game
 * @returns {Array} - Generic assets
 */
async function getGenericAssets(category, gameType) {
  // This function would normally scan your asset directory
  // For now, we'll return empty array since we're using specific assets
  return [];
}

/**
 * Fallback function to get default assets for a game type
 * @param {string} gameType - Type of game
 * @returns {Array} - Default assets for the game type
 */
function getDefaultAssetsForGameType(gameType) {
  // Common assets all games should have
  const commonAssets = [
    {
      name: 'Simple UI Kit',
      category: 'ui',
      filename: 'simple_ui_kit.prefab',
      sourcePath: path.join(ASSETS_DIR, 'ui/simple_ui_kit.prefab'),
      type: 'prefab'
    }
  ];
  
  const typeSpecificDefaults = {
    fps: [
      {
        name: 'Zombie',
        category: 'characters',
        filename: 'zombie.fbx',
        sourcePath: path.join(ASSETS_DIR, 'characters/zombies/zombie.fbx'),
        type: 'model'
      },
      {
        name: 'Gun',
        category: 'weapons',
        filename: 'gun.fbx',
        sourcePath: path.join(ASSETS_DIR, 'weapons/guns/gun.fbx'),
        type: 'model'
      }
    ],
    // Other game types...
  };
  
  return [...commonAssets, ...(typeSpecificDefaults[gameType] || [])];
}