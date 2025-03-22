const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');
const verifyJwt = require('../middleware/verifyJwt');

// Apply JWT verification middleware to all routes
router.use(verifyJwt);

// IMPORTANT: Order matters in Express routes
// The most specific routes should come first

// GET routes with explicit paths (no params)
router.get('/search-notes', noteController.searchNotes); // Change to a clearer path
router.get('/category/my-day', noteController.getMyDayNotes);
router.get('/category/important', noteController.getImportantNotes);
router.get('/category/planned', noteController.getPlannedNotes);
router.get('/', noteController.getAllNotes);

// POST routes
router.post('/', noteController.createNote);

// Routes with parameters always come last
router.get('/:id', noteController.getNoteById);
router.put('/:id', noteController.updateNote);
router.delete('/:id', noteController.deleteNote);

module.exports = router;