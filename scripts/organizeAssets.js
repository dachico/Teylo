// scripts/organizeAssets.js
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

// Base directory for assets
const ASSETS_DIR = process.env.ASSETS_DIR || 'D:/TeyloAssets';

/**
 * Creates necessary directories and organizes assets for the AI Game Generator
 */
async function organizeAssets() {
  console.log('Starting asset organization process...');
  
  // Step 1: Create base directories
  const directories = [
    'characters/zombies',
    'characters/humans',
    'weapons/guns',
    'weapons/melee',
    'environments/forest',
    'environments/urban',
    'animations',
    'audio/weapons',
    'audio/ambient',
    'audio/characters',
    'ui',
    'templates/fps',
    'templates/adventure',
    'metadata'
  ];
  
  console.log('Creating directories...');
  for (const dir of directories) {
    const dirPath = path.join(ASSETS_DIR, dir);
    try {
      await fs.mkdir(dirPath, { recursive: true });
      console.log(`Created directory: ${dirPath}`);
    } catch (error) {
      if (error.code !== 'EEXIST') {
        console.error(`Error creating directory ${dirPath}:`, error);
      } else {
        console.log(`Directory already exists: ${dirPath}`);
      }
    }
  }
  
  // Step 2: Create placeholder files for asset types
  const assetPlaceholders = [
    {
      path: 'characters/zombies/README.md',
      content: '# Zombie Characters\n\nPlace zombie character files in this directory.\n\nRecommended assets: Unity Asset Store "Zombie" package'
    },
    {
      path: 'weapons/guns/README.md',
      content: '# Gun Assets\n\nPlace gun model files in this directory.\n\nRecommended assets: Unity Asset Store gun pack'
    },
    {
      path: 'environments/forest/README.md',
      content: '# Forest Environment\n\nPlace forest environment assets in this directory.\n\nRecommended assets: Unity Asset Store "Fantasy Forest Environment" package'
    },
    {
      path: 'ui/README.md',
      content: '# UI Assets\n\nPlace UI asset files in this directory.\n\nRecommended assets: Unity Asset Store "Simple UI Kit"'
    },
    {
      path: 'audio/weapons/README.md',
      content: '# Weapon Audio\n\nPlace weapon sound effect files in this directory.\n\nRecommended assets: Unity Asset Store "Fog of War Gun Sound FX" package'
    },
    {
      path: 'animations/README.md',
      content: '# Animation Assets\n\nPlace animation files in this directory.\n\nRecommended assets: Zombie Attack animation from Mixamo'
    },
    {
      path: 'templates/fps/README.md',
      content: '# FPS Template\n\nCreate a basic Unity FPS template project here.\n\nMake sure to include:\n1. A main scene\n2. The BuildScript.cs in the Editor folder\n3. Basic player controller setup'
    },
    {
      path: 'templates/adventure/README.md',
      content: '# Adventure Template\n\nCreate a basic Unity adventure template project here.\n\nRecommended base: Unity Asset Store "3D Game Kit"'
    }
  ];
  
  console.log('Creating placeholder files...');
  for (const placeholder of assetPlaceholders) {
    const filePath = path.join(ASSETS_DIR, placeholder.path);
    try {
      await fs.writeFile(filePath, placeholder.content);
      console.log(`Created placeholder: ${filePath}`);
    } catch (error) {
      console.error(`Error creating placeholder ${filePath}:`, error);
    }
  }
  
  // Step 3: Create sample metadata files for your downloaded assets
  const sampleMetadata = [
    {
      id: 'char_zombie_001',
      name: 'Zombie Character',
      type: 'characters',
      subtype: 'enemy',
      format: '.fbx',
      polyCount: 4500,
      textureResolution: '2048x2048',
      tags: ['zombie', 'enemy', 'undead', 'character'],
      gameTypes: ['fps', 'adventure'],
      localPath: path.join(ASSETS_DIR, 'characters/zombies/zombie.fbx').replace(/\\/g, '/'),
      source: 'Unity Asset Store',
      license: 'Unity Store Free',
      version: 1
    },
    {
      id: 'weapon_gun_001',
      name: 'FPS Gun',
      type: 'weapons',
      subtype: 'firearm',
      format: '.fbx',
      polyCount: 3200,
      textureResolution: '2048x2048',
      tags: ['gun', 'weapon', 'firearm', 'fps'],
      gameTypes: ['fps'],
      localPath: path.join(ASSETS_DIR, 'weapons/guns/gun.fbx').replace(/\\/g, '/'),
      source: 'Unity Asset Store',
      license: 'Unity Store Free',
      version: 1
    },
    {
      id: 'env_forest_001',
      name: 'Fantasy Forest Environment',
      type: 'environment',
      subtype: 'nature',
      format: '.prefab',
      polyCount: 12000,
      textureResolution: '4096x4096',
      tags: ['forest', 'environment', 'nature', 'trees'],
      gameTypes: ['fps', 'adventure'],
      localPath: path.join(ASSETS_DIR, 'environments/forest/fantasy_forest_environment.prefab').replace(/\\/g, '/'),
      source: 'Unity Asset Store',
      license: 'Unity Store Free',
      version: 1
    },
    {
      id: 'anim_zombie_attack_001',
      name: 'Zombie Attack Animation',
      type: 'animations',
      subtype: 'enemy',
      format: '.fbx',
      tags: ['zombie', 'attack', 'animation', 'enemy'],
      gameTypes: ['fps', 'adventure'],
      localPath: path.join(ASSETS_DIR, 'animations/Zombie Attack.fbx').replace(/\\/g, '/'),
      source: 'Mixamo',
      license: 'Mixamo Free',
      version: 1
    },
    {
      id: 'audio_gun_001',
      name: 'Gun Sound FX',
      type: 'audio',
      subtype: 'weapon',
      format: '.wav',
      tags: ['gun', 'sound', 'weapon', 'audio', 'fps'],
      gameTypes: ['fps'],
      localPath: path.join(ASSETS_DIR, 'audio/weapons/fog_of_war_gun_sound.wav').replace(/\\/g, '/'),
      source: 'Unity Asset Store',
      license: 'Unity Store Free',
      version: 1
    },
    {
      id: 'ui_simple_kit_001',
      name: 'Simple UI Kit',
      type: 'ui',
      subtype: 'interface',
      format: '.prefab',
      textureResolution: '2048x2048',
      tags: ['ui', 'interface', 'buttons', 'menu'],
      gameTypes: ['fps', 'adventure', 'puzzle', 'racing', 'platformer'],
      localPath: path.join(ASSETS_DIR, 'ui/simple_ui_kit.prefab').replace(/\\/g, '/'),
      source: 'Unity Asset Store',
      license: 'Unity Store Free',
      version: 1
    },
    {
      id: 'char_fps_controller_001',
      name: 'FPS Controller',
      type: 'characters',
      subtype: 'player',
      format: '.prefab',
      tags: ['controller', 'player', 'fps', 'character'],
      gameTypes: ['fps'],
      localPath: path.join(ASSETS_DIR, 'characters/modular_first_person_controller.prefab').replace(/\\/g, '/'),
      source: 'Unity Asset Store',
      license: 'Unity Store Free',
      version: 1
    },
    {
      id: 'env_3d_game_kit_001',
      name: '3D Game Kit',
      type: 'environment',
      subtype: 'complete',
      format: '.prefab',
      polyCount: 25000,
      textureResolution: '4096x4096',
      tags: ['environment', 'adventure', 'complete', 'game kit'],
      gameTypes: ['adventure'],
      localPath: path.join(ASSETS_DIR, 'templates/adventure/3d_game_kit.prefab').replace(/\\/g, '/'),
      source: 'Unity Asset Store',
      license: 'Unity Store Free',
      version: 1
    }
  ];
  
  console.log('Creating metadata files...');
  const metadataDir = path.join(ASSETS_DIR, 'metadata');
  for (const metadata of sampleMetadata) {
    const filePath = path.join(metadataDir, `${metadata.id}.json`);
    try {
      await fs.writeFile(filePath, JSON.stringify(metadata, null, 2));
      console.log(`Created metadata: ${filePath}`);
    } catch (error) {
      console.error(`Error creating metadata ${filePath}:`, error);
    }
  }
  
  // Step 4: Create Unity build script template
  const buildScriptTemplate = `// Unity Editor/BuildScript.cs
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
  
  const fpsBuildScriptPath = path.join(ASSETS_DIR, 'templates/fps/Editor');
  await fs.mkdir(fpsBuildScriptPath, { recursive: true });
  await fs.writeFile(path.join(fpsBuildScriptPath, 'BuildScript.cs'), buildScriptTemplate);
  console.log(`Created Unity build script template at: ${fpsBuildScriptPath}/BuildScript.cs`);
  
  const adventureBuildScriptPath = path.join(ASSETS_DIR, 'templates/adventure/Editor');
  await fs.mkdir(adventureBuildScriptPath, { recursive: true });
  await fs.writeFile(path.join(adventureBuildScriptPath, 'BuildScript.cs'), buildScriptTemplate);
  console.log(`Created Unity build script template at: ${adventureBuildScriptPath}/BuildScript.cs`);
  
  // Step 5: Create a README file with instructions
  const readmeContent = `# AI Game Generator Asset Directory

This directory contains the assets for the AI Game Generator project.

## Structure

- \`characters/\` - Character models and controllers
- \`weapons/\` - Weapon models and assets
- \`environments/\` - Environment assets and scenes
- \`animations/\` - Animation files
- \`audio/\` - Audio files
- \`ui/\` - UI assets
- \`templates/\` - Unity project templates for different game types
- \`metadata/\` - Metadata files for assets

## Adding New Assets

1. Place the asset files in the appropriate directories
2. Create a metadata JSON file in the \`metadata/\` directory with the following format:

\`\`\`json
{
  "id": "unique_asset_id",
  "name": "Asset Name",
  "type": "category",
  "subtype": "subcategory",
  "format": ".extension",
  "tags": ["tag1", "tag2"],
  "gameTypes": ["fps", "adventure", "etc"],
  "localPath": "D:/TeyloAssets/category/subcategory/filename.ext",
  "source": "Source",
  "license": "License",
  "version": 1
}
\`\`\`

## Unity Templates

Each template in the \`templates/\` directory should:

1. Have a basic scene setup
2. Include the BuildScript.cs in an Editor folder
3. Have basic game-specific prefabs and scripts

## Testing

Use the \`testPrompt.js\` script to test the prompt-to-game generation with your assets:

\`\`\`
node scripts/testPrompt.js
\`\`\`
`;
  
  await fs.writeFile(path.join(ASSETS_DIR, 'README.md'), readmeContent);
  console.log(`Created README at: ${ASSETS_DIR}/README.md`);
  
  console.log('\nAsset organization complete!');
  console.log(`
Next steps:
1. Copy your Unity assets to the appropriate directories
2. Create a basic Unity template project for each game type
3. Run the metadata generator or manually update the metadata files
4. Test the system using the testPrompt.js script
`);
}

// Run the organization function
organizeAssets().catch(error => {
  console.error('Error organizing assets:', error);
});