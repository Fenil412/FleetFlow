import express from 'express';
import * as tripController from '../controllers/trip.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { rbacMiddleware, ROLES } from '../middleware/rbac.middleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', tripController.getTrips);
router.post('/', rbacMiddleware([ROLES.FLEET_MANAGER, ROLES.DISPATCHER]), tripController.createTrip);
router.patch('/:id/dispatch', rbacMiddleware([ROLES.FLEET_MANAGER, ROLES.DISPATCHER]), tripController.dispatchTrip);
router.patch('/:id/complete', rbacMiddleware([ROLES.FLEET_MANAGER, ROLES.DISPATCHER]), tripController.completeTrip);
router.delete('/:id', rbacMiddleware([ROLES.FLEET_MANAGER, ROLES.DISPATCHER]), tripController.cancelTrip);

export default router;
