import * as authService from '../services/auth.service.js';
import { asyncWrapper } from '../middleware/error.middleware.js';

export const login = asyncWrapper(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
        return res.status(400).json({ status: 'error', message: 'Email and password required' });
    const data = await authService.login(email, password);
    res.json({ status: 'success', data });
});

export const register = asyncWrapper(async (req, res) => {
    const { name, email, password, phone, role } = req.body;
    const user = await authService.register(name, email, password, phone, role);
    res.status(201).json({ status: 'success', data: { user } });
});

// ── Password Recovery ────────────────────────────

export const forgotPassword = asyncWrapper(async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ status: 'error', message: 'Email required' });
    const result = await authService.forgotPassword(email);
    res.json({ status: 'success', data: result });
});

export const verifyOTP = asyncWrapper(async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ status: 'error', message: 'Email and OTP required' });
    const result = await authService.verifyOTP(email, otp);
    res.json({ status: 'success', data: result });
});

export const resetPassword = asyncWrapper(async (req, res) => {
    const { resetToken, newPassword } = req.body;
    if (!resetToken || !newPassword)
        return res.status(400).json({ status: 'error', message: 'Reset token and new password required' });
    const result = await authService.resetPassword(resetToken, newPassword);
    res.json({ status: 'success', data: result });
});

// ── Profile ──────────────────────────────────────

export const getProfile = asyncWrapper(async (req, res) => {
    const profile = await authService.getProfile(req.user.id);
    res.json({ status: 'success', data: { profile } });
});

export const updateProfile = asyncWrapper(async (req, res) => {
    const { name, phone } = req.body;
    const updated = await authService.updateProfile(req.user.id, { name, phone });
    res.json({ status: 'success', data: { user: updated } });
});

export const uploadAvatar = asyncWrapper(async (req, res) => {
    if (!req.file) return res.status(400).json({ status: 'error', message: 'No image file provided' });
    const updated = await authService.updateAvatar(req.user.id, req.file.buffer);
    res.json({ status: 'success', data: { user: updated } });
});

export const changePassword = asyncWrapper(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
        return res.status(400).json({ status: 'error', message: 'Both passwords required' });
    const result = await authService.changePassword(req.user.id, currentPassword, newPassword);
    res.json({ status: 'success', data: result });
});
