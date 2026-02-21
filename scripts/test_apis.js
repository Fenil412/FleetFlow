import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';
let token = '';

async function runTests() {
    console.log('🚀 Starting API Verification Tests...\n');

    try {
        // 1. Auth Test
        console.log('--- Testing Authentication ---');
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'admin@fleetflow.com',
            password: 'admin123'
        });
        token = loginRes.data.data.token;
        console.log('✅ Admin Login Successful');

        const headers = { Authorization: `Bearer ${token}` };

        // 2. Vehicles Test
        console.log('\n--- Testing Vehicles API ---');
        const vehicleRes = await axios.get(`${BASE_URL}/vehicles`, { headers });
        console.log(`✅ Fetched ${vehicleRes.data.data.vehicles.length} vehicles`);

        const newVehicle = await axios.post(`${BASE_URL}/vehicles`, {
            name: 'Test Truck',
            model: 'Test Model',
            license_plate: `TEST-${Date.now()}`,
            vehicle_type: 'Truck',
            max_capacity_kg: 5000,
            acquisition_cost: 30000
        }, { headers });
        const vehicleId = newVehicle.data.data.vehicle.id;
        console.log(`✅ Created Test Vehicle (ID: ${vehicleId})`);

        // 3. Drivers Test
        console.log('\n--- Testing Drivers API ---');
        const driverRes = await axios.get(`${BASE_URL}/drivers`, { headers });
        console.log(`✅ Fetched ${driverRes.data.data.drivers.length} drivers`);

        const newDriver = await axios.post(`${BASE_URL}/drivers`, {
            name: 'Test Driver',
            license_number: `LIC-${Date.now()}`,
            license_expiry: '2029-01-01',
            phone: '1234567890'
        }, { headers });
        const driverId = newDriver.data.data.driver.id;
        console.log(`✅ Created Test Driver (ID: ${driverId})`);

        // Set Driver to ON_DUTY
        await axios.put(`${BASE_URL}/drivers/${driverId}`, { status: 'ON_DUTY' }, { headers });
        console.log('✅ Updated Driver Status to ON_DUTY');

        // 4. Trip Workflow Test
        console.log('\n--- Testing Trip Workflow (Business Rules) ---');

        // Create Draft
        const tripDraft = await axios.post(`${BASE_URL}/trips`, {
            vehicle_id: vehicleId,
            driver_id: driverId,
            cargo_weight_kg: 2000,
            origin: 'Warehouse A',
            destination: 'Client B'
        }, { headers });
        const tripId = tripDraft.data.data.trip.id;
        console.log(`✅ Created Trip Draft (ID: ${tripId})`);

        // Dispatch
        await axios.patch(`${BASE_URL}/trips/${tripId}/dispatch`, {}, { headers });
        console.log('✅ Trip Dispatched (Status updated to ON_TRIP)');

        // Verify Business Rule: Cannot dispatch same vehicle again
        try {
            await axios.patch(`${BASE_URL}/trips/${tripId}/dispatch`, {}, { headers });
        } catch (err) {
            console.log('✅ Business Rule Verified: Cannot dispatch non-DRAFT trip');
        }

        // Complete
        await axios.patch(`${BASE_URL}/trips/${tripId}/complete`, {
            end_odometer: 100,
            revenue: 500
        }, { headers });
        console.log('✅ Trip Completed (Status updated to COMPLETED)');

        // 5. Analytics Test
        console.log('\n--- Testing Analytics API ---');
        const dashRes = await axios.get(`${BASE_URL}/analytics/dashboard`, { headers });
        console.log('✅ Dashboard Data:', JSON.stringify(dashRes.data.data, null, 2));

        const roiRes = await axios.get(`${BASE_URL}/analytics/roi`, { headers });
        console.log(`✅ Fetched ROI data for ${roiRes.data.data.length} vehicles`);

        console.log('\n🎉 ALL CORE API TESTS PASSED SUCCESSFULLY!');
    } catch (err) {
        console.error('\n❌ Test Failed!');
        if (err.response) {
            console.error('Error Response:', JSON.stringify(err.response.data, null, 2));
        } else {
            console.error('Message:', err.message);
        }
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

runTests();
