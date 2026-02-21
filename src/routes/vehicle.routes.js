import express from 'express';
import * as vehicleController from '../controllers/vehicle.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { rbacMiddleware, ROLES } from '../middleware/rbac.middleware.js';

const router = express.Router();

// All vehicle routes protected by auth
router.use(authMiddleware);

router.get('/', vehicleController.getVehicles);
router.get('/:id', vehicleController.getVehicle);

// Restricted actions - Strictly for Fleet Manager as per updated RBAC
router.post('/', rbacMiddleware([ROLES.FLEET_MANAGER]), vehicleController.createVehicle);
router.put('/:id', rbacMiddleware([ROLES.FLEET_MANAGER]), vehicleController.updateVehicle);
router.delete('/:id', rbacMiddleware([ROLES.FLEET_MANAGER]), vehicleController.deleteVehicle);

export default router;
