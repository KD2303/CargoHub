import rateLimit from 'express-rate-limit';

// Global Limiter - 150 requests per minute
export const globalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 150, 
  standardHeaders: true, 
  legacyHeaders: false,
  message: {
    success: false,
    error: 'TOO_MANY_REQUESTS',
    message: 'Too many requests from this IP, please try again after a minute'
  }
});

// Strict Limiter - 5 requests per minute
export const strictLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'TOO_MANY_REQUESTS',
    message: 'Too many requests for this sensitive action. Please wait a minute and try again.'
  }
});
