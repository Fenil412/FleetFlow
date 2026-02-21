import { query } from '../src/config/db.js';
import bcrypt from 'bcryptjs';

async function seed() {
    console.log('🌱 Starting database seeding...');

    try {
        // 1. Roles already exist from schema, but let's ensure or add new ones
        console.log('Ensuring roles exist...');
        await query("INSERT INTO roles (name, description) VALUES ('SAFETY_OFFICER', 'Manage driver safety'), ('FINANCIAL_ANALYST', 'Access to ROI analytics') ON CONFLICT (name) DO NOTHING");

        // 2. Create Admin User
        const salt = await bcrypt.genSalt(10);
        const adminPass = await bcrypt.hash('admin123', salt);
        const adminRoleRes = await query("SELECT id FROM roles WHERE name = 'ADMIN'");
        const adminRoleId = adminRoleRes.rows[0].id;

        console.log('Creating admin user...');
        await query(
            "INSERT INTO users (name, email, password_hash, role_id) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING",
            ['System Admin', 'admin@fleetflow.com', adminPass, adminRoleId]
        );

        // 3. Create sample Vehicle
        console.log('Creating sample vehicles...');
        await query(
            "INSERT INTO vehicles (name, model, license_plate, vehicle_type, max_capacity_kg) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (license_plate) DO NOTHING",
            ['Heavy Truck A', 'Volvo FH16', 'ABC-1234', 'Truck', 20000]
        );

        // 4. Create sample Driver
        console.log('Creating sample drivers...');
        await query(
            "INSERT INTO drivers (name, license_number, license_expiry, status) VALUES ($1, $2, $3, $4) ON CONFLICT (license_number) DO NOTHING",
            ['John Driver', 'DL-889900', '2028-12-31', 'ON_DUTY']
        );

        console.log('✅ Seeding complete!');
    } catch (err) {
        console.error('❌ Seeding failed:', err);
    } finally {
        process.exit();
    }
}

seed();
