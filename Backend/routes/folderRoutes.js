const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Folder = require('../models/Folder');

// Get all folders for user
router.get('/', protect, async (req, res) => {
    const folders = await Folder.find({ user: req.user.id });
    res.json(folders);
});

// Create new folder
router.post('/', protect, async (req, res) => {
    const { name, icon } = req.body;
    const folder = await Folder.create({ user: req.user.id, name, icon });
    res.status(201).json(folder);
});

// Delete folder
router.delete('/:id', protect, async (req, res) => {
    const folder = await Folder.findById(req.params.id);
    if(folder && folder.user.toString() === req.user.id.toString()) {
        await folder.deleteOne();
        res.json({ message: 'Folder removed' });
    } else {
        res.status(404).json({ message: 'Folder not found' });
    }
});

module.exports = router;