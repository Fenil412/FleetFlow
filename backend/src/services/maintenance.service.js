import pool, { query } from '../config/db.js';
import { ApiError } from '../middleware/error.middleware.js';
import { sendMaintenanceAlertEmail } from './email.service.js';

export const createMaintenanceLog = async (data, userId) => {
    const { vehicle_id, service_type, description, cost, service_date, next_service_due } = data;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const vehicleRes = await client.query('SELECT id FROM vehicles WHERE id = $1', [vehicle_id]);
        if (vehicleRes.rowCount === 0) throw new ApiError(404, 'Vehicle not found');

        const logRes = await client.query(
            `INSERT INTO maintenance_logs (vehicle_id, service_type, description, cost, service_date, next_service_due, created_by)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [vehicle_id, service_type, description, cost, service_date, next_service_due, userId]
        );

        await client.query("UPDATE vehicles SET status = 'IN_SHOP' WHERE id = $1", [vehicle_id]);
        await client.query('COMMIT');

        // Notify Manager (Non-blocking)
        const vInfo = await query('SELECT name FROM vehicles WHERE id = $1', [vehicle_id]);
        const vehicleName = vInfo.rows[0]?.name || 'Vehicle';
        const notificationEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;

        if (notificationEmail) {
            sendMaintenanceAlertEmail(notificationEmail, vehicleName, service_type, cost).catch(() => { });
        }

        return logRes.rows[0];
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

export const getMaintenanceHistory = async (vehicleId = null) => {
    let sql = 'SELECT m.*, v.name as vehicle_name FROM maintenance_logs m JOIN vehicles v ON m.vehicle_id = v.id';
    const params = [];
    if (vehicleId) {
        params.push(vehicleId);
        sql += ' WHERE m.vehicle_id = $1';
    }
    sql += ' ORDER BY m.service_date DESC';
    const result = await query(sql, params);
    return result.rows;
};

export const updateMaintenanceLog = async (id, data) => {
    const { service_type, description, cost, service_date } = data;
    const result = await query(
        `UPDATE maintenance_logs SET service_type = $1, description = $2, cost = $3, service_date = $4
         WHERE id = $5 RETURNING *`,
        [service_type, description, cost, service_date, id]
    );
    if (result.rowCount === 0) throw new ApiError(404, 'Maintenance log not found');
    return result.rows[0];
};

export const deleteMaintenanceLog = async (id) => {
    const result = await query('DELETE FROM maintenance_logs WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) throw new ApiError(404, 'Maintenance log not found');
    return result.rows[0];
};
