const express = require('express');
const router = express.Router();
const { triggerInterestedEmail } = require('../controllers/emailController');
const { emailRateLimiter } = require('../middleware/rateLimiter');

router.post('/interested', emailRateLimiter, triggerInterestedEmail);

module.exports = router;
