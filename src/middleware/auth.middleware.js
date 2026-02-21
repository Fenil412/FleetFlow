import jwt from 'jsonwebtoken';
import { ApiError } from './error.middleware.js';

export const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new ApiError(401, 'Authorization token required');
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecret');
        req.user = decoded; // { id, role, email }
        next();
    } catch (err) {
        throw new ApiError(401, 'Invalid or expired token');
    }
};
