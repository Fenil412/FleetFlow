import * as driverService from '../services/driver.service.js';
import { asyncWrapper } from '../middleware/error.middleware.js';
import { emitFleetEvent } from '../sockets/fleet.socket.js';

export const getDrivers = asyncWrapper(async (req, res) => {
    const drivers = await driverService.getAllDrivers(req.query);
    res.json({ status: 'success', data: { drivers } });
});

export const getDriver = asyncWrapper(async (req, res) => {
    const driver = await driverService.getDriverById(req.params.id);
    res.json({ status: 'success', data: { driver } });
});

export const createDriver = asyncWrapper(async (req, res) => {
    const driver = await driverService.createDriver(req.body);
    res.status(201).json({ status: 'success', data: { driver } });
});

export const updateDriver = asyncWrapper(async (req, res) => {
    const driver = await driverService.updateDriver(req.params.id, req.body);

    if (req.body.status) {
        emitFleetEvent('driver:statusChanged', { driverId: driver.id, status: driver.status });
    }

    res.json({ status: 'success', data: { driver } });
});

export const deleteDriver = asyncWrapper(async (req, res) => {
    await driverService.deleteDriver(req.params.id);
    res.json({ status: 'success', message: 'Driver removed from personnel records' });
});
