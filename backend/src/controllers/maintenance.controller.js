import * as maintenanceService from '../services/maintenance.service.js';
import { asyncWrapper } from '../middleware/error.middleware.js';
import { emitFleetEvent } from '../sockets/fleet.socket.js';

export const createLog = asyncWrapper(async (req, res) => {
    const log = await maintenanceService.createMaintenanceLog(req.body, req.user.id);
    emitFleetEvent('maintenance:alert', {
        vehicleId: log.vehicle_id,
        type: log.service_type,
        message: `Vehicle ${log.vehicle_id} entered maintenance: ${log.service_type}`
    });
    emitFleetEvent('vehicle:statusChanged', { vehicleId: log.vehicle_id, status: 'IN_SHOP' });
    res.status(201).json({ status: 'success', data: { log } });
});

export const getHistory = asyncWrapper(async (req, res) => {
    const history = await maintenanceService.getMaintenanceHistory(req.query.vehicle_id);
    res.json({ status: 'success', data: { history } });
});

export const updateLog = asyncWrapper(async (req, res) => {
    const log = await maintenanceService.updateMaintenanceLog(req.params.id, req.body);
    res.json({ status: 'success', data: { log } });
});

export const deleteLog = asyncWrapper(async (req, res) => {
    await maintenanceService.deleteMaintenanceLog(req.params.id);
    res.json({ status: 'success', message: 'Maintenance record deleted' });
});
