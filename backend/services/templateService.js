// backend/services/templateService.js
const Template = require('../models/Template');
const path = require('path');
const fs = require('fs').promises;
const { createDirectoryIfNotExists } = require('../utils/fileUtils');

// Base directory for templates
const TEMPLATES_DIR = process.env.TEMPLATES_DIR || path.join(__dirname, '../../templates');

/**
 * Initialize default templates if none exist
 */
exports.initializeDefaultTemplates = async () => {
  try {
    // Check if templates exist
    const templatesCount = await Template.countDocuments();
    
    if (templatesCount === 0) {
      console.log('No templates found. Creating default templates...');
      
      // Create default templates
      const defaultTemplates = getDefaultTemplateData();
      
      for (const templateData of defaultTemplates) {
        // Create template directory
        const templateDir = path.join(TEMPLATES_DIR, templateData.type);
        await createDirectoryIfNotExists(templateDir);
        
        // Create mock template files
        await createMockTemplateFiles(templateDir, templateData.type);
        
        // Create template record
        const template = new Template({
          ...templateData,
          templatePath: templateDir
        });
        
        await template.save();
      }
      
      console.log(`Created ${defaultTemplates.length} default templates`);
    }
  } catch (error) {
    console.error('Error initializing default templates:', error);
  }
};

/**
 * Get template by type
 * @param {string} type - Template type
 * @returns {Promise<Object>} - Template
 */
exports.getTemplateByType = async (type) => {
  try {
    return await Template.findOne({ type });
  } catch (error) {
    console.error('Error getting template by type:', error);
    throw new Error('Failed to get template');
  }
};

/**
 * Get all templates
 * @returns {Promise<Array>} - List of templates
 */
exports.getAllTemplates = async () => {
  try {
    return await Template.find().sort({ type: 1 });
  } catch (error) {
    console.error('Error getting templates:', error);
    throw new Error('Failed to get templates');
  }
};

/**
 * Create a new template
 * @param {Object} templateData - Template data
 * @returns {Promise<Object>} - Created template
 */
exports.createTemplate = async (templateData) => {
  try {
    // Create template directory
    const templateDir = path.join(TEMPLATES_DIR, templateData.type);
    await createDirectoryIfNotExists(templateDir);
    
    // Create template
    const template = new Template({
      ...templateData,
      templatePath: templateDir
    });
    
    await template.save();
    
    return template;
  } catch (error) {
    console.error('Error creating template:', error);
    throw new Error('Failed to create template');
  }
};

/**
 * Update a template
 * @param {string} templateId - Template ID
 * @param {Object} updates - Updates to apply
 * @returns {Promise<Object>} - Updated template
 */
exports.updateTemplate = async (templateId, updates) => {
  try {
    return await Template.findByIdAndUpdate(
      templateId,
      updates,
      { new: true, runValidators: true }
    );
  } catch (error) {
    console.error('Error updating template:', error);
    throw new Error('Failed to update template');
  }
};

/**
 * Delete a template
 * @param {string} templateId - Template ID
 * @returns {Promise<boolean>} - Success status
 */
exports.deleteTemplate = async (templateId) => {
  try {
    const template = await Template.findById(templateId);
    
    if (!template) {
      throw new Error('Template not found');
    }
    
    // Delete template directory
    try {
      await fs.rmdir(template.templatePath, { recursive: true });
    } catch (error) {
      console.error(`Error deleting template directory: ${error}`);
      // Continue even if directory deletion fails
    }
    
    // Delete template record
    await Template.findByIdAndDelete(templateId);
    
    return true;
  } catch (error) {
    console.error('Error deleting template:', error);
    throw new Error('Failed to delete template');
  }
};

/**
 * Get default template data
 * @returns {Array} - Default template data
 */
function getDefaultTemplateData() {
  return [
    {
      name: 'FPS Template',
      description: 'A first-person shooter template with basic shooting mechanics',
      type: 'fps',
      features: [
        { name: 'First Person Controller', description: 'Character controller with camera' },
        { name: 'Weapon System', description: 'Basic weapon system with reloading' },
        { name: 'Enemy AI', description: 'Simple enemy AI with pathfinding' }
      ]
    },
    {
      name: 'Adventure Template',
      description: 'A third-person adventure template with exploration mechanics',
      type: 'adventure',
      features: [
        { name: 'Third Person Controller', description: 'Character controller with camera' },
        { name: 'Inventory System', description: 'Basic inventory for items' },
        { name: 'Dialog System', description: 'Simple dialog system for NPCs' }
      ]
    },
    {
      name: 'Puzzle Template',
      description: 'A puzzle game template with basic interaction mechanics',
      type: 'puzzle',
      features: [
        { name: 'Puzzle Framework', description: 'Core puzzle mechanics' },
        { name: 'Interaction System', description: 'System for interacting with objects' },
        { name: 'Hint System', description: 'Basic hint system for puzzles' }
      ]
    },
    {
      name: 'Racing Template',
      description: 'A racing game template with vehicle physics',
      type: 'racing',
      features: [
        { name: 'Vehicle Physics', description: 'Realistic vehicle physics' },
        { name: 'Track System', description: 'Track with checkpoints' },
        { name: 'Race Manager', description: 'System for managing races' }
      ]
    },
    {
      name: 'Platformer Template',
      description: 'A 2D platformer template with basic movement mechanics',
      type: 'platformer',
      features: [
        { name: 'Character Controller', description: '2D character controller with jumping' },
        { name: 'Collectible System', description: 'System for collecting items' },
        { name: 'Level Manager', description: 'System for managing levels' }
      ]
    }
  ];
}

/**
 * Create mock template files
 * @param {string} templateDir - Template directory
 * @param {string} templateType - Template type
 */
async function createMockTemplateFiles(templateDir, templateType) {
  // Create README file
  const readmeContent = `# ${templateType.toUpperCase()} Template\n\nThis is a mock template for ${templateType} games.`;
  await fs.writeFile(path.join(templateDir, 'README.md'), readmeContent);
  
  // Create mock Unity project structure
  const assetsDir = path.join(templateDir, 'Assets');
  await createDirectoryIfNotExists(assetsDir);
  
  // Create mock script files
  const scriptsDir = path.join(assetsDir, 'Scripts');
  await createDirectoryIfNotExists(scriptsDir);
  
  // Create mock scripts based on template type
  const scriptFiles = getTemplateScripts(templateType);
  
  for (const [filename, content] of Object.entries(scriptFiles)) {
    await fs.writeFile(path.join(scriptsDir, filename), content);
  }
}

/**
 * Get template scripts based on template type
 * @param {string} templateType - Template type
 * @returns {Object} - Script files with their content
 */
function getTemplateScripts(templateType) {
  const commonScripts = {
    'GameManager.cs': `
using UnityEngine;

public class GameManager : MonoBehaviour
{
    public static GameManager Instance { get; private set; }
    
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
    
    // Common game management code
}`,
    'UIManager.cs': `
using UnityEngine;
using UnityEngine.UI;

public class UIManager : MonoBehaviour
{
    // UI management code
}`
  };
  
  const templateSpecificScripts = {
    fps: {
      'PlayerController.cs': `
using UnityEngine;

public class PlayerController : MonoBehaviour
{
    // FPS player controller code
}`,
      'WeaponSystem.cs': `
using UnityEngine;

public class WeaponSystem : MonoBehaviour
{
    // Weapon system code
}`
    },
    adventure: {
      'ThirdPersonController.cs': `
using UnityEngine;

public class ThirdPersonController : MonoBehaviour
{
    // Third-person controller code
}`,
      'InventorySystem.cs': `
using UnityEngine;

public class InventorySystem : MonoBehaviour
{
    // Inventory system code
}`
    },
    puzzle: {
      'PuzzleManager.cs': `
using UnityEngine;

public class PuzzleManager : MonoBehaviour
{
    // Puzzle management code
}`,
      'InteractionSystem.cs': `
using UnityEngine;

public class InteractionSystem : MonoBehaviour
{
    // Interaction system code
}`
    },
    racing: {
      'VehicleController.cs': `
using UnityEngine;

public class VehicleController : MonoBehaviour
{
    // Vehicle controller code
}`,
      'RaceManager.cs': `
using UnityEngine;

public class RaceManager : MonoBehaviour
{
    // Race management code
}`
    },
    platformer: {
      'PlatformerController.cs': `
using UnityEngine;

public class PlatformerController : MonoBehaviour
{
    // 2D platformer controller code
}`,
      'LevelManager.cs': `
using UnityEngine;

public class LevelManager : MonoBehaviour
{
    // Level management code
}`
    }
  };
  
  return {
    ...commonScripts,
    ...(templateSpecificScripts[templateType] || {})
  };
}