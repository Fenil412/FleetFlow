import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });

const { Pool } = pg;
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function verifyRoles() {
    try {
        const roles = ['FLEET_MANAGER', 'DISPATCHER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST'];

        // Check existing roles
        const currentRoles = await pool.query('SELECT name FROM roles');
        console.log('Current Roles in DB:', currentRoles.rows.map(r => r.name));

        for (const role of roles) {
            const exists = currentRoles.rows.find(r => r.name === role);
            if (!exists) {
                console.log(`Adding missing role: ${role}`);
                await pool.query('INSERT INTO roles (name) VALUES ($1) ON CONFLICT (name) DO NOTHING', [role]);
            }
        }

        console.log('Role verification complete.');
    } catch (err) {
        console.error('Error verifying roles:', err);
    } finally {
        await pool.end();
    }
}

verifyRoles();
