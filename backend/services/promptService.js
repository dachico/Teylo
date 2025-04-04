// backend/services/promptService.js
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

// Gemini API key from environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Local asset directory path
const ASSETS_DIR = process.env.ASSETS_DIR || 'D:/TeyloAssets';

/**
 * Process a game prompt and generate a game design document
 * @param {string} prompt - User's game description prompt
 * @returns {Object} - Game design document
 */
exports.processGamePrompt = async (prompt) => {
  try {
    console.log('Processing prompt:', prompt);
    
    // Detect game type from prompt
    const gameType = await detectGameType(prompt);
    console.log('Detected game type:', gameType);
    
    // Get available assets for this game type
    const availableAssets = await getAvailableAssets(gameType);
    console.log(`Found ${availableAssets.length} available assets for ${gameType}`);
    
    // Generate game design document with asset constraints
    const gameDesign = await generateGameDesign(prompt, gameType, availableAssets);
    console.log('Generated game design');
    
    return {
      ...gameDesign,
      gameType,
      suggestedName: gameDesign.gameName || generateGameName(prompt, gameType)
    };
  } catch (error) {
    console.error('Error processing game prompt:', error);
    // If AI fails, fall back to basic implementation
    return fallbackGameDesign(prompt, await getAvailableAssets(fallbackDetectGameType(prompt)));
  }
};

/**
 * Detect the game type from a prompt using Gemini API or local logic
 * @param {string} prompt - User's game description
 * @returns {string} - Detected game type
 */
async function detectGameType(prompt) {
  try {
    // First check local patterns that match our downloaded assets
    if (/zombie|shooter|fps|gun|first.person|shooting/i.test(prompt)) {
      return 'fps';
    } else if (/adventure|quest|explore|journey|3d.*game.*kit/i.test(prompt)) {
      return 'adventure';
    } else if (/puzzle|solve|riddle/i.test(prompt)) {
      return 'puzzle';
    } else if (/race|car|driving|speed|track/i.test(prompt)) {
      return 'racing';
    } else if (/platform|jump|2d|side.?scroll/i.test(prompt)) {
      return 'platformer';
    }
    
    // If no clear pattern, use Gemini API if available
    if (GEMINI_API_KEY) {
      const response = await axios.post(
        `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
        {
          contents: [
            {
              parts: [
                {
                  text: `You are a game design expert. Based on the following game description, categorize it into exactly ONE of these game types: fps, adventure, puzzle, racing, platformer, or other. 
                  
                  Only respond with a single word answer that is one of these types.
                  
                  Game description: ${prompt}`
                }
              ]
            }
          ]
        }
      );
      
      const result = response.data.candidates[0].content.parts[0].text.trim().toLowerCase();
      
      // Ensure the response matches our expected types
      const validTypes = ['fps', 'adventure', 'puzzle', 'racing', 'platformer', 'other'];
      
      return validTypes.includes(result) ? result : 'adventure';
    } else {
      return fallbackDetectGameType(prompt);
    }
  } catch (error) {
    console.error('Error detecting game type:', error);
    return fallbackDetectGameType(prompt);
  }
}

/**
 * Generate a game design document from a prompt
 * @param {string} prompt - User's game description
 * @param {string} gameType - Detected game type
 * @param {Array} availableAssets - List of available assets
 * @returns {Object} - Game design document
 */
async function generateGameDesign(prompt, gameType, availableAssets) {
  try {
    // Build a prompt that guides the AI to use our available assets
    let assetCategories = _.groupBy(availableAssets, 'category');
    let assetPrompt = '';
    
    // Add asset information to the prompt
    Object.entries(assetCategories).forEach(([category, assets]) => {
      assetPrompt += `\n${category}: ${assets.map(a => a.name).join(', ')}`;
    });
    
    if (GEMINI_API_KEY) {
      const designPrompt = `
      You are a game design expert. Create a detailed game design document for a ${gameType} game based on this description: "${prompt}"
      
      IMPORTANT: The game must use ONLY assets from the following list:
      ${assetPrompt}
      
      Your response must be valid JSON with these properties:
      {
        "gameName": "A catchy, creative name for the game",
        "description": "A brief description of the game concept",
        "genre": "The specific genre within the ${gameType} category",
        "setting": {
          "type": "One word for the setting (e.g., fantasy, space, urban, etc.)",
          "description": "Brief description of the game world and setting"
        },
        "characters": [
          {
            "type": "Character role (player, enemy, npc, etc.)",
            "description": "Description of the character that matches available assets"
          }
        ],
        "mechanics": ["Core gameplay mechanic 1", "Core gameplay mechanic 2", ...],
        "levels": [
          {
            "name": "Level name",
            "description": "Brief description of the level",
            "difficulty": "Tutorial/Easy/Medium/Hard"
          }
        ],
        "assets": {
          "environment": ["Asset 1", "Asset 2", ...],
          "characters": ["Asset 1", "Asset 2", ...],
          "items": ["Asset 1", "Asset 2", ...],
          "audio": ["Asset 1", "Asset 2", ...]
        },
        "userInterface": ["UI element 1", "UI element 2", ...]
      }
      
      The assets in your design MUST be a subset of the provided available assets list. Do not invent new assets. The response must be ONLY valid JSON without any additional text.`;
      
      const response = await axios.post(
        `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
        {
          contents: [
            {
              parts: [
                {
                  text: designPrompt
                }
              ]
            }
          ]
        }
      );
      
      const resultText = response.data.candidates[0].content.parts[0].text;
      
      try {
        // Extract JSON from response (in case the AI added additional text)
        const jsonMatch = resultText.match(/\{[\s\S]*\}/);
        const jsonString = jsonMatch ? jsonMatch[0] : resultText;
        return JSON.parse(jsonString);
      } catch (parseError) {
        console.error('Error parsing JSON from AI:', parseError);
        console.log('Received result:', resultText);
        return fallbackGenerateGameDesign(prompt, gameType, availableAssets);
      }
    } else {
      return fallbackGenerateGameDesign(prompt, gameType, availableAssets);
    }
  } catch (error) {
    console.error('Error generating game design with AI:', error);
    return fallbackGenerateGameDesign(prompt, gameType, availableAssets);
  }
}

/**
 * Get available assets from local directory
 * @param {string} gameType - Type of game
 * @returns {Array} - Available assets
 */
async function getAvailableAssets(gameType) {
  try {
    const assets = [];
    
    // Check if metadata directory exists
    const metadataDir = path.join(ASSETS_DIR, 'metadata');
    let metadataFiles = [];
    
    try {
      // Try to read metadata files
      const files = await fs.readdir(metadataDir);
      metadataFiles = files.filter(file => file.endsWith('.json'));
    } catch (error) {
      console.warn('Metadata directory not found or empty, using predefined assets');
    }
    
    if (metadataFiles.length > 0) {
      // Read metadata files
      for (const file of metadataFiles) {
        try {
          const metadata = JSON.parse(await fs.readFile(path.join(metadataDir, file), 'utf8'));
          
          // Include asset if it's suitable for this game type
          if (metadata.gameTypes.includes(gameType) || metadata.gameTypes.includes('all')) {
            assets.push({
              id: metadata.id,
              name: metadata.name,
              category: metadata.type,
              subtype: metadata.subtype,
              format: metadata.format,
              tags: metadata.tags,
              localPath: metadata.localPath
            });
          }
        } catch (error) {
          console.error(`Error reading metadata file ${file}:`, error);
        }
      }
    }
    
    // If no metadata available, use hardcoded assets based on what was downloaded
    if (assets.length === 0) {
      const defaultAssets = getDefaultAssetsForGameType(gameType);
      assets.push(...defaultAssets);
    }
    
    return assets;
  } catch (error) {
    console.error('Error getting available assets:', error);
    return getDefaultAssetsForGameType(gameType);
  }
}

/**
 * Generate a game name from a prompt
 * @param {string} prompt - User's game description
 * @param {string} gameType - Detected game type
 * @returns {string} - Generated game name
 */
function generateGameName(prompt, gameType) {
  // Extract key words from prompt
  const words = prompt.split(/\s+/).filter(word => 
    word.length > 3 && 
    !['game', 'about', 'with', 'that', 'this', 'would', 'could'].includes(word.toLowerCase())
  );
  
  // Get potential name words
  const potentialWords = words.length > 2 ? 
    words.slice(0, Math.min(words.length, 5)) : 
    [`${gameTypeToAdjective(gameType)} Adventure`];
  
  // Generate simple name (in production, you would use AI for better names)
  if (words.length > 1) {
    return `${words[0]} ${words[Math.floor(Math.random() * Math.min(words.length, 3)) + 1]}`;
  } else if (words.length === 1) {
    return `${words[0]} ${gameTypeToNoun(gameType)}`;
  } else {
    return `${gameTypeToAdjective(gameType)} ${gameTypeToNoun(gameType)}`;
  }
}

/** 
 * FALLBACK IMPLEMENTATIONS BELOW 
 * These are used when the AI API fails or is unavailable
 */

/**
 * Fallback game type detection using keywords
 * @param {string} prompt - User's game description
 * @returns {string} - Detected game type
 */
function fallbackDetectGameType(prompt) {
  const promptLower = prompt.toLowerCase();
  
  if (promptLower.includes('zombie') || promptLower.includes('shooter') || promptLower.includes('fps') || promptLower.includes('gun') || promptLower.includes('first person')) {
    return 'fps';
  } else if (promptLower.includes('adventure') || promptLower.includes('exploration') || promptLower.includes('quest')) {
    return 'adventure';
  } else if (promptLower.includes('puzzle') || promptLower.includes('solving')) {
    return 'puzzle';
  } else if (promptLower.includes('racing') || promptLower.includes('car') || promptLower.includes('drive')) {
    return 'racing';
  } else if (promptLower.includes('platform') || promptLower.includes('side-scroller') || promptLower.includes('jumping')) {
    return 'platformer';
  } else {
    // Default to adventure if no specific type is detected
    return 'adventure';
  }
}

/**
 * Fallback game design generation
 * @param {string} prompt - User's game description
 * @param {string} gameType - Detected game type
 * @param {Array} availableAssets - Available assets
 * @returns {Object} - Game design document
 */
function fallbackGenerateGameDesign(prompt, gameType, availableAssets) {
  const gameName = generateGameName(prompt, gameType);
  
  // Group assets by category
  const assetsByCategory = {};
  availableAssets.forEach(asset => {
    if (!assetsByCategory[asset.category]) {
      assetsByCategory[asset.category] = [];
    }
    assetsByCategory[asset.category].push(asset.name);
  });
  
  // Ensure we have required asset categories
  const requiredCategories = ['environment', 'characters', 'audio', 'ui'];
  requiredCategories.forEach(category => {
    if (!assetsByCategory[category]) {
      assetsByCategory[category] = [`Default ${category}`];
    }
  });
  
  // Generate custom levels based on game type and assets
  let levels = [];
  if (gameType === 'fps' && assetsByCategory.environment) {
    levels = [
      {
        name: "Zombie Overrun",
        description: "Fight through a horde of zombies in a forest environment",
        difficulty: "Medium"
      },
      {
        name: "Last Stand",
        description: "Defend your position against waves of undead attackers",
        difficulty: "Hard"
      }
    ];
  } else if (gameType === 'adventure' && assetsByCategory.environment) {
    levels = [
      {
        name: "The Journey Begins",
        description: "Explore the ancient forest and discover hidden secrets",
        difficulty: "Easy"
      },
      {
        name: "Mysterious Temple",
        description: "Navigate through a complex temple filled with puzzles",
        difficulty: "Medium"
      }
    ];
  } else {
    levels = generateLevels(gameType);
  }
  
  // Generate mechanics based on game type and available assets
  let mechanics = [];
  if (gameType === 'fps') {
    mechanics = ["First-person shooting", "Zombie combat", "Resource management", "Exploration"];
  } else if (gameType === 'adventure') {
    mechanics = ["Exploration", "Item collection", "Character dialogue", "Puzzle solving"];
  } else {
    mechanics = generateMechanics(gameType);
  }
  
  return {
    gameName,
    description: prompt,
    genre: gameTypeToGenre(gameType),
    setting: extractSetting(prompt),
    characters: generateCharacters(gameType, assetsByCategory.characters || []),
    mechanics: mechanics,
    levels: levels,
    assets: assetsByCategory,
    userInterface: generateUI(gameType)
  };
}

/**
 * Fallback game design for when AI fails completely
 * @param {string} prompt - User's game description
 * @param {Array} availableAssets - Available assets
 * @returns {Object} - Basic game design
 */
function fallbackGameDesign(prompt, availableAssets) {
  const gameType = fallbackDetectGameType(prompt);
  const gameName = generateGameName(prompt, gameType);
  
  // Group assets by category
  const assetsByCategory = {};
  availableAssets.forEach(asset => {
    if (!assetsByCategory[asset.category]) {
      assetsByCategory[asset.category] = [];
    }
    assetsByCategory[asset.category].push(asset.name);
  });
  
  return {
    gameName,
    description: prompt,
    gameType,
    genre: gameTypeToGenre(gameType),
    setting: extractSetting(prompt),
    characters: generateCharacters(gameType, assetsByCategory.characters || []),
    mechanics: generateMechanics(gameType),
    levels: generateLevels(gameType),
    assets: assetsByCategory,
    userInterface: generateUI(gameType)
  };
}

/**
 * Generate characters based on game type and available assets
 * @param {string} gameType - Game type
 * @param {Array} characterAssets - Available character assets
 * @returns {Array} - Character definitions
 */
function generateCharacters(gameType, characterAssets) {
  const characters = [];
  
  // Always add a player character
  characters.push({
    type: 'player',
    description: 'Main player character controlled by the user'
  });
  
  // Add game-type specific characters
  if (gameType === 'fps' && characterAssets.some(c => c.toLowerCase().includes('zombie'))) {
    characters.push({
      type: 'enemy',
      description: 'Zombie enemies that attack the player'
    });
  }
  
  // Add generic enemies if needed
  if (characters.length < 2) {
    characters.push({
      type: 'enemy',
      description: 'Enemy characters that challenge the player'
    });
  }
  
  // Add NPCs for adventure games
  if (gameType === 'adventure') {
    characters.push({
      type: 'npc',
      description: 'Friendly characters that provide information and quests'
    });
  }
  
  return characters;
}

/**
 * Map game type to genre
 * @param {string} gameType 
 * @returns {string} - Genre name
 */
function gameTypeToGenre(gameType) {
  const genreMap = {
    'fps': 'First-Person Shooter',
    'adventure': 'Adventure',
    'puzzle': 'Puzzle',
    'racing': 'Racing',
    'platformer': 'Platformer',
    'other': 'Indie'
  };
  
  return genreMap[gameType] || 'Adventure';
}

/**
 * Map game type to adjective for name generation
 * @param {string} gameType 
 * @returns {string} - Adjective
 */
function gameTypeToAdjective(gameType) {
  const adjectiveMap = {
    'fps': 'Epic',
    'adventure': 'Mysterious',
    'puzzle': 'Enigmatic',
    'racing': 'Turbo',
    'platformer': 'Super',
    'other': 'Amazing'
  };
  
  return adjectiveMap[gameType] || 'Epic';
}

/**
 * Map game type to noun for name generation
 * @param {string} gameType 
 * @returns {string} - Noun
 */
function gameTypeToNoun(gameType) {
  const nounMap = {
    'fps': 'Combat',
    'adventure': 'Quest',
    'puzzle': 'Mystery',
    'racing': 'Racers',
    'platformer': 'Jump',
    'other': 'Game'
  };
  
  return nounMap[gameType] || 'Adventure';
}

/**
 * Extract setting from prompt
 * @param {string} prompt 
 * @returns {Object} - Setting information
 */
function extractSetting(prompt) {
  // Simple keyword extraction
  const settings = {
    space: prompt.toLowerCase().includes('space') || prompt.toLowerCase().includes('galaxy'),
    medieval: prompt.toLowerCase().includes('medieval') || prompt.toLowerCase().includes('castle'),
    future: prompt.toLowerCase().includes('future') || prompt.toLowerCase().includes('sci-fi'),
    urban: prompt.toLowerCase().includes('city') || prompt.toLowerCase().includes('urban'),
    nature: prompt.toLowerCase().includes('forest') || prompt.toLowerCase().includes('mountain'),
    zombie: prompt.toLowerCase().includes('zombie') || prompt.toLowerCase().includes('undead')
  };
  
  const detectedSettings = Object.entries(settings)
    .filter(([_, detected]) => detected)
    .map(([setting, _]) => setting);
  
  // Default to natural setting if no setting detected and it's an FPS game
  let primarySetting = detectedSettings.length > 0 ? detectedSettings[0] : 'fantasy';
  
  // If it's a zombie game but no setting explicitly mentioned, use urban
  if (prompt.toLowerCase().includes('zombie') && detectedSettings.length === 1 && detectedSettings[0] === 'zombie') {
    primarySetting = 'urban';
  }
  
  return {
    type: primarySetting,
    description: generateSettingDescription(primarySetting, prompt)
  };
}

/**
 * Generate setting description based on setting type
 * @param {string} settingType - Type of setting
 * @param {string} prompt - Original prompt
 * @returns {string} - Setting description
 */
function generateSettingDescription(settingType, prompt) {
  switch (settingType) {
    case 'space':
      return 'A vast space environment with distant stars and mysterious planets';
    case 'medieval':
      return 'A medieval world with castles, villages, and ancient forests';
    case 'future':
      return 'A futuristic sci-fi setting with advanced technology and structures';
    case 'urban':
      return 'A modern urban environment with city streets and buildings';
    case 'nature':
      return 'A natural wilderness setting with forests, mountains, and wildlife';
    case 'zombie':
      return 'A post-apocalyptic world overrun by the undead';
    default:
      return `A ${settingType} setting based on the user's description`;
  }
}

/**
 * Generate mechanics based on game type
 * @param {string} gameType 
 * @returns {Array} - Game mechanics
 */
function generateMechanics(gameType) {
  const mechanicsByType = {
    fps: ['First-person camera', 'Shooting', 'Weapon switching', 'Health system', 'Enemy AI'],
    adventure: ['Exploration', 'Dialogue', 'Inventory', 'Quests', 'Character progression'],
    puzzle: ['Object manipulation', 'Logic puzzles', 'Progression gates', 'Hints system'],
    racing: ['Vehicle control', 'Speed boost', 'Track navigation', 'Lap timing', 'Drift mechanics'],
    platformer: ['Jumping', 'Collectibles', 'Obstacles', 'Power-ups', 'Enemy encounters']
  };
  
  return mechanicsByType[gameType] || ['Movement', 'Interaction', 'Objectives'];
}

/**
 * Generate level concepts based on game type
 * @param {string} gameType 
 * @returns {Array} - Level concepts
 */
function generateLevels(gameType) {
  // Basic levels for each game type
  const levelsByType = {
    fps: [
      {
        name: 'Training Grounds',
        description: 'Learn the basics of combat and weapon handling',
        difficulty: 'Tutorial'
      },
      {
        name: 'First Encounter',
        description: 'Face your first enemies in a controlled environment',
        difficulty: 'Easy'
      },
      {
        name: 'The Horde',
        description: 'Fight against waves of enemies in more open areas',
        difficulty: 'Medium'
      }
    ],
    adventure: [
      {
        name: 'The Village',
        description: 'Start your journey in a peaceful village and learn about your quest',
        difficulty: 'Tutorial'
      },
      {
        name: 'The Ancient Forest',
        description: 'Navigate through a mysterious forest filled with secrets',
        difficulty: 'Easy'
      },
      {
        name: 'The Forgotten Temple',
        description: 'Explore an ancient temple with puzzles and hidden treasures',
        difficulty: 'Medium'
      }
    ],
    puzzle: [
      {
        name: 'Introduction',
        description: 'Learn the basic puzzle mechanics',
        difficulty: 'Tutorial'
      },
      {
        name: 'Mind Benders',
        description: 'Solve increasingly complex logic puzzles',
        difficulty: 'Easy'
      },
      {
        name: 'The Master Test',
        description: 'Complex puzzles that combine all previously learned mechanics',
        difficulty: 'Hard'
      }
    ],
    racing: [
      {
        name: 'Rookie Circuit',
        description: 'Simple track to learn driving controls',
        difficulty: 'Tutorial'
      },
      {
        name: 'City Sprint',
        description: 'Race through city streets with traffic and shortcuts',
        difficulty: 'Medium'
      },
      {
        name: 'Champion\'s Speedway',
        description: 'The most challenging track with complex turns and obstacles',
        difficulty: 'Hard'
      }
    ],
    platformer: [
      {
        name: 'Green Hills',
        description: 'Simple platforming level to learn the basics',
        difficulty: 'Tutorial'
      },
      {
        name: 'Danger Zone',
        description: 'More challenging platforms with hazards and enemies',
        difficulty: 'Medium'
      },
      {
        name: 'The Final Tower',
        description: 'Vertical ascent with the hardest platforming challenges',
        difficulty: 'Hard'
      }
    ]
  };
  
  return levelsByType[gameType] || [
    {
      name: 'Level 1',
      description: 'Introduction to basic gameplay mechanics',
      difficulty: 'Tutorial'
    },
    {
      name: 'Level 2',
      description: 'First challenge with basic obstacles',
      difficulty: 'Easy'
    },
    {
      name: 'Level 3',
      description: 'Increased difficulty with new elements',
      difficulty: 'Medium'
    }
  ];
}

/**
 * Generate UI elements based on game type
 * @param {string} gameType 
 * @returns {Array} - UI elements
 */
function generateUI(gameType) {
  const commonUI = ['Main Menu', 'Pause Menu', 'Settings', 'Game Over Screen'];
  
  const typeSpecificUI = {
    fps: ['Health Bar', 'Ammo Counter', 'Crosshair', 'Minimap', 'Weapon Selection'],
    adventure: ['Inventory Screen', 'Dialog UI', 'Quest Log', 'Map', 'Character Stats'],
    puzzle: ['Hint System', 'Timer', 'Move Counter', 'Restart Button', 'Puzzle Grid'],
    racing: ['Speedometer', 'Lap Counter', 'Position Indicator', 'Race Timer', 'Minimap'],
    platformer: ['Health/Lives Counter', 'Score Counter', 'Collectible Counter', 'Level Progress', 'Power-up Display']
  };
  
  return [...commonUI, ...(typeSpecificUI[gameType] || [])];
}

/**
 * Get default assets for a game type based on local files
 * These match the specific assets mentioned in your setup
 * @param {string} gameType - Type of game
 * @returns {Array} - Default assets for the game type
 */
function getDefaultAssetsForGameType(gameType) {
  // Common assets all games should have
  const commonAssets = [
    {
      id: 'ui_simple_kit',
      name: 'Simple UI Kit',
      category: 'ui',
      subtype: 'interface',
      format: '.prefab',
      tags: ['ui', 'menu', 'interface'],
      localPath: path.join(ASSETS_DIR, 'ui/simple_ui_kit.prefab')
    },
    {
      id: 'audio_general',
      name: 'General Audio Pack',
      category: 'audio',
      subtype: 'sfx',
      format: '.wav',
      tags: ['audio', 'sound', 'sfx'],
      localPath: path.join(ASSETS_DIR, 'audio')
    }
  ];
  
  // Game-type specific assets based on your downloaded packages
  const typeSpecificAssets = {
    fps: [
      {
        id: 'char_zombie',
        name: 'Zombie Character',
        category: 'characters',
        subtype: 'enemy',
        format: '.fbx',
        tags: ['zombie', 'enemy', 'character'],
        localPath: path.join(ASSETS_DIR, 'characters/zombies/zombie.fbx')
      },
      {
        id: 'anim_zombie_attack',
        name: 'Zombie Attack Animation',
        category: 'animations',
        subtype: 'enemy',
        format: '.fbx',
        tags: ['zombie', 'attack', 'animation'],
        localPath: path.join(ASSETS_DIR, 'animations/Zombie Attack.fbx')
      },
      {
        id: 'weapon_gun',
        name: 'FPS Gun',
        category: 'weapons',
        subtype: 'firearm',
        format: '.fbx',
        tags: ['gun', 'weapon', 'fps'],
        localPath: path.join(ASSETS_DIR, 'weapons/guns/gun.fbx')
      },
      {
        id: 'audio_gun',
        name: 'Gun Sound FX',
        category: 'audio',
        subtype: 'weapon',
        format: '.wav',
        tags: ['gun', 'sound', 'weapon', 'audio'],
        localPath: path.join(ASSETS_DIR, 'audio/weapons/fog_of_war_gun_sound.wav')
      },
      {
        id: 'char_fps_controller',
        name: 'First Person Controller',
        category: 'characters',
        subtype: 'player',
        format: '.prefab',
        tags: ['player', 'controller', 'fps'],
        localPath: path.join(ASSETS_DIR, 'characters/modular_first_person_controller.prefab')
      },
      {
        id: 'env_forest',
        name: 'Forest Environment',
        category: 'environment',
        subtype: 'nature',
        format: '.prefab',
        tags: ['forest', 'nature', 'environment'],
        localPath: path.join(ASSETS_DIR, 'environments/forest/fantasy_forest_environment.prefab')
      }
    ],
    adventure: [
      {
        id: 'env_3d_game_kit',
        name: '3D Game Kit Environment',
        category: 'environment',
        subtype: 'complete',
        format: '.prefab',
        tags: ['environment', 'kit', 'adventure'],
        localPath: path.join(ASSETS_DIR, 'environments/3d_game_kit.prefab')
      },
      {
        id: 'char_3rd_person',
        name: 'Third Person Controller',
        category: 'characters',
        subtype: 'player',
        format: '.prefab',
        tags: ['player', 'controller', 'character'],
        localPath: path.join(ASSETS_DIR, 'characters/modular_first_person_controller.prefab') // We'll adapt the FPS controller
      }
    ],
    // Other game types can be added as needed
  };
  
  return [...commonAssets, ...(typeSpecificAssets[gameType] || [])];
}