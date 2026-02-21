import * as vehicleService from '../services/vehicle.service.js';
import { asyncWrapper } from '../middleware/error.middleware.js';
import { emitFleetEvent } from '../sockets/fleet.socket.js';


export const getVehicles = asyncWrapper(async (req, res) => {
    const { status, type, limit = 10, offset = 0 } = req.query;
    const data = await vehicleService.getAllVehicles({ status, type }, { limit: parseInt(limit), offset: parseInt(offset) });
    res.json({ status: 'success', data });
});

export const getVehicle = asyncWrapper(async (req, res) => {
    const vehicle = await vehicleService.getVehicleById(req.params.id);
    res.json({ status: 'success', data: { vehicle } });
});

export const createVehicle = asyncWrapper(async (req, res) => {
    const vehicle = await vehicleService.createVehicle(req.body);
    res.status(201).json({ status: 'success', data: { vehicle } });
});

export const updateVehicle = asyncWrapper(async (req, res) => {
    const vehicle = await vehicleService.updateVehicle(req.params.id, req.body);

    if (req.body.status) {
        emitFleetEvent('vehicle:statusChanged', { vehicleId: vehicle.id, status: vehicle.status });
    }

    res.json({ status: 'success', data: { vehicle } });
});

export const deleteVehicle = asyncWrapper(async (req, res) => {
    await vehicleService.softDeleteVehicle(req.params.id);
    res.json({ status: 'success', message: 'Vehicle retired successfully' });
});
