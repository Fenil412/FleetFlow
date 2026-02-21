import * as fuelService from '../services/fuel.service.js';
import { asyncWrapper } from '../middleware/error.middleware.js';

export const createLog = asyncWrapper(async (req, res) => {
    const log = await fuelService.createFuelLog(req.body, req.user.id);
    res.status(201).json({ status: 'success', data: { log } });
});

export const getLogs = asyncWrapper(async (req, res) => {
    const logs = await fuelService.getFuelLogs(req.query.vehicle_id);
    res.json({ status: 'success', data: { logs } });
});

export const updateLog = asyncWrapper(async (req, res) => {
    const log = await fuelService.updateFuelLog(req.params.id, req.body);
    res.json({ status: 'success', data: { log } });
});

export const deleteLog = asyncWrapper(async (req, res) => {
    await fuelService.deleteFuelLog(req.params.id);
    res.json({ status: 'success', message: 'Fuel log deleted' });
});
