// backend/services/promptService.js
const axios = require('axios');
require('dotenv').config();

// Gemini API key from environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

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
    
    // Generate game design document
    const gameDesign = await generateGameDesign(prompt, gameType);
    console.log('Generated game design');
    
    return {
      ...gameDesign,
      gameType,
      suggestedName: gameDesign.gameName || generateGameName(prompt, gameType)
    };
  } catch (error) {
    console.error('Error processing game prompt:', error);
    // If AI fails, fall back to basic implementation
    return fallbackGameDesign(prompt);
  }
};

/**
 * Detect the game type from a prompt using Gemini API
 * @param {string} prompt - User's game description
 * @returns {string} - Detected game type
 */
async function detectGameType(prompt) {
  try {
    if (!GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY not found, using fallback detection');
      return fallbackDetectGameType(prompt);
    }
    
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
    
  } catch (error) {
    console.error('Error detecting game type with AI:', error);
    return fallbackDetectGameType(prompt);
  }
}

/**
 * Generate a game design document from a prompt using Gemini API
 * @param {string} prompt - User's game description
 * @param {string} gameType - Detected game type
 * @returns {Object} - Game design document
 */
async function generateGameDesign(prompt, gameType) {
  try {
    if (!GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY not found, using fallback game design generation');
      return fallbackGenerateGameDesign(prompt, gameType);
    }
    
    const designPrompt = `
    You are a game design expert. Create a detailed game design document for a ${gameType} game based on this description: "${prompt}"
    
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
          "description": "Description of the character"
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
    
    Include at least 3 items in each array. The response must be ONLY valid JSON without any additional text.`;
    
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
    
    // Extract JSON from response (in case the AI added additional text)
    const jsonMatch = resultText.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : resultText;
    
    try {
      return JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Error parsing JSON from AI:', parseError);
      console.log('Received result:', resultText);
      return fallbackGenerateGameDesign(prompt, gameType);
    }
    
  } catch (error) {
    console.error('Error generating game design with AI:', error);
    return fallbackGenerateGameDesign(prompt, gameType);
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
  
  if (promptLower.includes('shooter') || promptLower.includes('fps') || promptLower.includes('first person')) {
    return 'fps';
  } else if (promptLower.includes('adventure') || promptLower.includes('exploration')) {
    return 'adventure';
  } else if (promptLower.includes('puzzle') || promptLower.includes('solving')) {
    return 'puzzle';
  } else if (promptLower.includes('racing') || promptLower.includes('cars') || promptLower.includes('drive')) {
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
 * @returns {Object} - Game design document
 */
function fallbackGenerateGameDesign(prompt, gameType) {
  const gameName = generateGameName(prompt, gameType);
  
  return {
    gameName,
    description: prompt,
    genre: gameTypeToGenre(gameType),
    setting: extractSetting(prompt),
    characters: extractCharacters(prompt),
    mechanics: generateMechanics(gameType),
    levels: generateLevels(gameType),
    assets: generateAssetsList(gameType),
    userInterface: generateUI(gameType)
  };
}

/**
 * Fallback game design for when AI fails completely
 * @param {string} prompt - User's game description
 * @returns {Object} - Basic game design
 */
function fallbackGameDesign(prompt) {
  const gameType = fallbackDetectGameType(prompt);
  const gameName = generateGameName(prompt, gameType);
  
  return {
    gameName,
    description: prompt,
    gameType,
    genre: gameTypeToGenre(gameType),
    setting: extractSetting(prompt),
    characters: extractCharacters(prompt),
    mechanics: generateMechanics(gameType),
    levels: generateLevels(gameType),
    assets: generateAssetsList(gameType),
    userInterface: generateUI(gameType)
  };
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
    nature: prompt.toLowerCase().includes('forest') || prompt.toLowerCase().includes('mountain')
  };
  
  const detectedSettings = Object.entries(settings)
    .filter(([_, detected]) => detected)
    .map(([setting, _]) => setting);
  
  const primarySetting = detectedSettings.length > 0 ? 
    detectedSettings[0] : 
    'fantasy';
  
  return {
    type: primarySetting,
    description: `A ${primarySetting} setting based on the user's description`
  };
}

/**
 * Extract characters from prompt
 * @param {string} prompt 
 * @returns {Array} - Character information
 */
function extractCharacters(prompt) {
  // In a real implementation, you would use NLP or AI to extract characters
  return [
    {
      type: 'player',
      description: 'Main player character'
    },
    {
      type: 'npc',
      description: 'Non-player characters that provide information'
    },
    {
      type: 'enemy',
      description: 'Basic enemy characters that challenge the player'
    }
  ];
}

/**
 * Generate mechanics based on game type
 * @param {string} gameType 
 * @returns {Array} - Game mechanics
 */
function generateMechanics(gameType) {
  const mechanicsByType = {
    fps: ['First-person camera', 'Shooting', 'Weapon switching', 'Health system'],
    adventure: ['Exploration', 'Dialogue', 'Inventory', 'Quests'],
    puzzle: ['Object manipulation', 'Logic puzzles', 'Progression gates', 'Hints system'],
    racing: ['Vehicle control', 'Speed boost', 'Track navigation', 'Lap timing'],
    platformer: ['Jumping', 'Collectibles', 'Obstacles', 'Power-ups']
  };
  
  return mechanicsByType[gameType] || ['Movement', 'Interaction', 'Objectives'];
}

/**
 * Generate level concepts based on game type
 * @param {string} gameType 
 * @returns {Array} - Level concepts
 */
function generateLevels(gameType) {
  return [
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
 * Generate assets list based on game type
 * @param {string} gameType 
 * @returns {Object} - Assets categories and examples
 */
function generateAssetsList(gameType) {
  const commonAssets = {
    environment: ['Terrain', 'Sky', 'Props'],
    audio: ['Background music', 'Sound effects', 'Voice acting'],
    visual: ['Particle effects', 'UI elements', 'Textures']
  };
  
  const typeSpecificAssets = {
    fps: {
      weapons: ['Pistol', 'Rifle', 'Shotgun'],
      enemies: ['Basic enemy', 'Elite enemy', 'Boss']
    },
    adventure: {
      items: ['Keys', 'Scrolls', 'Potions'],
      npcs: ['Shopkeeper', 'Quest Giver', 'Guide']
    },
    puzzle: {
      puzzleElements: ['Levers', 'Buttons', 'Movable objects'],
      feedback: ['Success indicators', 'Failure indicators', 'Hints']
    },
    racing: {
      vehicles: ['Basic car', 'Sports car', 'Off-road vehicle'],
      tracks: ['City track', 'Desert track', 'Mountain track']
    },
    platformer: {
      obstacles: ['Gaps', 'Moving platforms', 'Spikes'],
      collectibles: ['Coins', 'Power-ups', 'Special items']
    }
  };
  
  return {
    ...commonAssets,
    ...(typeSpecificAssets[gameType] || {})
  };
}

/**
 * Generate UI elements based on game type
 * @param {string} gameType 
 * @returns {Array} - UI elements
 */
function generateUI(gameType) {
  const commonUI = ['Main menu', 'Pause menu', 'Settings'];
  
  const typeSpecificUI = {
    fps: ['Health bar', 'Ammo counter', 'Crosshair', 'Minimap'],
    adventure: ['Inventory screen', 'Dialog UI', 'Quest log', 'Map'],
    puzzle: ['Hint system', 'Timer', 'Move counter', 'Restart button'],
    racing: ['Speedometer', 'Lap counter', 'Position indicator', 'Race timer'],
    platformer: ['Health/Lives', 'Score counter', 'Collectible counter', 'Level progress']
  };
  
  return [...commonUI, ...(typeSpecificUI[gameType] || [])];
}