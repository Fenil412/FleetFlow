import express from 'express';
import * as maintenanceController from '../controllers/maintenance.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { rbacMiddleware, ROLES } from '../middleware/rbac.middleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', rbacMiddleware([ROLES.FLEET_MANAGER, ROLES.SAFETY_OFFICER, ROLES.FINANCIAL_ANALYST]), maintenanceController.getHistory);
router.post('/', rbacMiddleware([ROLES.FLEET_MANAGER]), maintenanceController.createLog);
router.put('/:id', rbacMiddleware([ROLES.FLEET_MANAGER]), maintenanceController.updateLog);
router.delete('/:id', rbacMiddleware([ROLES.FLEET_MANAGER]), maintenanceController.deleteLog);

export default router;
