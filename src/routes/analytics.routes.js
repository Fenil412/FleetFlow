import express from 'express';
import * as analyticsController from '../controllers/analytics.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { rbacMiddleware, ROLES } from '../middleware/rbac.middleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/dashboard', analyticsController.getDashboard);
router.get('/roi', rbacMiddleware([ROLES.FLEET_MANAGER, ROLES.FINANCIAL_ANALYST]), analyticsController.getROI);
router.get('/efficiency', rbacMiddleware([ROLES.FLEET_MANAGER, ROLES.FINANCIAL_ANALYST]), analyticsController.getEfficiency);

export default router;
