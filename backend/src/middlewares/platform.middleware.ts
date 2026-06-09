// ============================================================================
// Platform Logger Middleware
// Reads X-Platform header for analytics — never used for access control
// ============================================================================

import type { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Request {
      platform?: string;
      user?: {
        uid: string;
        email?: string;
        role: 'USER' | 'DRIVER' | 'ADMIN';
        accountType: 'STANDARD' | 'B2B';
        kycStatus?: 'UNSUBMITTED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
        isActive: boolean;
      };
      booking?: any;
    }
  }
}

export const platformMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  const platform = (req.headers['x-platform'] as string) || 'unknown';
  req.platform = platform;
  next();
};
