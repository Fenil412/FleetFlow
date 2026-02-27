import { Client } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initDb() {
    const config = {
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
    };

    const mainClient = new Client({ ...config, database: 'postgres' });
    try {
        await mainClient.connect();
        console.log('Connected to postgres database');

        // Check if database exists
        const res = await mainClient.query(`SELECT 1 FROM pg_database WHERE datname = '${process.env.DB_NAME}'`);
        if (res.rowCount === 0) {
            console.log(`Creating database ${process.env.DB_NAME}...`);
            await mainClient.query(`CREATE DATABASE ${process.env.DB_NAME}`);
        } else {
            console.log(`Database ${process.env.DB_NAME} already exists.`);
        }
    } catch (err) {
        console.error('Error creating database:', err);
        process.exit(1);
    } finally {
        await mainClient.end();
    }

    const dbClient = new Client({ ...config, database: process.env.DB_NAME });
    try {
        await dbClient.connect();
        console.log(`Connected to ${process.env.DB_NAME}`);

        const schemaPath = path.join(__dirname, '../database/schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.log('Executing schema.sql...');
        await dbClient.query(schemaSql);
        console.log('Schema executed successfully!');
    } catch (err) {
        console.error('Error executing schema:', err);
        process.exit(1);
    } finally {
        await dbClient.end();
    }
}

initDb();
