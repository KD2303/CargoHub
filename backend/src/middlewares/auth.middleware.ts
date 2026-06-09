import type { Request, Response, NextFunction } from 'express';
import { auth } from '../config/firebase';
import { db } from '../config/database';

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
    console.error('Firebase token verification failed:', error);
    res.status(401).json({
      success: false,
      error: 'INVALID_TOKEN',
      message: 'Invalid or expired authentication token.',
    });
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
    const decodedToken = await auth.verifyIdToken(token);
    const uid = decodedToken.uid;

    // Look up user in database
    const user = await db.users.findByFirebaseUid(uid);

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

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'INVALID_TOKEN',
      message: 'The provided authentication token is invalid or expired.',
    });
  }
};
