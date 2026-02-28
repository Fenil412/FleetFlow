import { Client } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initDb() {
    console.log('Connecting to Neon database via DATABASE_URL...');
    const dbClient = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        await dbClient.connect();
        console.log('Connected to Neon database successfully.');

        // Ensure search_path is public
        await dbClient.query('SET search_path TO public');

        const schemaPath = path.join(__dirname, '../database/schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.log('Executing schema.sql...');
        await dbClient.query(schemaSql);
        console.log('Schema executed successfully!');
    } catch (err) {
        if (err.code === '42P07' || err.code === '42710') {
            console.log('Schema already exists or some objects already exist. You may need to drop them if you want a clean slate.');
        } else {
            console.error('Error executing schema:', err);
            process.exit(1);
        }
    } finally {
        await dbClient.end();
    }
}

initDb();
