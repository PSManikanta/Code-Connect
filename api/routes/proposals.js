const express = require('express');
const router = express.Router();
const { createProposal, getAllProposals, getUserProposals, updateProposal } = require('../controllers/proposalController');
const authenticateToken = require('../middleware/authMiddleware');

router.get('/', getAllProposals); // Open to all or can be restricted
router.get('/me', authenticateToken, getUserProposals); // Get user's own proposals
router.post('/', authenticateToken, createProposal); // Protected route
router.put('/:id', authenticateToken, updateProposal); // Edit proposal

module.exports = router;
