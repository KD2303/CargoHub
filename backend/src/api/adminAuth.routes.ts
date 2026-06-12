import { Router } from 'express';
import jwt from 'jsonwebtoken';

const router = Router();

// In a real app, use a DB to check credentials. For this test phase, we hardcode.
const ADMIN_CREDENTIALS = {
  email: process.env.ADMIN_EMAIL || 'admin@cargohub.com',
  password: process.env.ADMIN_PASSWORD || 'admin123'
};

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
    const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_for_development_only';
    const token = jwt.sign(
      {
        uid: 'admin-super-uid',
        email,
        role: 'ADMIN'
      },
      jwtSecret,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: {
        uid: 'admin-super-uid',
        email,
        role: 'ADMIN',
        accountType: 'STANDARD',
        isActive: true
      }
    });
  } else {
    res.status(401).json({ success: false, error: 'INVALID_CREDENTIALS', message: 'Invalid email or password' });
  }
});

// Endpoint to verify custom admin token on page load
router.get('/verify', async (req, res) => {
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

    res.json({
      success: true,
      user: {
        uid: decoded.uid,
        email: decoded.email,
        role: 'ADMIN',
        accountType: 'STANDARD',
        isActive: true
      }
    });
  } catch (err) {
    res.status(401).json({ success: false, error: 'INVALID_TOKEN' });
  }
});

export default router;
