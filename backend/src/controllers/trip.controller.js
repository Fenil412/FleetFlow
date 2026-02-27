import * as tripService from '../services/trip.service.js';
import { asyncWrapper } from '../middleware/error.middleware.js';
import { emitFleetEvent } from '../sockets/fleet.socket.js';

export const createTrip = asyncWrapper(async (req, res) => {
    const trip = await tripService.createTripDraft(req.body, req.user.id);
    emitFleetEvent('trip:created', trip);
    res.status(201).json({ status: 'success', data: { trip } });
});

export const dispatchTrip = asyncWrapper(async (req, res) => {
    const trip = await tripService.dispatchTrip(req.params.id);

    emitFleetEvent('vehicle:statusChanged', { vehicleId: trip.vehicle_id, status: 'ON_TRIP' });
    emitFleetEvent('driver:statusChanged', { driverId: trip.driver_id, status: 'ON_TRIP' });

    res.json({ status: 'success', data: { trip } });
});

export const completeTrip = asyncWrapper(async (req, res) => {
    const { end_odometer, revenue } = req.body;
    const trip = await tripService.completeTrip(req.params.id, end_odometer, revenue);

    emitFleetEvent('trip:completed', trip);
    emitFleetEvent('vehicle:statusChanged', { vehicleId: trip.vehicle_id, status: 'AVAILABLE' });
    emitFleetEvent('driver:statusChanged', { driverId: trip.driver_id, status: 'ON_DUTY' });

    res.json({ status: 'success', data: { trip } });
});

export const getTrips = asyncWrapper(async (req, res) => {
    const trips = await tripService.getAllTrips();
    res.json({ status: 'success', data: { trips } });
});

export const cancelTrip = asyncWrapper(async (req, res) => {
    const trip = await tripService.cancelTrip(req.params.id);
    emitFleetEvent('vehicle:statusChanged', { vehicleId: trip.vehicle_id, status: 'AVAILABLE' });
    emitFleetEvent('driver:statusChanged', { driverId: trip.driver_id, status: 'ON_DUTY' });
    res.json({ status: 'success', message: 'Trip cancelled' });
});
