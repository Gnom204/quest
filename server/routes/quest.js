const express = require('express');
const { createQuest, getAllQuests, deleteQuest, upload } = require('../controllers/quest');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', getAllQuests);
router.post('/', auth, upload.array('photos', 10), createQuest);
router.delete('/:id', auth, deleteQuest);

module.exports = router;