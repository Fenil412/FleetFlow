-- =============================================================
-- FleetFlow Dummy Data Seed
-- All monetary values in ₹ (Indian Rupees)
-- Run: psql -U postgres -d myappdb -f seed.sql
-- =============================================================

-- Disable triggers for clean insert
SET session_replication_role = replica;

-- Clear existing data (order matters due to FK constraints)
TRUNCATE TABLE audit_logs, driver_performance, fuel_logs, maintenance_logs, trips, drivers, vehicles, users RESTART IDENTITY CASCADE;

-- ─────────────────────────────────────────────────
-- ROLES (already seeded by schema, but upsert safely)
-- ─────────────────────────────────────────────────
INSERT INTO roles (id, name, description) VALUES
(1, 'FLEET_MANAGER',    'Full fleet and financial access'),
(2, 'DISPATCHER',       'Manage trips and drivers'),
(3, 'SAFETY_OFFICER',   'Monitor safety and maintenance'),
(4, 'FINANCIAL_ANALYST','Access budgets, costs and analytics')
ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;

-- ─────────────────────────────────────────────────
-- USERS  (passwords are bcrypt of "FleetFlow@123")
-- ─────────────────────────────────────────────────
INSERT INTO users (id, role_id, name, email, password_hash, is_active, last_login_at, created_at) VALUES
(1, 1, 'Arjun Mehta',       'arjun.mehta@fleetflow.in',     '$2b$10$Y5lAQ6QZyj8jWU3k0N9u1OpsPVpv1UPSyGxjbGlgYHf5CvhRlXvKO', true, NOW() - INTERVAL '2 hours',  NOW() - INTERVAL '90 days'),
(2, 2, 'Priya Sharma',      'priya.sharma@fleetflow.in',    '$2b$10$Y5lAQ6QZyj8jWU3k0N9u1OpsPVpv1UPSyGxjbGlgYHf5CvhRlXvKO', true, NOW() - INTERVAL '30 minutes',NOW() - INTERVAL '60 days'),
(3, 3, 'Ravi Patel',        'ravi.patel@fleetflow.in',      '$2b$10$Y5lAQ6QZyj8jWU3k0N9u1OpsPVpv1UPSyGxjbGlgYHf5CvhRlXvKO', true, NOW() - INTERVAL '1 day',   NOW() - INTERVAL '45 days'),
(4, 4, 'Sneha Nair',        'sneha.nair@fleetflow.in',      '$2b$10$Y5lAQ6QZyj8jWU3k0N9u1OpsPVpv1UPSyGxjbGlgYHf5CvhRlXvKO', true, NOW() - INTERVAL '3 days',  NOW() - INTERVAL '30 days'),
(5, 2, 'Rahul Gupta',       'rahul.gupta@fleetflow.in',     '$2b$10$Y5lAQ6QZyj8jWU3k0N9u1OpsPVpv1UPSyGxjbGlgYHf5CvhRlXvKO', true, NOW() - INTERVAL '6 hours',  NOW() - INTERVAL '20 days')
ON CONFLICT (id) DO NOTHING;

SELECT setval('users_id_seq', 10);

-- ─────────────────────────────────────────────────
-- VEHICLES  (acquisition_cost in ₹)
-- ─────────────────────────────────────────────────
INSERT INTO vehicles (id, name, model, license_plate, vehicle_type, max_capacity_kg, odometer_km, acquisition_cost, status) VALUES
(1,  'Tata Prima Hauler',    'Tata Prima 4928.S',  'MH-04-AB-1234', 'Truck',  15000, 48250.50,  2800000.00, 'AVAILABLE'),
(2,  'Ashok Leyland Thunder','AL Ecomet 1915',     'MH-04-CD-5678', 'Truck',  12000, 63400.00,  2400000.00, 'ON_TRIP'),
(3,  'Mahindra Bolero Van',  'Mahindra Bolero Camper', 'MH-12-EF-9012', 'Van', 1500,  19800.25,  850000.00,  'AVAILABLE'),
(4,  'Eicher Pro Express',   'Eicher Pro 2095',    'GJ-01-GH-3456', 'Truck',  9000,  31500.00,  1600000.00, 'IN_SHOP'),
(5,  'Force Traveller Van',  'Force Traveller T1',  'DL-09-IJ-7890', 'Van',   1200,  24700.80,  740000.00,  'AVAILABLE'),
(6,  'Hero Splendor Bike',   'Hero Splendor+',     'KA-05-KL-2345', 'Bike',   150,   12300.60,   95000.00,  'AVAILABLE'),
(7,  'TVS Apache Courier',   'TVS Apache RTR 160', 'KA-05-MN-6789', 'Bike',   120,    9800.00,   88000.00,  'ON_TRIP'),
(8,  'Bharat Benz Heavy',    'BharatBenz 3128CR',  'RJ-14-OP-0123', 'Truck',  20000, 72100.40, 3500000.00,  'AVAILABLE'),
(9,  'Maruti Eeco Cargo',    'Maruti Eeco Cargo',  'MH-20-QR-4567', 'Van',    700,   18900.20,  650000.00,  'AVAILABLE'),
(10, 'Tata Ace Gold',        'Tata Ace Gold SE',   'UP-80-ST-8901', 'Truck',  1000,  27500.00,  560000.00,  'OUT_OF_SERVICE')
ON CONFLICT (id) DO NOTHING;

SELECT setval('vehicles_id_seq', 20);

-- ─────────────────────────────────────────────────
-- DRIVERS
-- ─────────────────────────────────────────────────
INSERT INTO drivers (id, name, license_number, license_expiry, phone, safety_score, status) VALUES
(1,  'Suresh Kumar',      'MH20230101-DL',  '2027-05-15', '+91-9876543210', 4.80, 'ON_DUTY'),
(2,  'Ramesh Yadav',      'UP20210502-DL',  '2026-09-22', '+91-9876543211', 4.50, 'ON_TRIP'),
(3,  'Vijay Singh',       'GJ20190903-DL',  '2025-12-10', '+91-9876543212', 3.90, 'OFF_DUTY'),
(4,  'Prakash Joshi',     'RJ20220304-DL',  '2027-03-30', '+91-9876543213', 4.95, 'ON_TRIP'),
(5,  'Santosh Reddy',     'KA20201205-DL',  '2026-07-18', '+91-9876543214', 4.20, 'OFF_DUTY'),
(6,  'Dinesh Thakur',     'DL20180806-DL',  '2025-11-05', '+91-9876543215', 3.70, 'OFF_DUTY'),
(7,  'Manish Patil',      'MH20230507-DL',  '2028-01-25', '+91-9876543216', 4.65, 'ON_DUTY'),
(8,  'Ganesh Borse',      'MH20210208-DL',  '2026-04-14', '+91-9876543217', 4.10, 'OFF_DUTY'),
(9,  'Anil Chauhan',      'UP20220609-DL',  '2027-08-20', '+91-9876543218', 4.55, 'OFF_DUTY'),
(10, 'Deepak Mishra',     'GJ20200910-DL',  '2026-02-28', '+91-9876543219', 3.85, 'SUSPENDED')
ON CONFLICT (id) DO NOTHING;

SELECT setval('drivers_id_seq', 20);

-- ─────────────────────────────────────────────────
-- TRIPS  (revenue in ₹)
-- ─────────────────────────────────────────────────
INSERT INTO trips (id, vehicle_id, driver_id, cargo_weight_kg, origin, destination, status, start_time, end_time, start_odometer, end_odometer, revenue, created_by) VALUES
(1,  1, 1, 8500, 'Mumbai, Maharashtra',    'Pune, Maharashtra',          'COMPLETED', NOW()-INTERVAL '30 days',  NOW()-INTERVAL '29 days 18 hours', 40000, 40200,  28500.00, 2),
(2,  2, 2, 9200, 'Mumbai, Maharashtra',    'Nagpur, Maharashtra',        'COMPLETED', NOW()-INTERVAL '25 days',  NOW()-INTERVAL '24 days 8 hours',  55200, 55940,  65000.00, 2),
(3,  3, 3, 900,  'Ahmedabad, Gujarat',     'Surat, Gujarat',             'COMPLETED', NOW()-INTERVAL '22 days',  NOW()-INTERVAL '22 days 4 hours',  19200, 19480,  12000.00, 2),
(4,  1, 1, 11000,'Pune, Maharashtra',      'Hyderabad, Telangana',       'COMPLETED', NOW()-INTERVAL '18 days',  NOW()-INTERVAL '17 days 10 hours', 40200, 41060,  75000.00, 2),
(5,  8, 4, 18500,'Delhi, Delhi',           'Jaipur, Rajasthan',          'COMPLETED', NOW()-INTERVAL '15 days',  NOW()-INTERVAL '14 days 20 hours', 70000, 70290, 105000.00, 2),
(6,  5, 5, 800,  'Bengaluru, Karnataka',   'Chennai, Tamil Nadu',        'COMPLETED', NOW()-INTERVAL '12 days',  NOW()-INTERVAL '11 days 16 hours', 24100, 24640,  22000.00, 2),
(7,  6, 7, 80,   'Bengaluru, Karnataka',   'Mysuru, Karnataka',          'COMPLETED', NOW()-INTERVAL '10 days',  NOW()-INTERVAL '10 days 4 hours',  12000, 12160,   4200.00, 2),
(8,  2, 2, 7800, 'Nagpur, Maharashtra',    'Bhopal, Madhya Pradesh',     'COMPLETED', NOW()-INTERVAL '8 days',   NOW()-INTERVAL '7 days 14 hours',  55940, 56550,  48500.00, 2),
(9,  9, 9, 620,  'Mumbai, Maharashtra',    'Thane, Maharashtra',         'COMPLETED', NOW()-INTERVAL '6 days',   NOW()-INTERVAL '6 days 2 hours',   18600, 18660,   3500.00, 2),
(10, 3, 3, 1100, 'Surat, Gujarat',         'Vadodara, Gujarat',          'COMPLETED', NOW()-INTERVAL '5 days',   NOW()-INTERVAL '4 days 22 hours',  19480, 19600,   8500.00, 2),
(11, 1, 1, 9800, 'Hyderabad, Telangana',   'Bengaluru, Karnataka',       'COMPLETED', NOW()-INTERVAL '4 days',   NOW()-INTERVAL '3 days 12 hours',  41060, 41630,  82000.00, 2),
(12, 8, 4, 16000,'Jaipur, Rajasthan',      'Udaipur, Rajasthan',         'COMPLETED', NOW()-INTERVAL '3 days',   NOW()-INTERVAL '2 days 20 hours',  70290, 70630,  74000.00, 2),
(13, 5, 5, 950,  'Chennai, Tamil Nadu',    'Kochi, Kerala',              'COMPLETED', NOW()-INTERVAL '2 days',   NOW()-INTERVAL '1 day 14 hours',   24640, 25270,  38000.00, 2),
(14, 7, 2, 100,  'Bengaluru, Karnataka',   'Tumkur, Karnataka',          'DISPATCHED',NOW()-INTERVAL '1 day',    NULL,                              9800,  NULL,       0.00, 2),
(15, 2, 4, 12000,'Bhopal, Madhya Pradesh', 'Lucknow, Uttar Pradesh',     'DISPATCHED',NOW()-INTERVAL '6 hours',  NULL,                              56550, NULL,       0.00, 2),
(16, 1, 7, 5000, 'Mumbai, Maharashtra',    'Nashik, Maharashtra',        'DRAFT',     NULL,                      NULL,                              NULL,  NULL,       0.00, 2),
(17, 3, 9, 800,  'Ahmedabad, Gujarat',     'Rajkot, Gujarat',            'DRAFT',     NULL,                      NULL,                              NULL,  NULL,       0.00, 2),
(18, 1, 1, 9000, 'Nashik, Maharashtra',    'Aurangabad, Maharashtra',    'COMPLETED', NOW()-INTERVAL '35 days',  NOW()-INTERVAL '34 days 14 hours', 47400, 47600,  32000.00, 1),
(19, 5, 5, 700,  'Kochi, Kerala',          'Thiruvananthapuram, Kerala', 'COMPLETED', NOW()-INTERVAL '40 days',  NOW()-INTERVAL '39 days 18 hours', 23000, 23215,  16000.00, 1),
(20, 8, 4, 17000,'Udaipur, Rajasthan',     'Ahmedabad, Gujarat',         'COMPLETED', NOW()-INTERVAL '45 days',  NOW()-INTERVAL '44 days 12 hours', 68400, 68700,  95000.00, 1)
ON CONFLICT (id) DO NOTHING;

SELECT setval('trips_id_seq', 30);

-- ─────────────────────────────────────────────────
-- MAINTENANCE LOGS (cost in ₹)
-- ─────────────────────────────────────────────────
INSERT INTO maintenance_logs (id, vehicle_id, service_type, description, cost, service_date, next_service_due, created_by) VALUES
(1,  1,  'Oil Change',          'Engine oil & filter replaced — Motul 15W40',               3200.00,  NOW()-INTERVAL '60 days', NOW()+INTERVAL '90 days',  3),
(2,  2,  'Tire Replacement',    '6 tyres replaced — MRF Meteor, front axle',               48000.00,  NOW()-INTERVAL '55 days', NOW()+INTERVAL '300 days', 3),
(3,  4,  'Engine Repair',       'Turbocharger replaced due to oil leak',                  125000.00,  NOW()-INTERVAL '10 days', NOW()+INTERVAL '180 days', 3),
(4,  1,  'Routine',             '50,000 km service — filters, belts, fluids',               9500.00,  NOW()-INTERVAL '45 days', NOW()+INTERVAL '120 days', 3),
(5,  3,  'Brake Service',       'Front brake pads and rotors replaced',                    11200.00,  NOW()-INTERVAL '38 days', NOW()+INTERVAL '150 days', 3),
(6,  5,  'Electrical',          'Alternator replaced, fuse box inspected',                  8500.00,  NOW()-INTERVAL '30 days', NOW()+INTERVAL '90 days',  3),
(7,  8,  'Inspection',          'Annual fitness certificate inspection — passed',            2500.00,  NOW()-INTERVAL '28 days', NOW()+INTERVAL '365 days', 3),
(8,  2,  'Oil Change',          'Engine oil changed — Castrol EDGE 10W30',                  3400.00,  NOW()-INTERVAL '20 days', NOW()+INTERVAL '90 days',  3),
(9,  6,  'Routine',             'Chain lubrication, brake adjustment, air filter clean',     1200.00,  NOW()-INTERVAL '15 days', NOW()+INTERVAL '45 days',  3),
(10, 9,  'Tire Replacement',    'Both tyres replaced — MRF Nylogrip',                       5800.00,  NOW()-INTERVAL '12 days', NOW()+INTERVAL '180 days', 3),
(11, 7,  'Brake Service',       'Rear brake shoes replaced',                                2200.00,  NOW()-INTERVAL '8 days',  NOW()+INTERVAL '90 days',  3),
(12, 1,  'Oil Change',          'Gear oil changed — Bharat Shell Heavy Duty',               2800.00,  NOW()-INTERVAL '5 days',  NOW()+INTERVAL '90 days',  3),
(13, 3,  'Electrical',          'Battery replaced — 55Ah Amaron',                           6500.00,  NOW()-INTERVAL '3 days',  NOW()+INTERVAL '365 days', 3),
(14, 8,  'Tire Replacement',    '2 tyres replaced — Bridgestone BSR36 rear axle',          22000.00,  NOW()-INTERVAL '2 days',  NOW()+INTERVAL '250 days', 3),
(15, 4,  'Engine Repair',       'Injector cleaning and recalibration',                     18500.00,  NOW()-INTERVAL '1 day',   NOW()+INTERVAL '120 days', 3)
ON CONFLICT (id) DO NOTHING;

SELECT setval('maintenance_logs_id_seq', 20);

-- ─────────────────────────────────────────────────
-- FUEL LOGS (cost in ₹, price ~₹96/L diesel)
-- ─────────────────────────────────────────────────
INSERT INTO fuel_logs (id, vehicle_id, trip_id, liters, cost, fuel_date, odometer_km, created_by) VALUES
(1,  1,  1,  120.00, 11520.00, NOW()-INTERVAL '30 days', 40000.00, 1),
(2,  2,  2,  235.00, 22560.00, NOW()-INTERVAL '25 days', 55200.00, 1),
(3,  3,  3,   42.00,  4032.00, NOW()-INTERVAL '22 days', 19200.00, 1),
(4,  1,  4,  190.00, 18240.00, NOW()-INTERVAL '18 days', 40200.00, 1),
(5,  8,  5,  280.00, 26880.00, NOW()-INTERVAL '15 days', 70000.00, 1),
(6,  5,  6,   85.00,  8160.00, NOW()-INTERVAL '12 days', 24100.00, 1),
(7,  6,  7,   10.00,   960.00, NOW()-INTERVAL '10 days', 12000.00, 1),
(8,  2,  8,  200.00, 19200.00, NOW()-INTERVAL '8 days',  55940.00, 1),
(9,  9,  9,   18.00,  1728.00, NOW()-INTERVAL '6 days',  18600.00, 1),
(10, 3, 10,   38.00,  3648.00, NOW()-INTERVAL '5 days',  19480.00, 1),
(11, 1, 11,  175.00, 16800.00, NOW()-INTERVAL '4 days',  41060.00, 1),
(12, 8, 12,  270.00, 25920.00, NOW()-INTERVAL '3 days',  70290.00, 1),
(13, 5, 13,  145.00, 13920.00, NOW()-INTERVAL '2 days',  24640.00, 1),
(14, 7, 14,   12.00,  1152.00, NOW()-INTERVAL '1 day',    9800.00, 1),
(15, 2, 15,  220.00, 21120.00, NOW()-INTERVAL '6 hours', 56550.00, 1),
(16, 1, NULL, 80.00,  7680.00, NOW()-INTERVAL '50 days', 47400.00, 1),
(17, 8, 20,  290.00, 27840.00, NOW()-INTERVAL '45 days', 68400.00, 1),
(18, 5, 19,   60.00,  5760.00, NOW()-INTERVAL '40 days', 23000.00, 1),
(19, 1, 18,  140.00, 13440.00, NOW()-INTERVAL '35 days', 47600.00, 1),
(20, 3, NULL, 30.00,  2880.00, NOW()-INTERVAL '28 days', 19000.00, 1)
ON CONFLICT (id) DO NOTHING;

SELECT setval('fuel_logs_id_seq', 30);

-- ─────────────────────────────────────────────────
-- DRIVER PERFORMANCE
-- ─────────────────────────────────────────────────
INSERT INTO driver_performance (id, driver_id, trip_id, rating, incidents, notes) VALUES
(1,  1, 1,  5, 0, 'Excellent on-time delivery, no incidents'),
(2,  2, 2,  4, 0, 'Good performance, slight delay at toll'),
(3,  3, 3,  4, 1, 'Minor route deviation but resolved quickly'),
(4,  1, 4,  5, 0, 'Outstanding — early delivery, cargo intact'),
(5,  4, 5,  5, 0, 'Perfect long-haul performance'),
(6,  5, 6,  4, 0, 'Smooth delivery, good communication'),
(7,  7, 7,  5, 0, 'Fast last-mile delivery'),
(8,  2, 8,  3, 1, 'Engine warning light reported, resolved at service'),
(9,  9, 9,  5, 0, 'Perfect short-distance delivery'),
(10, 3, 10, 4, 0, 'Good delivery, mild traffic delay'),
(11, 1, 11, 5, 0, 'Excellent interstate trip, no issues'),
(12, 4, 12, 5, 0, 'Outstanding performance on mountain route'),
(13, 5, 13, 4, 1, 'Border delay at state checkpost'),
(14, 1, 18, 5, 0, 'Efficient city-to-city delivery'),
(15, 5, 19, 4, 0, 'Good intra-state delivery')
ON CONFLICT (id) DO NOTHING;

SELECT setval('driver_performance_id_seq', 20);

-- ─────────────────────────────────────────────────
-- AUDIT LOGS
-- ─────────────────────────────────────────────────
INSERT INTO audit_logs (user_id, action, entity_type, entity_id, metadata, created_at) VALUES
(2, 'CREATE', 'trip',             1,  '{"status":"DRAFT"}',                           NOW()-INTERVAL '30 days'),
(2, 'UPDATE', 'trip',             1,  '{"status":"DISPATCHED"}',                      NOW()-INTERVAL '30 days'),
(2, 'UPDATE', 'trip',             1,  '{"status":"COMPLETED","revenue":28500}',        NOW()-INTERVAL '29 days'),
(3, 'CREATE', 'maintenance_log',  1,  '{"service_type":"Oil Change","cost":3200}',     NOW()-INTERVAL '60 days'),
(3, 'CREATE', 'maintenance_log',  3,  '{"service_type":"Engine Repair","cost":125000}',NOW()-INTERVAL '10 days'),
(1, 'CREATE', 'fuel_log',         1,  '{"liters":120,"cost":11520}',                   NOW()-INTERVAL '30 days'),
(2, 'CREATE', 'trip',             5,  '{"status":"DRAFT"}',                           NOW()-INTERVAL '15 days'),
(2, 'UPDATE', 'trip',             5,  '{"status":"COMPLETED","revenue":105000}',       NOW()-INTERVAL '14 days'),
(1, 'UPDATE', 'vehicle',          4,  '{"status":"IN_SHOP"}',                         NOW()-INTERVAL '10 days'),
(2, 'CREATE', 'trip',            14,  '{"status":"DISPATCHED"}',                      NOW()-INTERVAL '1 day');

-- Re-enable triggers
SET session_replication_role = DEFAULT;
