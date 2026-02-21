import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = express.Router();

// ── Public ──────────────────────────────────────
router.post('/login', authController.login);
router.post('/register', authController.register);

// Password Recovery (public — no auth needed)
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-otp', authController.verifyOTP);
router.post('/reset-password', authController.resetPassword);

// ── Protected ───────────────────────────────────
router.get('/profile', authMiddleware, authController.getProfile);
router.patch('/profile', authMiddleware, authController.updateProfile);
router.post('/profile/avatar', authMiddleware, upload.single('avatar'), authController.uploadAvatar);
router.patch('/profile/password', authMiddleware, authController.changePassword);

export default router;
