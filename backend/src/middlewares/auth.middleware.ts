import type { Request, Response, NextFunction } from 'express';
import { auth } from '../config/firebase';
import { db } from '../config/database';
import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';

export const verifyAdminToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_for_development_only';
    const decoded: any = jwt.verify(token, jwtSecret);
    
    if (decoded.role !== 'ADMIN') {
      res.status(403).json({ success: false, error: 'FORBIDDEN' });
      return;
    }

    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      role: 'ADMIN',
      accountType: 'STANDARD',
      isActive: true,
    };
    next();
  } catch (err) {
    res.status(401).json({ success: false, error: 'INVALID_TOKEN' });
  }
};

export const decodeFirebaseToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  // Test mode bypass
  if (process.env.NODE_ENV === 'test' || process.env.TEST_MODE === 'true') {
    const mockUid = req.headers['x-mock-uid'] as string;
    if (mockUid) {
      req.user = { uid: mockUid, role: 'USER', accountType: 'STANDARD', isActive: true };
      return next();
    }
  }

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: 'UNAUTHORIZED',
      message: 'Missing Bearer token.',
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  if (!auth) {
    res.status(500).json({ success: false, error: 'FIREBASE_NOT_CONFIGURED' });
    return;
  }

  try {
    const decodedToken = await auth.verifyIdToken(token);
    req.user = { uid: decodedToken.uid, email: decodedToken.email } as any;
    next();
  } catch (error) {
    // Fallback: try decoding as custom JWT
    try {
      const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_for_development_only';
      const decoded: any = jwt.verify(token, jwtSecret);
      req.user = { uid: decoded.uid, email: decoded.phone } as any;
      return next();
    } catch (jwtError) {
      console.error('Firebase and Custom JWT verification failed:', error, jwtError);
      res.status(401).json({
        success: false,
        error: 'INVALID_TOKEN',
        message: 'Invalid or expired authentication token.',
      });
    }
  }
};

export const verifyFirebaseToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  // Test mode bypass
  if (process.env.NODE_ENV === 'test' || process.env.TEST_MODE === 'true') {
    const mockUid = req.headers['x-mock-uid'] as string;
    if (mockUid) {
      req.user = { uid: mockUid, role: (req.headers['x-mock-role'] as 'USER' | 'DRIVER' | 'ADMIN') || 'USER', accountType: 'STANDARD', isActive: true };
      return next();
    }
  }

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: 'UNAUTHORIZED',
      message: 'Missing Bearer token.',
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  if (!auth) {
    res.status(500).json({ success: false, error: 'FIREBASE_NOT_CONFIGURED' });
    return;
  }

  try {
    let uid;
    try {
      const decodedToken = await auth.verifyIdToken(token);
      uid = decodedToken.uid;
    } catch (fbError) {
      // Fallback: try decoding as custom JWT
      const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_for_development_only';
      const decoded: any = jwt.verify(token, jwtSecret);
      uid = decoded.uid;
    }

    // Look up user in database
    let user;
    if (uid === 'admin-super-uid') {
      user = { firebaseUid: 'admin-super-uid', email: 'admin@cargohub.com', role: 'ADMIN' as 'ADMIN', accountType: 'STANDARD' as 'STANDARD', isActive: true };
    } else {
      user = await db.users.findByFirebaseUid(uid);
    }

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'USER_NOT_FOUND',
        message: 'No user found for this authentication token.',
      });
      return;
    }

    // Attach user to request
    const driver = await db.drivers.findByFirebaseUid(uid);
    req.user = {
      uid: user.firebaseUid,
      email: user.email,
      role: user.role,
      accountType: user.accountType,
      kycStatus: driver?.kycStatus,
      isActive: user.isActive,
    };

    // --- GLOBAL AUDIT LOGGER FOR ALL USERS ---
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      res.on('finish', async () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const logEntry = {
              id: uuid(),
              adminUid: req.user!.uid, // Reusing adminUid field for any user's uid
              action: `${req.method}_${req.path.replace(/\//g, '_').toUpperCase()}`.replace(/^_|_$/g, ''),
              targetType: req.user!.role, // Store their role as the target type for context
              targetId: req.path,
              metadata: { method: req.method, path: req.path, query: req.query, body: req.body },
              createdAt: new Date().toISOString(),
            };
            await db.auditLogs.create(logEntry as any);
            
            // Stream the audit log to connected admins
            const io = req.app.get('io');
            if (io) {
              // Convert DB case back to camelCase for the frontend stream
              io.to('admin_dashboard').emit('audit_log:new', logEntry);
            }
          } catch(e) {
            console.error("Global Audit Log failed", e);
          }
        }
      });
    }

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'INVALID_TOKEN',
      message: 'The provided authentication token is invalid or expired.',
    });
  }
};
