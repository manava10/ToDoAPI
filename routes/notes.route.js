const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const noteController = require('../controllers/notes.controllers');
router.use(auth);
router.post("/create",noteController.createNote);
router.get("/getNotes",noteController.getNotes);

module.exports = router;
