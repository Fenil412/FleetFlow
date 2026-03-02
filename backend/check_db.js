import { Client } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

async function check() {
    const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
    await client.connect();

    const trips = await client.query('SELECT * FROM trips LIMIT 5');
    console.log('Trips:', trips.rows.map(r => r.revenue));

    const fuel = await client.query('SELECT * FROM fuel_logs LIMIT 5');
    console.log('Fuel:', fuel.rows.map(r => r.cost));

    const maint = await client.query('SELECT * FROM maintenance_logs LIMIT 5');
    console.log('Maintenance:', maint.rows.map(r => r.cost));

    await client.end();
}

check();
