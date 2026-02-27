import express from 'express';
import * as fuelController from '../controllers/fuel.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { rbacMiddleware, ROLES } from '../middleware/rbac.middleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', fuelController.getLogs);
router.post('/', rbacMiddleware([ROLES.FLEET_MANAGER, ROLES.FINANCIAL_ANALYST]), fuelController.createLog);
router.put('/:id', rbacMiddleware([ROLES.FLEET_MANAGER, ROLES.FINANCIAL_ANALYST]), fuelController.updateLog);
router.delete('/:id', rbacMiddleware([ROLES.FLEET_MANAGER, ROLES.FINANCIAL_ANALYST]), fuelController.deleteLog);

export default router;
