import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../../middleware/auth.js';
import { asyncHandler } from '../../utils/app-error.js';
import { User } from '../../models/user.model.js';

const router = Router();

// Get user by ID
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select(
      '-password'
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  })
);

// Search users by username or name
router.get(
  '/search/query',
  asyncHandler(async (req, res) => {
    const q = (req.query.q as string)?.trim();

    if (!q || q.length < 2) {
      return res.status(400).json({ error: 'Query must be at least 2 characters' });
    }

    const users = await User.find({
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { name: { $regex: q, $options: 'i' } },
      ],
    })
      .select('-password')
      .limit(20);

    res.json(users);
  })
);

// Get current user profile
router.get(
  '/me/profile',
  authMiddleware,
  asyncHandler(async (req: AuthRequest, res) => {
    const user = await User.findById(req.user?.id).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  })
);

// Update user profile
router.put(
  '/me/profile',
  authMiddleware,
  asyncHandler(async (req: AuthRequest, res) => {
    const { name, bio, avatar, location } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user?.id,
      {
        ...(name && { name }),
        ...(bio && { bio }),
        ...(avatar && { avatar }),
        ...(location && { location }),
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  })
);

export default router;
