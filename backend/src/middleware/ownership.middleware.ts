// ============================================================================
// Ownership Validator Middleware
// Ensures users/drivers can only access their own resources
// ============================================================================

import type { Request, Response, NextFunction } from 'express';
import { db } from '../config/database';

export const validateBookingOwnership = (role: 'user' | 'driver') => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const booking = db.bookings.findById(req.params.id as string);

    if (!booking) {
      res.status(404).json({
        success: false,
        error: 'BOOKING_NOT_FOUND',
        message: 'The requested booking does not exist.',
      });
      return;
    }

    const ownerField = role === 'user' ? 'userId' : 'driverId';

    if (booking[ownerField] !== req.user!.uid) {
      res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'You do not own this resource.',
      });
      return;
    }

    req.booking = booking;
    next();
  };
};
