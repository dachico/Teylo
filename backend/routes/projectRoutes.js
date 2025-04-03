const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { authMiddleware } = require('../middleware/auth');

// Protect all routes
router.use(authMiddleware);

// CREATE: Create a new game project
router.post('/', projectController.createProject);

// READ: Get all projects for logged in user
router.get('/', projectController.getUserProjects);

// READ: Get a single project
router.get('/:id', projectController.getProject);

// UPDATE: Update a project
router.put('/:id', projectController.updateProject);

// DELETE: Delete a project
router.delete('/:id', projectController.deleteProject);

// BUILD: Start building a game
router.post('/:id/build', projectController.buildGame);

// STATUS: Get build status
router.get('/build/:buildId', projectController.getBuildStatus);

module.exports = router;