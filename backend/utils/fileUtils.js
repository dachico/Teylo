// backend/utils/fileUtils.js
const fs = require('fs').promises;
const path = require('path');

/**
 * Create a directory if it doesn't exist
 * @param {string} dirPath - Path to the directory
 * @returns {Promise<void>}
 */
exports.createDirectoryIfNotExists = async (dirPath) => {
  try {
    await fs.access(dirPath);
  } catch (error) {
    // Directory doesn't exist, create it
    await fs.mkdir(dirPath, { recursive: true });
  }
};

/**
 * Save file to disk
 * @param {Buffer|string} data - File data
 * @param {string} filePath - Path to save the file
 * @returns {Promise<string>} - Path to the saved file
 */
exports.saveFile = async (data, filePath) => {
  try {
    // Create directory if it doesn't exist
    const directory = path.dirname(filePath);
    await exports.createDirectoryIfNotExists(directory);
    
    // Write file
    await fs.writeFile(filePath, data);
    
    return filePath;
  } catch (error) {
    console.error('Error saving file:', error);
    throw new Error(`Failed to save file: ${error.message}`);
  }
};

/**
 * Delete file
 * @param {string} filePath - Path to the file
 * @returns {Promise<boolean>} - Success status
 */
exports.deleteFile = async (filePath) => {
  try {
    await fs.unlink(filePath);
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

/**
 * Check if file exists
 * @param {string} filePath - Path to the file
 * @returns {Promise<boolean>} - True if file exists
 */
exports.fileExists = async (filePath) => {
  try {
    await fs.access(filePath);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Read file content
 * @param {string} filePath - Path to the file
 * @returns {Promise<Buffer>} - File content
 */
exports.readFile = async (filePath) => {
  try {
    return await fs.readFile(filePath);
  } catch (error) {
    console.error('Error reading file:', error);
    throw new Error(`Failed to read file: ${error.message}`);
  }
};

/**
 * List files in directory
 * @param {string} dirPath - Path to the directory
 * @returns {Promise<string[]>} - Array of file names
 */
exports.listFiles = async (dirPath) => {
  try {
    return await fs.readdir(dirPath);
  } catch (error) {
    console.error('Error listing files:', error);
    throw new Error(`Failed to list files: ${error.message}`);
  }
};

/**
 * Copy file
 * @param {string} sourcePath - Source file path
 * @param {string} destinationPath - Destination file path
 * @returns {Promise<string>} - Destination path
 */
exports.copyFile = async (sourcePath, destinationPath) => {
  try {
    // Create destination directory if it doesn't exist
    const directory = path.dirname(destinationPath);
    await exports.createDirectoryIfNotExists(directory);
    
    // Copy file
    await fs.copyFile(sourcePath, destinationPath);
    
    return destinationPath;
  } catch (error) {
    console.error('Error copying file:', error);
    throw new Error(`Failed to copy file: ${error.message}`);
  }
};

/**
 * Create a temporary directory
 * @param {string} prefix - Prefix for directory name
 * @returns {Promise<string>} - Path to the temporary directory
 */
exports.createTempDirectory = async (prefix = 'temp') => {
  try {
    const tempDir = path.join(os.tmpdir(), `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`);
    await exports.createDirectoryIfNotExists(tempDir);
    return tempDir;
  } catch (error) {
    console.error('Error creating temporary directory:', error);
    throw new Error(`Failed to create temporary directory: ${error.message}`);
  }
};