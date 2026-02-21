import { query } from '../config/db.js';

export const getDashboardKPIs = async () => {
    const vehicleStats = await query(`
    SELECT 
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status = 'AVAILABLE') as available,
      COUNT(*) FILTER (WHERE status = 'ON_TRIP') as on_trip,
      COUNT(*) FILTER (WHERE status = 'IN_SHOP') as in_maintenance
    FROM vehicles WHERE is_retired = FALSE
  `);

    const driverStats = await query(`
    SELECT 
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status = 'ON_DUTY') as on_duty,
      COUNT(*) FILTER (WHERE status = 'ON_TRIP') as on_trip
    FROM drivers
  `);

    const tripStats = await query(`
    SELECT 
      COUNT(*) as total,
      SUM(revenue) as total_revenue,
      COUNT(*) FILTER (WHERE status = 'COMPLETED') as completed
    FROM trips
  `);

    return {
        vehicles: vehicleStats.rows[0],
        drivers: driverStats.rows[0],
        trips: tripStats.rows[0]
    };
};

export const getVehicleROI = async () => {
    const result = await query('SELECT * FROM vehicle_operational_cost ORDER BY total_operational_cost DESC');
    return result.rows;
};

export const getFuelEfficiency = async () => {
    const result = await query(`
    SELECT 
      v.name,
      v.license_plate,
      SUM(f.liters) as total_liters,
      SUM(f.cost) as total_cost,
      (MAX(f.odometer_km) - MIN(f.odometer_km)) as total_km,
      CASE 
        WHEN (MAX(f.odometer_km) - MIN(f.odometer_km)) > 0 
        THEN SUM(f.liters) / (MAX(f.odometer_km) - MIN(f.odometer_km)) * 100 
        ELSE 0 
      END as liters_per_100km
    FROM fuel_logs f
    JOIN vehicles v ON f.vehicle_id = v.id
    GROUP BY v.id, v.name, v.license_plate
  `);
    return result.rows;
};
