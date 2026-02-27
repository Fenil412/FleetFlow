import { query } from '../config/db.js';
import { ApiError } from '../middleware/error.middleware.js';

export const createFuelLog = async (data, userId) => {
    const { vehicle_id, trip_id, liters, cost, fuel_date, odometer_km } = data;
    const result = await query(
        `INSERT INTO fuel_logs (vehicle_id, trip_id, liters, cost, fuel_date, odometer_km, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [vehicle_id, trip_id, liters, cost, fuel_date, odometer_km, userId]
    );
    return result.rows[0];
};

export const getFuelLogs = async (vehicleId = null) => {
    let sql = 'SELECT f.*, v.name as vehicle_name FROM fuel_logs f JOIN vehicles v ON f.vehicle_id = v.id';
    const params = [];
    if (vehicleId) {
        params.push(vehicleId);
        sql += ' WHERE f.vehicle_id = $1';
    }
    sql += ' ORDER BY f.fuel_date DESC';
    const result = await query(sql, params);
    return result.rows;
};

export const updateFuelLog = async (id, data) => {
    const { liters, cost, fuel_date, odometer_km } = data;
    const result = await query(
        `UPDATE fuel_logs SET liters = $1, cost = $2, fuel_date = $3, odometer_km = $4
         WHERE id = $5 RETURNING *`,
        [liters, cost, fuel_date, odometer_km, id]
    );
    if (result.rowCount === 0) throw new ApiError(404, 'Fuel log not found');
    return result.rows[0];
};

export const deleteFuelLog = async (id) => {
    const result = await query('DELETE FROM fuel_logs WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) throw new ApiError(404, 'Fuel log not found');
    return result.rows[0];
};
