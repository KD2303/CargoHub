// ============================================================================
// CORS Configuration — Allow all three frontends
// ============================================================================

import type { CorsOptions } from 'cors';

const allowedOrigins = [
  process.env.WEBSITE_URL || 'http://localhost:3000',
  process.env.WEBSITE_URL_LOCAL || 'http://localhost:3000',
  'http://localhost:4000',
  'http://localhost:4001',
  'capacitor://localhost',
  'ionic://localhost',
  'https://cargo-hub1.vercel.app',
  'https://cargo-hub-customer-portal-six.vercel.app'
];

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow mobile apps (no origin header) + whitelisted web origins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Platform', 'X-App-Version'],
};
