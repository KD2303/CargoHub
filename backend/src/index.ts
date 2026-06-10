// ============================================================================
// CargoHub — Backend Entry Point
// Express + Socket.io server serving Android, iOS, and Website
// ============================================================================

import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import { Server as SocketServer } from 'socket.io';
import type { ClientToServerEvents, ServerToClientEvents } from './shared';

import { corsOptions } from './config/cors';
import { platformMiddleware } from './middlewares/platform.middleware';
import { errorHandler } from './middlewares/error.middleware';
import { arcjetMiddleware } from './middlewares/security.middleware';
import { globalLimiter } from './middlewares/rateLimit.middleware';
import { initSentry } from './config/services';

// Initialize Sentry early
initSentry();

// Routes
import authRoutes from './api/auth.routes';
import bookingRoutes from './api/booking.routes';
import driverRoutes from './api/driver.routes';
import fareRoutes from './api/fare.routes';
import paymentRoutes from './api/payment.routes';
import ratingRoutes from './api/rating.routes';
import supportRoutes from './api/support.routes';
import adminRoutes from './api/admin.routes';
import businessRoutes from './api/business.routes';
import aiRoutes from './api/ai.routes';

// Socket
import { setupSocketHandlers } from './sockets';

const app = express();
const httpServer = createServer(app);

// ── Socket.io Setup ─────────────────────────────────────────────────────────

const io = new SocketServer<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: [
      process.env.WEBSITE_URL || 'http://localhost:3000',
      process.env.WEBSITE_URL_LOCAL || 'http://localhost:3000',
    ],
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

// Make io accessible to controllers
app.set('io', io);

// ── Global Middleware ────────────────────────────────────────────────────────

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(globalLimiter); // Native fallback rate limiting
app.use(arcjetMiddleware); // Rate limiting and bot protection (if key provided)
app.use(platformMiddleware);

// Serve static files for testing UI
app.use(express.static('public'));

// ── Health Check ─────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'CargoHub API',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ── API Routes ───────────────────────────────────────────────────────────────

app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/fare', fareRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/ai', aiRoutes);

// ── 404 Handler ──────────────────────────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: 'NOT_FOUND',
    message: 'The requested endpoint does not exist.',
  });
});

// ── Error Handler ────────────────────────────────────────────────────────────

app.use(errorHandler);

// ── Socket.io Handlers ──────────────────────────────────────────────────────

setupSocketHandlers(io);

// ── Start Server ─────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════════════════╗
  ║                                                   ║
  ║   🚛  CargoHub — Backend API                ║
  ║                                                   ║
  ║   Server:    http://localhost:${PORT}               ║
  ║   Socket.io: ws://localhost:${PORT}                ║
  ║   Health:    http://localhost:${PORT}/health        ║
  ║                                                   ║
  ║   Environment: ${process.env.NODE_ENV || 'development'}              ║
  ║                                                   ║
  ╚═══════════════════════════════════════════════════╝
  `);
});

export { app, io };
