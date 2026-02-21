import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';
import { ApiError } from '../middleware/error.middleware.js';

export const login = async (email, password) => {
    const result = await query(
        'SELECT u.*, r.name as role_name FROM users u JOIN roles r ON u.role_id = r.id WHERE u.email = $1 AND u.is_active = TRUE',
        [email]
    );

    const user = result.rows[0];
    if (!user) {
        throw new ApiError(401, 'Invalid credentials or account inactive');
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
        throw new ApiError(401, 'Invalid credentials');
    }

    // Update last login
    await query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);

    const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role_name },
        process.env.JWT_SECRET || 'supersecret',
        { expiresIn: '8h' }
    );

    const { password_hash, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
};

export const register = async (name, email, password, roleName) => {
    // Check if any users exist to determine default role
    const userCount = await query('SELECT COUNT(*) FROM users');
    const isFirstUser = parseInt(userCount.rows[0].count) === 0;

    // Default to FLEET_MANAGER for first user, otherwise DISPATCHER
    const finalRole = roleName || (isFirstUser ? 'FLEET_MANAGER' : 'DISPATCHER');

    // Check if role exists
    const roleRes = await query('SELECT id FROM roles WHERE name = $1', [finalRole]);
    if (roleRes.rowCount === 0) {
        throw new ApiError(400, 'Invalid role');
    }
    const roleId = roleRes.rows[0].id;

    const userExists = await query('SELECT 1 FROM users WHERE email = $1', [email]);
    if (userExists.rowCount > 0) {
        throw new ApiError(400, 'Email already in use');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await query(
        'INSERT INTO users (name, email, password_hash, role_id) VALUES ($1, $2, $3, $4) RETURNING id, name, email, created_at',
        [name, email, hashedPassword, roleId]
    );

    return result.rows[0];
};
