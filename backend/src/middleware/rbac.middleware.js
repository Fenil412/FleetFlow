import { ApiError } from './error.middleware.js';

export const rbacMiddleware = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            throw new ApiError(401, 'Authentication required');
        }

        if (!allowedRoles.includes(req.user.role)) {
            throw new ApiError(403, 'Access denied: Insufficient permissions');
        }

        next();
    };
};

export const ROLES = {
    FLEET_MANAGER: 'FLEET_MANAGER',
    DISPATCHER: 'DISPATCHER',
    SAFETY_OFFICER: 'SAFETY_OFFICER',
    FINANCIAL_ANALYST: 'FINANCIAL_ANALYST'
};
