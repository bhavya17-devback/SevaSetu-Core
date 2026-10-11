const rateLimit = require('express-rate-limit');

// General API Limiter (100 requests per 15 mins)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Too many requests from this IP, please try again after 15 minutes.' }
});

// Auth Routes Limiter (10 login/register attempts per 15 mins)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many login attempts, please try again after 15 minutes.' }
});

module.exports = { apiLimiter, authLimiter };