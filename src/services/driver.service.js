import { query } from '../config/db.js';
import { ApiError } from '../middleware/error.middleware.js';
import { isExpired } from '../utils/date.utils.js';

export const getAllDrivers = async (filters = {}) => {
    let sql = 'SELECT * FROM drivers WHERE 1=1';
    const params = [];

    if (filters.status) {
        params.push(filters.status);
        sql += ` AND status = $${params.length}`;
    }

    sql += ' ORDER BY created_at DESC';
    const result = await query(sql, params);
    return result.rows;
};

export const getDriverById = async (id) => {
    const result = await query('SELECT * FROM drivers WHERE id = $1', [id]);
    if (result.rowCount === 0) throw new ApiError(404, 'Driver not found');
    return result.rows[0];
};

export const createDriver = async (data) => {
    const { name, license_number, license_expiry, phone } = data;

    if (isExpired(license_expiry)) {
        throw new ApiError(400, 'Cannot register driver with expired license');
    }

    const result = await query(
        `INSERT INTO drivers (name, license_number, license_expiry, phone)
     VALUES ($1, $2, $3, $4) RETURNING *`,
        [name, license_number, license_expiry, phone]
    );
    return result.rows[0];
};

export const updateDriver = async (id, data) => {
    const fields = [];
    const params = [id];
    let i = 2;

    for (const [key, value] of Object.entries(data)) {
        if (['name', 'license_expiry', 'phone', 'status', 'safety_score'].includes(key)) {
            fields.push(`${key} = $${i++}`);
            params.push(value);
        }
    }

    if (fields.length === 0) throw new ApiError(400, 'No valid fields provided');

    const sql = `UPDATE drivers SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $1 RETURNING *`;
    const result = await query(sql, params);

    if (result.rowCount === 0) throw new ApiError(404, 'Driver not found');
    return result.rows[0];
};

export const deleteDriver = async (id) => {
    const result = await query('DELETE FROM drivers WHERE id = $1 RETURNING id', [id]);
    if (result.rowCount === 0) throw new ApiError(404, 'Driver not found');
    return result.rows[0];
};
