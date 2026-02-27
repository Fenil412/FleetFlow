import { query } from '../config/db.js';
import { ApiError } from '../middleware/error.middleware.js';

export const getAllVehicles = async (filters = {}, pagination = { limit: 10, offset: 0 }) => {
    let sql = 'SELECT * FROM vehicles WHERE is_retired = FALSE';
    const params = [];

    if (filters.status) {
        params.push(filters.status);
        sql += ` AND status = $${params.length}`;
    }

    if (filters.type) {
        params.push(filters.type);
        sql += ` AND vehicle_type = $${params.length}`;
    }

    sql += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(pagination.limit, pagination.offset);

    const result = await query(sql, params);
    const countRes = await query('SELECT COUNT(*) FROM vehicles WHERE is_retired = FALSE');

    return {
        vehicles: result.rows,
        total: parseInt(countRes.rows[0].count),
        limit: pagination.limit,
        offset: pagination.offset
    };
};

export const getVehicleById = async (id) => {
    const result = await query('SELECT * FROM vehicles WHERE id = $1 AND is_retired = FALSE', [id]);
    if (result.rowCount === 0) throw new ApiError(404, 'Vehicle not found');
    return result.rows[0];
};

export const createVehicle = async (data) => {
    const { name, model, license_plate, vehicle_type, max_capacity_kg, acquisition_cost } = data;

    const result = await query(
        `INSERT INTO vehicles (name, model, license_plate, vehicle_type, max_capacity_kg, acquisition_cost)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [name, model, license_plate, vehicle_type, max_capacity_kg, acquisition_cost]
    );
    return result.rows[0];
};

export const updateVehicle = async (id, data) => {
    const fields = [];
    const params = [id];
    let i = 2;

    for (const [key, value] of Object.entries(data)) {
        if (['name', 'model', 'status', 'odometer_km', 'max_capacity_kg'].includes(key)) {
            fields.push(`${key} = $${i++}`);
            params.push(value);
        }
    }

    if (fields.length === 0) throw new ApiError(400, 'No valid fields provided for update');

    const sql = `UPDATE vehicles SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $1 RETURNING *`;
    const result = await query(sql, params);

    if (result.rowCount === 0) throw new ApiError(404, 'Vehicle not found');
    return result.rows[0];
};

export const softDeleteVehicle = async (id) => {
    const result = await query('UPDATE vehicles SET is_retired = TRUE, updated_at = NOW() WHERE id = $1 RETURNING id', [id]);
    if (result.rowCount === 0) throw new ApiError(404, 'Vehicle not found');
    return result.rows[0];
};
