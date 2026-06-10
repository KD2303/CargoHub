import { Router } from 'express';
import { db } from '../config/database';
import { authService } from '../services/auth.service';
import { verifyFirebaseToken, decodeFirebaseToken } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { RegisterUserSchema, RegisterDriverSchema, RegisterTokensSchema } from '@cargohub/shared';
import { strictLimiter } from '../middlewares/rateLimit.middleware';

const router = Router();

// ── New Signup / Profile Completion Flow ─────────────────────────────────────

// Register or complete profile for a USER
// This handles BOTH standard Email signups and Google signups after Firebase Auth
router.post('/register-user', strictLimiter, decodeFirebaseToken, validate(RegisterUserSchema), async (req, res) => {
  try {
    const firebaseUid = req.user!.uid;
    const email = req.user!.email; // Firebase email

    const user = await authService.registerUser(firebaseUid, email, {
      name: req.body.name,
      phone: req.body.phone,
      gender: req.body.gender,
      profilePictureUrl: req.body.profilePictureUrl,
      role: 'USER'
    });

    res.status(200).json({ success: true, data: user, message: 'Profile completed successfully' });
  } catch (error: any) {
    console.error('Register User Error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to register user' });
  }
});

// Register or complete profile for a DRIVER
router.post('/register-driver', strictLimiter, decodeFirebaseToken, validate(RegisterDriverSchema), async (req, res) => {
  try {
    const firebaseUid = req.user!.uid;
    const email = req.user!.email;
    
    // Create Base User Profile for Driver
    const user = await authService.registerUser(firebaseUid, email, {
      name: req.body.name,
      phone: req.body.phone,
      role: 'DRIVER'
    });

    // Check if Driver profile exists
    let driver = await db.drivers.findByFirebaseUid(firebaseUid);
    if (!driver) {
      driver = await db.drivers.create({
        id: user.id, // match user id
        firebaseUid: firebaseUid,
        name: req.body.name,
        phone: req.body.phone,
        vehicleType: req.body.vehicleType,
        vehicleNumber: req.body.vehicleNumber,
        rating: 0,
        totalTrips: 0,
        kycStatus: 'UNSUBMITTED',
        isAvailable: false,
        isActive: true,
        earnings: { today: 0, thisWeek: 0, thisMonth: 0, tripCount: 0 },
        createdAt: new Date().toISOString(),
      });
    }

    res.status(200).json({ success: true, data: driver, message: 'Driver registered successfully' });
  } catch (error: any) {
    console.error('Register Driver Error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to register driver' });
  }
});

// ── Tokens & Profile ─────────────────────────────────────────────────────────

// Upload user avatar
router.post('/upload-avatar', verifyFirebaseToken, async (req, res) => {
  try {
    const firebaseUid = req.user!.uid;
    const { base64Image } = req.body;
    
    if (!base64Image) {
      res.status(400).json({ success: false, error: 'No image provided' });
      return;
    }

    const { v2: cloudinary } = await import('cloudinary');
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      console.warn('Cloudinary not configured. Mocking success.');
      // Mock update
      await db.users.update(firebaseUid, { profilePhoto: 'https://mock.url/avatar.jpg' });
      res.json({ success: true, url: 'https://mock.url/avatar.jpg' });
      return;
    }

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });

    const uploadResponse = await cloudinary.uploader.upload(base64Image, {
      folder: 'avatars',
      transformation: [{ width: 500, height: 500, crop: 'fill' }]
    });

    await db.users.update(firebaseUid, { profilePhoto: uploadResponse.secure_url });
    
    res.json({ success: true, url: uploadResponse.secure_url });
  } catch (error: any) {
    console.error('Upload Avatar Error:', error);
    res.status(500).json({ success: false, error: 'Failed to upload avatar' });
  }
});

// Register push notification tokens
router.post('/register-tokens',
  verifyFirebaseToken,
  validate(RegisterTokensSchema),
  async (req, res) => {
    try {
      const firebaseUid = req.user!.uid;
      const { fcmToken, oneSignalId } = req.body;
      
      await db.users.update(firebaseUid, {
        fcmToken: fcmToken,
        // Onesignal ID is optional and kept for backward compatibility with schema if needed
      });
      
      res.json({ success: true, message: 'Notification tokens registered.' });
    } catch (error: any) {
      console.error('Register Tokens Error:', error);
      res.status(500).json({ success: false, error: 'Failed to register tokens' });
    }
  }
);

// Get current user profile
router.get('/me', verifyFirebaseToken, async (req, res) => {
  try {
    const user = await authService.getUserByFirebaseUid(req.user!.uid);
    if (!user) {
      res.status(404).json({ success: false, error: 'USER_NOT_FOUND' });
      return;
    }

    // If driver, include driver profile
    if (user.role === 'DRIVER') {
      const driver = await db.drivers.findByFirebaseUid(req.user!.uid);
      res.json({ success: true, data: { ...user, driver } });
      return;
    }

    res.json({ success: true, data: user });
  } catch (error: any) {
    console.error('Get Profile Error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch profile' });
  }
});
// Update current user profile
router.put('/me', verifyFirebaseToken, async (req, res) => {
  try {
    const firebaseUid = req.user!.uid;
    const { name, phone } = req.body;
    
    // Create an update object
    const updateData: any = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;

    await db.users.update(firebaseUid, updateData);
    
    const user = await authService.getUserByFirebaseUid(firebaseUid);
    res.json({ success: true, data: user });
  } catch (error: any) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ success: false, error: 'Failed to update profile' });
  }
});

export default router;
