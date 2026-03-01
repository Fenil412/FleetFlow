import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { query } from '../config/db.js';
import { ApiError } from '../middleware/error.middleware.js';
import { uploadBuffer } from '../config/cloudinary.js';
import {
    sendWelcomeEmail,
    sendLoginAlertEmail,
    sendOTPEmail,
    sendPasswordResetSuccessEmail,
} from './email.service.js';
import {
    sendWelcomeSMS,
    sendOTPSMS,
    sendPasswordResetSuccessSMS,
} from './sms.service.js';

// ────────────────────────────────────────────────
// Auth
// ────────────────────────────────────────────────

export const login = async (email, password) => {
    const result = await query(
        'SELECT u.*, r.name as role_name FROM users u JOIN roles r ON u.role_id = r.id WHERE u.email = $1 AND u.is_active = TRUE',
        [email]
    );
    const user = result.rows[0];
    if (!user) throw new ApiError(401, 'Invalid credentials or account inactive');

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) throw new ApiError(401, 'Invalid credentials');

    await query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);

    // Send login alert (non-blocking)
    sendLoginAlertEmail(user.email, user.name).catch(() => { });

    const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role_name },
        process.env.JWT_SECRET || 'supersecret',
        { expiresIn: '8h' }
    );

    const { password_hash, otp_code, reset_token, ...safeUser } = user;
    return { user: safeUser, token };
};

export const register = async (name, email, password, phone, roleName) => {
    if (!phone) throw new ApiError(400, 'Phone number is mandatory');
    const userCount = await query('SELECT COUNT(*) FROM users');
    const isFirstUser = parseInt(userCount.rows[0].count) === 0;
    const finalRole = roleName || (isFirstUser ? 'FLEET_MANAGER' : 'DISPATCHER');

    const roleRes = await query('SELECT id FROM roles WHERE name = $1', [finalRole]);
    if (roleRes.rowCount === 0) throw new ApiError(400, 'Invalid role');
    const roleId = roleRes.rows[0].id;

    const userExists = await query('SELECT 1 FROM users WHERE email = $1', [email]);
    if (userExists.rowCount > 0) throw new ApiError(400, 'Email already in use');

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await query(
        'INSERT INTO users (name, email, password_hash, phone, role_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, phone, created_at',
        [name, email, hashedPassword, phone, roleId]
    );

    // Send welcome notifications (non-blocking)
    sendWelcomeEmail(email, name, finalRole).catch(() => { });
    if (phone) {
        sendWelcomeSMS(phone, name, finalRole).catch(() => { });
    }
    return result.rows[0];
};

// ────────────────────────────────────────────────
// Forgot / Reset Password (OTP flow)
// ────────────────────────────────────────────────

export const forgotPassword = async (email) => {
    const res = await query('SELECT * FROM users WHERE email = $1 AND is_active = TRUE', [email]);
    const user = res.rows[0];
    if (!user) throw new ApiError(404, 'No account found with that email');

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 8);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await query(
        'UPDATE users SET otp_code = $1, otp_expires_at = $2 WHERE id = $3',
        [hashedOtp, expiresAt, user.id]
    );

    await sendOTPEmail(email, user.name, otp);
    if (user.phone) {
        await sendOTPSMS(user.phone, user.name, otp);
    }
    return { message: 'OTP sent to your email' };
};

export const verifyOTP = async (email, otp) => {
    const res = await query(
        'SELECT * FROM users WHERE email = $1 AND otp_expires_at > NOW()',
        [email]
    );
    const user = res.rows[0];
    if (!user) throw new ApiError(400, 'OTP expired or invalid email');

    const valid = await bcrypt.compare(otp, user.otp_code);
    if (!valid) throw new ApiError(400, 'Invalid OTP');

    // Generate a short-lived reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await query(
        'UPDATE users SET otp_code = NULL, otp_expires_at = NULL, reset_token = $1, reset_token_expires_at = $2 WHERE id = $3',
        [resetToken, expiresAt, user.id]
    );

    return { resetToken, email };
};

export const resetPassword = async (resetToken, newPassword) => {
    const res = await query(
        'SELECT * FROM users WHERE reset_token = $1 AND reset_token_expires_at > NOW()',
        [resetToken]
    );
    const user = res.rows[0];
    if (!user) throw new ApiError(400, 'Reset token is invalid or expired');

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await query(
        'UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expires_at = NULL, updated_at = NOW() WHERE id = $2',
        [hashedPassword, user.id]
    );

    await sendPasswordResetSuccessEmail(user.email, user.name);
    if (user.phone) {
        await sendPasswordResetSuccessSMS(user.phone, user.name);
    }
    return { message: 'Password updated successfully' };
};

// ────────────────────────────────────────────────
// Profile
// ────────────────────────────────────────────────

export const getProfile = async (userId) => {
    const res = await query(
        `SELECT u.id, u.name, u.email, u.phone, u.avatar_url, u.is_active,
                u.last_login_at, u.created_at, r.name as role
         FROM users u
         JOIN roles r ON u.role_id = r.id
         WHERE u.id = $1`,
        [userId]
    );
    if (res.rowCount === 0) throw new ApiError(404, 'User not found');
    return res.rows[0];
};

export const updateProfile = async (userId, { name, phone }) => {
    const res = await query(
        'UPDATE users SET name = COALESCE($1, name), phone = COALESCE($2, phone), updated_at = NOW() WHERE id = $3 RETURNING id, name, email, phone, avatar_url',
        [name, phone, userId]
    );
    return res.rows[0];
};

export const updateAvatar = async (userId, buffer) => {
    const url = await uploadBuffer(buffer, 'fleetflow/avatars', `user_${userId}`);
    const res = await query(
        'UPDATE users SET avatar_url = $1, updated_at = NOW() WHERE id = $2 RETURNING id, name, email, avatar_url',
        [url, userId]
    );
    return res.rows[0];
};

export const changePassword = async (userId, currentPassword, newPassword) => {
    const res = await query('SELECT * FROM users WHERE id = $1', [userId]);
    const user = res.rows[0];
    if (!user) throw new ApiError(404, 'User not found');

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) throw new ApiError(401, 'Current password is incorrect');

    const hashed = await bcrypt.hash(newPassword, 10);
    await query(
        'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
        [hashed, userId]
    );

    await sendPasswordResetSuccessEmail(user.email, user.name);
    if (user.phone) {
        await sendPasswordResetSuccessSMS(user.phone, user.name);
    }
    return { message: 'Password changed successfully' };
};
