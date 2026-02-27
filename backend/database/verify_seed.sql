SELECT 
  'roles' as tbl, COUNT(*) as rows FROM roles
UNION ALL SELECT 'users',            COUNT(*) FROM users
UNION ALL SELECT 'vehicles',         COUNT(*) FROM vehicles
UNION ALL SELECT 'drivers',          COUNT(*) FROM drivers
UNION ALL SELECT 'trips',            COUNT(*) FROM trips
UNION ALL SELECT 'maintenance_logs', COUNT(*) FROM maintenance_logs
UNION ALL SELECT 'fuel_logs',        COUNT(*) FROM fuel_logs
UNION ALL SELECT 'driver_performance',COUNT(*) FROM driver_performance
UNION ALL SELECT 'audit_logs',       COUNT(*) FROM audit_logs
ORDER BY tbl;
