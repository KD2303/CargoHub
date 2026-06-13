import { db } from '../config/database';
import { UserProfile } from '@cargohub/shared';
import { v4 as uuid } from 'uuid';
import { analyticsService } from './analytics.service';

export const authService = {
  /**
   * Completes user signup (Email or Google)
   * The client must send a valid Firebase ID Token and profile details.
   */
  async registerUser(
    firebaseUid: string,
    email: string | undefined,
    data: {
      name: string;
      phone: string;
      gender?: string;
      profilePictureUrl?: string;
      role?: 'USER' | 'DRIVER' | 'ADMIN';
      accountType?: 'STANDARD' | 'B2B';
    }
  ): Promise<UserProfile> {
    
    const existing = await db.users.findByFirebaseUid(firebaseUid);
    if (existing) {
      // If user exists, we might just be completing their profile
      if (!existing.profileCompleted) {
        const updated = await db.users.update(firebaseUid, {
          name: data.name,
          phone: data.phone,
          gender: data.gender,
          profilePhoto: data.profilePictureUrl,
          profileCompleted: true,
          updatedAt: new Date().toISOString()
        });
        
        await analyticsService.trackEvent('profile_completed', updated.id, 'user', updated.id);
        return updated;
      }
      return existing;
    }

    const userId = uuid();
    const newUser: UserProfile = {
      id: userId,
      firebaseUid,
      name: data.name,
      email: email,
      phone: data.phone,
      gender: data.gender,
      profilePhoto: data.profilePictureUrl,
      role: data.role || 'USER',
      accountType: data.accountType || 'STANDARD',
      emailVerified: false, // will update based on Firebase later
      profileCompleted: true,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const created = await db.users.create(newUser);
    
    // Analytics
    await analyticsService.trackEvent('user_signup', userId, 'user', userId);

    return created;
  },

  /**
   * Retrieves an existing user by Firebase UID
   */
  async getUserByFirebaseUid(firebaseUid: string): Promise<UserProfile | null> {
    return await db.users.findByFirebaseUid(firebaseUid);
  }
};
