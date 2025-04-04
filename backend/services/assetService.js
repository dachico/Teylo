// backend/services/assetService.js
const path = require('path');
const axios = require('axios');
const fs = require('fs').promises;
const { createDirectoryIfNotExists, saveFile } = require('../utils/fileUtils');

/**
 * Prepare assets for a build
 * @param {Object} project - Project information
 * @returns {Array} - List of prepared assets
 */
exports.prepareAssetsForBuild = async (project) => {
  try {
    // In a real implementation, you would fetch/generate assets based on game type
    // For now, we'll just use a mock implementation
    
    const gameType = project.gameType;
    const assets = [];
    
    // Create assets directory
    const assetsDir = path.join(__dirname, '../../assets', project._id.toString());
    await createDirectoryIfNotExists(assetsDir);
    
    // Get default assets for game type
    const defaultAssets = await getDefaultAssets(gameType);
    
    // Save assets to disk
    for (const asset of defaultAssets) {
      const assetPath = path.join(assetsDir, asset.filename);
      
      if (asset.url) {
        // Download asset from URL
        const response = await axios.get(asset.url, { responseType: 'arraybuffer' });
        await saveFile(response.data, assetPath);
      } else if (asset.data) {
        // Save asset data directly
        await saveFile(asset.data, assetPath);
      }
      
      assets.push({
        ...asset,
        path: assetPath,
        projectPath: `Assets/${asset.category}/${asset.filename}`
      });
    }
    
    return assets;
  } catch (error) {
    console.error('Error preparing assets:', error);
    throw new Error('Failed to prepare assets for build');
  }
};

/**
 * Get default assets for a game type
 * @param {string} gameType - Type of game
 * @returns {Array} - Default assets for the game type
 */
async function getDefaultAssets(gameType) {
  // In a real implementation, you would query a database or asset service
  // For now, we'll just return mock assets
  
  const commonAssets = [
    {
      name: 'Skybox',
      category: 'Environment',
      filename: 'skybox.jpg',
      type: 'texture',
      // Data would be generated dynamically in a real implementation
      data: Buffer.from('MOCK_SKYBOX_DATA') 
    },
    {
      name: 'Ground Texture',
      category: 'Environment',
      filename: 'ground.jpg',
      type: 'texture',
      data: Buffer.from('MOCK_GROUND_TEXTURE_DATA')
    }
  ];
  
  const gameTypeAssets = {
    fps: [
      {
        name: 'Gun Model',
        category: 'Weapons',
        filename: 'pistol.fbx',
        type: 'model',
        data: Buffer.from('MOCK_GUN_MODEL_DATA')
      },
      {
        name: 'Enemy Model',
        category: 'Characters',
        filename: 'enemy.fbx',
        type: 'model',
        data: Buffer.from('MOCK_ENEMY_MODEL_DATA')
      }
    ],
    adventure: [
      {
        name: 'Character Model',
        category: 'Characters',
        filename: 'player.fbx',
        type: 'model',
        data: Buffer.from('MOCK_CHARACTER_MODEL_DATA')
      },
      {
        name: 'Tree Model',
        category: 'Environment',
        filename: 'tree.fbx',
        type: 'model',
        data: Buffer.from('MOCK_TREE_MODEL_DATA')
      }
    ],
    puzzle: [
      {
        name: 'Puzzle Box',
        category: 'Props',
        filename: 'puzzle_box.fbx',
        type: 'model',
        data: Buffer.from('MOCK_PUZZLE_BOX_DATA')
      },
      {
        name: 'Button',
        category: 'Interactive',
        filename: 'button.fbx',
        type: 'model',
        data: Buffer.from('MOCK_BUTTON_MODEL_DATA')
      }
    ],
    racing: [
      {
        name: 'Car Model',
        category: 'Vehicles',
        filename: 'car.fbx',
        type: 'model',
        data: Buffer.from('MOCK_CAR_MODEL_DATA')
      },
      {
        name: 'Track',
        category: 'Environment',
        filename: 'track.fbx',
        type: 'model',
        data: Buffer.from('MOCK_TRACK_MODEL_DATA')
      }
    ],
    platformer: [
      {
        name: 'Platform',
        category: 'Environment',
        filename: 'platform.fbx',
        type: 'model',
        data: Buffer.from('MOCK_PLATFORM_MODEL_DATA')
      },
      {
        name: 'Collectible',
        category: 'Interactive',
        filename: 'collectible.fbx',
        type: 'model',
        data: Buffer.from('MOCK_COLLECTIBLE_MODEL_DATA')
      }
    ]
  };
  
  return [...commonAssets, ...(gameTypeAssets[gameType] || [])];
}