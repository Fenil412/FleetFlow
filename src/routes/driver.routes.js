import express from 'express';
import * as driverController from '../controllers/driver.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { rbacMiddleware, ROLES } from '../middleware/rbac.middleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', driverController.getDrivers);
router.get('/:id', driverController.getDriver);

router.post('/', rbacMiddleware([ROLES.FLEET_MANAGER, ROLES.SAFETY_OFFICER]), driverController.createDriver);
router.put('/:id', rbacMiddleware([ROLES.FLEET_MANAGER, ROLES.SAFETY_OFFICER]), driverController.updateDriver);
router.delete('/:id', rbacMiddleware([ROLES.FLEET_MANAGER, ROLES.SAFETY_OFFICER]), driverController.deleteDriver);

export default router;
