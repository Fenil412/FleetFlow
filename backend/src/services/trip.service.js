import pool, { query } from '../config/db.js';
import { ApiError } from '../middleware/error.middleware.js';
import { isExpired } from '../utils/date.utils.js';
import { sendEmail } from './email.service.js';
import { sendTripDispatchSMS } from './sms.service.js';

export const createTripDraft = async (data, userId) => {
    const { vehicle_id, driver_id, cargo_weight_kg, origin, destination } = data;

    // Validate Cargo Weight against Vehicle Capacity
    const vehicleRes = await query('SELECT max_capacity_kg, status FROM vehicles WHERE id = $1', [vehicle_id]);
    if (vehicleRes.rowCount === 0) throw new ApiError(404, 'Vehicle not found');
    if (cargo_weight_kg > vehicleRes.rows[0].max_capacity_kg) {
        throw new ApiError(400, `Cargo weight exceeds vehicle capacity (${vehicleRes.rows[0].max_capacity_kg}kg)`);
    }

    const result = await query(
        `INSERT INTO trips (vehicle_id, driver_id, cargo_weight_kg, origin, destination, status, created_by)
     VALUES ($1, $2, $3, $4, $5, 'DRAFT', $6) RETURNING *`,
        [vehicle_id, driver_id, cargo_weight_kg, origin, destination, userId]
    );
    return result.rows[0];
};

export const dispatchTrip = async (tripId) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const tripRes = await client.query('SELECT * FROM trips WHERE id = $1', [tripId]);
        if (tripRes.rowCount === 0) throw new ApiError(404, 'Trip not found');
        const trip = tripRes.rows[0];

        if (trip.status !== 'DRAFT') throw new ApiError(400, 'Only draft trips can be dispatched');

        // Check Vehicle Status
        const vehicleRes = await client.query('SELECT status FROM vehicles WHERE id = $1 FOR UPDATE', [trip.vehicle_id]);
        if (vehicleRes.rows[0].status !== 'AVAILABLE') {
            throw new ApiError(400, `Vehicle is not available (Current: ${vehicleRes.rows[0].status})`);
        }

        // Check Driver Status & License
        const driverRes = await client.query('SELECT status, license_expiry FROM drivers WHERE id = $1 FOR UPDATE', [trip.driver_id]);
        if (driverRes.rows[0].status !== 'ON_DUTY') {
            throw new ApiError(400, 'Driver is not on duty');
        }
        if (isExpired(driverRes.rows[0].license_expiry)) {
            throw new ApiError(400, 'Driver license is expired');
        }

        // Update Statuses
        await client.query("UPDATE vehicles SET status = 'ON_TRIP' WHERE id = $1", [trip.vehicle_id]);
        await client.query("UPDATE drivers SET status = 'ON_TRIP' WHERE id = $1", [trip.driver_id]);
        const updatedTrip = await client.query(
            "UPDATE trips SET status = 'DISPATCHED', start_time = NOW() WHERE id = $1 RETURNING *",
            [tripId]
        );

        await client.query('COMMIT');
        return updatedTrip.rows[0];
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

export const completeTrip = async (tripId, endOdometer, revenue) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const tripRes = await client.query('SELECT * FROM trips WHERE id = $1', [tripId]);
        if (tripRes.rowCount === 0) throw new ApiError(404, 'Trip not found');
        const trip = tripRes.rows[0];
        if (trip.status !== 'DISPATCHED') throw new ApiError(400, 'Trip must be dispatched to complete');

        // Update Vehicle — only update odometer if a value was provided
        if (endOdometer != null && !isNaN(Number(endOdometer))) {
            await client.query(
                "UPDATE vehicles SET status = 'AVAILABLE', odometer_km = $1 WHERE id = $2",
                [Number(endOdometer), trip.vehicle_id]
            );
        } else {
            await client.query(
                "UPDATE vehicles SET status = 'AVAILABLE' WHERE id = $1",
                [trip.vehicle_id]
            );
        }

        // Update Driver
        await client.query("UPDATE drivers SET status = 'ON_DUTY' WHERE id = $1", [trip.driver_id]);

        // Update Trip
        const updatedTrip = await client.query(
            `UPDATE trips 
       SET status = 'COMPLETED', end_time = NOW(), end_odometer = $1, revenue = $2 
       WHERE id = $3 RETURNING *`,
            [endOdometer ?? null, revenue ?? 0, tripId]
        );

        await client.query('COMMIT');
        return updatedTrip.rows[0];
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

export const getAllTrips = async () => {
    const result = await query(
        `SELECT t.*, v.name as vehicle_name, v.vehicle_type, d.name as driver_name
         FROM trips t
         JOIN vehicles v ON t.vehicle_id = v.id
         JOIN drivers d ON t.driver_id = d.id
         ORDER BY t.created_at DESC`
    );
    return result.rows;
};

export const cancelTrip = async (tripId) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const tripRes = await client.query('SELECT * FROM trips WHERE id = $1', [tripId]);
        if (tripRes.rowCount === 0) throw new ApiError(404, 'Trip not found');
        const trip = tripRes.rows[0];
        if (trip.status === 'COMPLETED') throw new ApiError(400, 'Cannot cancel a completed trip');

        // Release vehicle and driver back to available/on-duty
        await client.query("UPDATE vehicles SET status = 'AVAILABLE' WHERE id = $1 AND status = 'ON_TRIP'", [trip.vehicle_id]);
        await client.query("UPDATE drivers SET status = 'ON_DUTY' WHERE id = $1 AND status = 'ON_TRIP'", [trip.driver_id]);

        const result = await client.query("DELETE FROM trips WHERE id = $1 RETURNING *", [tripId]);
        await client.query('COMMIT');
        return result.rows[0];
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};
