const express = require('express');
const router = express.Router();
const { createPart, getParts, getPartById, updatePart, deletePart, getAnalytics, importParts } = require('../controllers/partController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All part routes are protected

router.route('/')
    .get(getParts)
    .post(createPart);

router.post('/import', importParts);

router.get('/analytics', getAnalytics);

router.route('/:id')
    .get(getPartById)
    .put(updatePart)
    .delete(deletePart);

module.exports = router;
