import * as authService from '../services/auth.service.js';
import { asyncWrapper } from '../middleware/error.middleware.js';

export const login = asyncWrapper(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ status: 'error', message: 'Email and password required' });
    }

    const data = await authService.login(email, password);
    res.json({ status: 'success', data });
});

export const register = asyncWrapper(async (req, res) => {
    const { name, email, password, role } = req.body;
    const user = await authService.register(name, email, password, role);
    res.status(201).json({ status: 'success', data: { user } });
});
