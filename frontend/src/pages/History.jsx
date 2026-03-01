import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { History as HistoryIcon, Truck, Users, Navigation, Wrench, Fuel, Loader2, Filter } from 'lucide-react';
import { formatSafeDate } from '../utils/dateUtils';
import { motion } from 'framer-motion';

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.04, type: 'spring', stiffness: 260, damping: 24 } }),
};


const ENTITY_ICONS = {
    vehicle: Truck,
    driver: Users,
    trip: Navigation,
    maintenance: Wrench,
    fuel: Fuel,
};

const ENTITY_COLORS = {
    vehicle: 'text-primary bg-primary/10',
    driver: 'text-success bg-success/10',
    trip: 'text-warning bg-warning/10',
    maintenance: 'text-danger bg-danger/10',
    fuel: 'text-purple-500 bg-purple-500/10',
};

const History = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                // Build a unified history from trips + maintenance + fuel logs
                const [tripsRes, maintRes, fuelRes] = await Promise.all([
                    api.get('/trips'),
                    api.get('/maintenance'),
                    api.get('/fuel'),
                ]);

                const trips = (tripsRes.data?.data?.trips || []).map(t => ({
                    id: `trip-${t.id}`,
                    type: 'trip',
                    action: t.status === 'COMPLETED' ? 'Trip Completed' : t.status === 'DISPATCHED' ? 'Trip Dispatched' : t.status === 'CANCELLED' ? 'Trip Cancelled' : 'Trip Created',
                    detail: `${t.origin} → ${t.destination}`,
                    secondary: `Vehicle: ${t.vehicle_name || 'N/A'} · Driver: ${t.driver_name || 'N/A'}`,
                    status: t.status,
                    date: t.updated_at || t.created_at,
                }));

                const maint = (maintRes.data?.data?.history || []).map(m => ({
                    id: `maint-${m.id}`,
                    type: 'maintenance',
                    action: 'Maintenance Logged',
                    detail: `${m.service_type} — ${m.vehicle_name || `Vehicle #${m.vehicle_id}`}`,
                    secondary: `Cost: $${parseFloat(m.cost || 0).toFixed(2)} · Date: ${formatSafeDate(m.service_date)}`,
                    status: 'IN_SHOP',
                    date: m.created_at,
                }));

                const fuel = (fuelRes.data?.data?.logs || []).map(f => ({
                    id: `fuel-${f.id}`,
                    type: 'fuel',
                    action: 'Fuel Log Added',
                    detail: `${parseFloat(f.liters || 0).toFixed(1)}L @ $${parseFloat(f.cost || 0).toFixed(2)} — Vehicle #${f.vehicle_id}`,
                    secondary: `Odometer: ${f.odometer_km ? `${f.odometer_km} km` : 'N/A'}`,
                    status: 'LOGGED',
                    date: f.fuel_date || f.created_at,
                }));

                const all = [...trips, ...maint, ...fuel].sort((a, b) =>
                    new Date(b.date || 0) - new Date(a.date || 0)
                );
                setLogs(all);
            } catch (err) {
                console.error('Failed to fetch history', err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const filtered = filter === 'ALL' ? logs : logs.filter(l => l.type === filter.toLowerCase());

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
                <div>
                    <div className="flex items-center gap-2">
                        <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 8, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}>
                            <HistoryIcon size={22} className="text-primary" />
                        </motion.div>
                        <h2 className="text-2xl font-bold gradient-text">Activity History</h2>
                    </div>
                    <p className="text-sm text-text-secondary font-medium mt-1 uppercase tracking-tighter">Complete audit trail of fleet operations</p>
                </div>
                <div className="flex items-center gap-2">
                    <Filter size={15} className="text-text-secondary" />
                    {['ALL', 'TRIP', 'MAINTENANCE', 'FUEL'].map(f => (
                        <motion.button
                            key={f}
                            whileHover={{ scale: 1.06 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase transition-all outline-none relative ${filter === f ? 'bg-primary text-white' : 'bg-card border border-border text-text-secondary hover:bg-background'
                                }`}
                        >
                            {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
                        </motion.button>
                    ))}
                </div>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Trips', count: logs.filter(l => l.type === 'trip').length, color: 'text-warning bg-warning/10' },
                    { label: 'Maintenance', count: logs.filter(l => l.type === 'maintenance').length, color: 'text-danger bg-danger/10' },
                    { label: 'Fuel Logs', count: logs.filter(l => l.type === 'fuel').length, color: 'text-purple-500 bg-purple-500/10' },
                ].map((s, i) => (
                    <motion.div key={s.label}
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 + 0.2, type: 'spring', stiffness: 260 }}
                        whileHover={{ y: -4, scale: 1.02 }}
                        className="bg-card rounded-2xl border border-border p-5 text-center shadow-sm shine-card cursor-default"
                    >
                        <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary mb-2">{s.label}</p>
                        <motion.p className={`text-2xl font-extrabold ${s.color.split(' ')[0]}`}
                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                            transition={{ delay: i * 0.1 + 0.4, type: 'spring', stiffness: 300 }}
                        >{s.count}</motion.p>
                    </motion.div>
                ))}
            </div>

            {/* Timeline */}
            <div className="bg-card rounded-3xl border border-border shadow-sm">
                {loading ? (
                    <div className="flex items-center justify-center py-24">
                        <Loader2 className="animate-spin text-primary mr-3" size={28} />
                        <span className="text-sm font-bold text-text-secondary uppercase tracking-widest">Loading history...</span>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24">
                        <HistoryIcon className="text-text-secondary/30 mb-4" size={48} />
                        <p className="text-sm font-bold text-text-secondary uppercase tracking-widest">No history found</p>
                        <p className="text-xs text-text-secondary mt-2">Start dispatching trips and logging maintenance to build an audit trail</p>
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {filtered.map((log, i) => {
                            const Icon = ENTITY_ICONS[log.type] || HistoryIcon;
                            const colorClass = ENTITY_COLORS[log.type] || 'text-text-secondary bg-background';
                            return (
                                <motion.div key={log.id}
                                    custom={i}
                                    variants={itemVariants}
                                    initial="hidden"
                                    animate="visible"
                                    whileHover={{ backgroundColor: 'rgba(var(--color-primary) / 0.03)', x: 2 }}
                                    className="flex items-start gap-4 px-6 py-4 transition-colors"
                                >
                                    <motion.div
                                        whileHover={{ rotate: 15, scale: 1.15 }}
                                        transition={{ type: 'spring', stiffness: 300 }}
                                        className={`h-10 w-10 min-w-[40px] rounded-xl ${colorClass} flex items-center justify-center flex-shrink-0 mt-0.5`}
                                    >
                                        <Icon size={18} />
                                    </motion.div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="text-sm font-black text-text-primary">{log.action}</span>
                                        </div>
                                        <p className="text-sm font-medium text-text-primary truncate">{log.detail}</p>
                                        <p className="text-xs text-text-secondary mt-0.5">{log.secondary}</p>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <p className="text-xs font-bold text-text-secondary">{formatSafeDate(log.date)}</p>
                                        <p className="text-[10px] text-text-secondary/60 mt-0.5 uppercase font-black tracking-widest">{log.type}</p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default History;
