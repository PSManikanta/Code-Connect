const rateLimit = require('express-rate-limit');

// Limit requests for the email trigger endpoint
const emailRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 email requests per windowMs
  message: {
    error: 'Too many emails sent from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true, 
  legacyHeaders: false,
});

module.exports = { emailRateLimiter };
