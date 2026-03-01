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

export const getMonthlyFinancials = async () => {
  const result = await query(`
    WITH revenue AS (
        SELECT EXTRACT(YEAR FROM created_at) as yr, EXTRACT(MONTH FROM created_at) as mo,
               COALESCE(SUM(revenue), 0) as revenue
        FROM trips WHERE status = 'COMPLETED'
        GROUP BY yr, mo
    ),
    fuel AS (
        SELECT EXTRACT(YEAR FROM fuel_date) as yr, EXTRACT(MONTH FROM fuel_date) as mo,
               COALESCE(SUM(cost), 0) as fuel_cost
        FROM fuel_logs
        GROUP BY yr, mo
    ),
    maint AS (
        SELECT EXTRACT(YEAR FROM service_date) as yr, EXTRACT(MONTH FROM service_date) as mo,
               COALESCE(SUM(cost), 0) as maintenance_cost
        FROM maintenance_logs
        GROUP BY yr, mo
    )
    SELECT 
        COALESCE(r.yr, f.yr, m.yr) as year,
        COALESCE(r.mo, f.mo, m.mo) as month,
        COALESCE(r.revenue, 0) as revenue,
        COALESCE(f.fuel_cost, 0) as fuel_cost,
        COALESCE(m.maintenance_cost, 0) as maintenance_cost
    FROM revenue r
    FULL OUTER JOIN fuel f ON r.yr = f.yr AND r.mo = f.mo
    FULL OUTER JOIN maint m ON COALESCE(r.yr, f.yr) = m.yr AND COALESCE(r.mo, f.mo) = m.mo
    ORDER BY year DESC, month DESC
    LIMIT 12
  `);
  return result.rows;
};

export const getDailyProfit = async () => {
  const result = await query(`
        WITH days AS (
            SELECT generate_series(
                CURRENT_DATE - INTERVAL '29 days',
                CURRENT_DATE,
                '1 day'::interval
            )::date as date
        ),
        daily_revenue AS (
            SELECT created_at::date as date, SUM(revenue) as revenue
            FROM trips
            WHERE status = 'COMPLETED' AND created_at >= CURRENT_DATE - INTERVAL '30 days'
            GROUP BY date
        ),
        daily_fuel AS (
            SELECT fuel_date::date as date, SUM(cost) as cost
            FROM fuel_logs
            WHERE fuel_date >= CURRENT_DATE - INTERVAL '30 days'
            GROUP BY date
        ),
        daily_maint AS (
            SELECT service_date as date, SUM(cost) as cost
            FROM maintenance_logs
            WHERE service_date >= CURRENT_DATE - INTERVAL '30 days'
            GROUP BY date
        )
        SELECT 
            d.date,
            COALESCE(r.revenue, 0) as revenue,
            COALESCE(f.cost, 0) as fuel_cost,
            COALESCE(m.cost, 0) as maintenance_cost,
            (COALESCE(r.revenue, 0) - COALESCE(f.cost, 0) - COALESCE(m.cost, 0)) as profit
        FROM days d
        LEFT JOIN daily_revenue r ON d.date = r.date
        LEFT JOIN daily_fuel f ON d.date = f.date
        LEFT JOIN daily_maint m ON d.date = m.date
        ORDER BY d.date ASC
    `);
  return result.rows;
};

export const getBookingGeography = async () => {
  try {
    const result = await query(`
        SELECT 
            TRIM(SPLIT_PART(origin, ',', -1)) AS city,
            COUNT(*) AS booking_count,
            COALESCE(SUM(revenue), 0) AS total_revenue
        FROM trips
        WHERE status != 'CANCELLED'
          AND origin IS NOT NULL
          AND origin != ''
        GROUP BY TRIM(SPLIT_PART(origin, ',', -1))
        ORDER BY booking_count DESC
        LIMIT 20
    `);
    return result.rows;
  } catch (err) {
    console.error('[getBookingGeography] query failed:', err.message);
    return [];
  }
};
