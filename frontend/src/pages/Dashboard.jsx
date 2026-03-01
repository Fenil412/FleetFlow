import React, { useState, useEffect, useRef } from 'react';
import {
    Truck, Users, Navigation, AlertTriangle, TrendingUp, IndianRupee,
    Wrench, BarChart3, Fuel, CheckCircle2, Clock, Activity, Loader2, Zap,
} from 'lucide-react';
import { motion, useInView, useMotionValue, useSpring, useTransform } from 'framer-motion';
import api from '../api/axios';
import { useSocket } from '../hooks/useSocket';
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

/* ── Animated Counter ── */
const AnimatedCount = ({ value, prefix = '', suffix = '' }) => {
    const [display, setDisplay] = useState(0);
    useEffect(() => {
        const n = parseFloat(String(value).replace(/[^0-9.]/g, '')) || 0;
        let start = 0;
        const step = n / 40;
        const timer = setInterval(() => {
            start += step;
            if (start >= n) { setDisplay(n); clearInterval(timer); }
            else setDisplay(Math.floor(start));
        }, 20);
        return () => clearInterval(timer);
    }, [value]);
    return <>{prefix}{typeof value === 'string' && value.includes('₹') ? `₹${display.toLocaleString('en-IN')}` : display}{suffix}</>;
};

/* ── 3D Tilt KPI Card ── */
const KPICard = ({ title, value, sub, icon: Icon, iconColor, iconBg, delay = 0 }) => {
    const ref = useRef(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 300, damping: 30 });
    const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 300, damping: 30 });

    const handleMouse = (e) => {
        const rect = ref.current.getBoundingClientRect();
        x.set((e.clientX - rect.left) / rect.width - 0.5);
        y.set((e.clientY - rect.top) / rect.height - 0.5);
    };
    const handleLeave = () => { x.set(0); y.set(0); };

    const isInView = useInView(ref, { once: true, margin: '-40px' });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ rotateX, rotateY, transformStyle: 'preserve-3d', perspective: 800 }}
            onMouseMove={handleMouse}
            onMouseLeave={handleLeave}
            whileHover={{ z: 20 }}
            className="bg-card rounded-2xl border border-border p-5 shadow-sm hover:shadow-xl hover:border-primary/30 transition-shadow duration-300 shine-card cursor-default"
        >
            <div className="flex items-start justify-between" style={{ transform: 'translateZ(20px)' }}>
                <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-text-secondary mb-1">{title}</p>
                    <h3 className="text-2xl font-extrabold text-text-primary">
                        <AnimatedCount value={value} />
                    </h3>
                    {sub && <p className="text-xs text-text-secondary font-medium mt-1">{sub}</p>}
                </div>
                <motion.div
                    whileHover={{ rotate: 20, scale: 1.2 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    className={`h-11 w-11 min-w-[44px] rounded-xl ${iconBg} flex items-center justify-center`}
                    style={{ transform: 'translateZ(30px)' }}
                >
                    <Icon className={iconColor} size={20} />
                </motion.div>
            </div>
        </motion.div>
    );
};

const StatusDot = ({ color }) => (
    <span className={`relative inline-flex h-2 w-2 rounded-full ${color} mr-2`}>
        <span className={`absolute inline-flex h-full w-full rounded-full ${color} opacity-75 animate-ping`} />
    </span>
);

const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.07 } },
};
const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 260, damping: 25 } },
};

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [roi, setRoi] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            const [dashRes, roiRes] = await Promise.all([
                api.get('/analytics/dashboard'),
                api.get('/analytics/roi').catch(() => ({ data: { data: [] } })),
            ]);
            setStats(dashRes.data.data);
            const roiRows = roiRes.data?.data?.vehicles || roiRes.data?.data || [];
            setRoi(roiRows);
        } catch (err) {
            console.error('Failed to fetch dashboard stats', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchStats(); }, []);
    useSocket('vehicle:statusChanged', fetchStats);
    useSocket('trip:created', fetchStats);
    useSocket('trip:completed', fetchStats);

    if (loading) return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                    <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                        className="h-24 skeleton rounded-2xl border border-border" />
                ))}
            </div>
        </div>
    );

    const v = stats?.vehicles || { total: 0, available: 0, on_trip: 0, in_maintenance: 0 };
    const d = stats?.drivers || { total: 0, on_duty: 0, on_trip: 0 };
    const t = stats?.trips || { total: 0, total_revenue: 0, completed: 0 };

    const utilizationPct = ((v.on_trip / Math.max(v.total, 1)) * 100).toFixed(1);
    const completionRate = ((t.completed / Math.max(t.total, 1)) * 100).toFixed(0);
    const totalRevenue = parseFloat(t.total_revenue || 0);
    const driverOnTrip = d.on_trip || 0;
    const driverAvail = d.on_duty || 0;

    const barData = {
        labels: ['Available', 'On Trip', 'In Shop', 'On Duty Drivers', 'Drivers on Trip', 'Completed Trips'],
        datasets: [{
            label: 'Count',
            data: [v.available, v.on_trip, v.in_maintenance, driverAvail, driverOnTrip, t.completed],
            backgroundColor: [
                'rgba(16,185,129,0.85)', 'rgba(37,99,235,0.85)', 'rgba(245,158,11,0.85)',
                'rgba(139,92,246,0.85)', 'rgba(236,72,153,0.85)', 'rgba(16,185,129,0.85)',
            ],
            borderRadius: 8,
            borderSkipped: false,
        }],
    };

    const barOptions = {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            y: { beginAtZero: true, ticks: { stepSize: 1, color: '#94a3b8' }, grid: { color: 'rgba(148,163,184,0.1)' } },
            x: { ticks: { color: '#94a3b8', font: { size: 10 } }, grid: { display: false } },
        },
    };

    const kpis = [
        { title: 'Total Vehicles', value: v.total, sub: `${v.available} available`, icon: Truck, iconColor: 'text-primary', iconBg: 'bg-primary/10' },
        { title: 'Fleet Utilization', value: `${utilizationPct}%`, sub: `${v.on_trip} on trip`, icon: Activity, iconColor: 'text-success', iconBg: 'bg-success/10' },
        { title: 'In Maintenance', value: v.in_maintenance, sub: 'Vehicles in shop', icon: Wrench, iconColor: 'text-warning', iconBg: 'bg-warning/10' },
        { title: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, sub: 'All completed trips', icon: IndianRupee, iconColor: 'text-pink-500', iconBg: 'bg-pink-500/10' },
        { title: 'Total Drivers', value: d.total, sub: `${driverAvail} on duty`, icon: Users, iconColor: 'text-purple-500', iconBg: 'bg-purple-500/10' },
        { title: 'Drivers on Trip', value: driverOnTrip, sub: `${d.total - driverAvail - driverOnTrip} off duty`, icon: Navigation, iconColor: 'text-blue-400', iconBg: 'bg-blue-400/10' },
        { title: 'Total Trips', value: t.total, sub: `${t.completed} completed`, icon: CheckCircle2, iconColor: 'text-success', iconBg: 'bg-success/10' },
        { title: 'Completion Rate', value: `${completionRate}%`, sub: 'Trips completed', icon: TrendingUp, iconColor: 'text-warning', iconBg: 'bg-warning/10' },
    ];

    return (
        <div className="space-y-6 relative">
            {/* Floating Background Orbs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                <motion.div
                    animate={{ x: [0, 40, 0], y: [0, -30, 0], scale: [1, 1.1, 1] }}
                    transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
                    className="orb absolute top-20 right-1/4 w-80 h-80 bg-primary/5"
                />
                <motion.div
                    animate={{ x: [0, -30, 0], y: [0, 40, 0], scale: [1, 1.15, 1] }}
                    transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
                    className="orb absolute bottom-40 left-1/3 w-60 h-60 bg-purple-500/5"
                />
                <motion.div
                    animate={{ x: [0, 20, 0], y: [0, -20, 0] }}
                    transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 8 }}
                    className="orb absolute top-1/2 right-10 w-40 h-40 bg-cyan-400/5"
                />
            </div>

            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <div className="flex items-center gap-3">
                    <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}>
                        <Zap size={24} className="text-primary" />
                    </motion.div>
                    <h2 className="text-2xl font-bold gradient-text">Fleet Dashboard</h2>
                </div>
                <p className="text-sm text-text-secondary font-medium mt-1 uppercase tracking-tighter">Real-time fleet operations overview</p>
            </motion.div>

            {/* KPI Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {kpis.map((kpi, i) => (
                    <KPICard key={kpi.title} {...kpi} delay={i * 0.06} />
                ))}
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Fleet Status Sidebar */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.55, duration: 0.5 }}
                    className="bg-card rounded-3xl border border-border p-6 shadow-sm space-y-4 shine-card"
                >
                    <h4 className="text-sm font-black uppercase tracking-widest text-text-secondary flex items-center gap-2">
                        <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}>
                            <AlertTriangle size={14} className="text-warning" />
                        </motion.div>
                        Fleet Status Breakdown
                    </h4>

                    <div className="space-y-3">
                        {[
                            { label: 'Vehicles Available', value: v.available, total: v.total, dot: 'bg-success', bar: 'bg-success' },
                            { label: 'Vehicles On Trip', value: v.on_trip, total: v.total, dot: 'bg-primary', bar: 'bg-primary' },
                            { label: 'Vehicles In Shop', value: v.in_maintenance, total: v.total, dot: 'bg-warning', bar: 'bg-warning' },
                        ].map((s, i) => (
                            <motion.div key={s.label}
                                initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.6 + i * 0.1 }}
                            >
                                <div className="flex items-center justify-between text-xs font-bold text-text-secondary mb-1">
                                    <span className="flex items-center"><StatusDot color={s.dot} />{s.label}</span>
                                    <span className="font-black text-text-primary">{s.value}/{s.total}</span>
                                </div>
                                <div className="h-1.5 bg-border rounded-full overflow-hidden">
                                    <motion.div
                                        className={`h-full rounded-full ${s.bar}`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${s.total > 0 ? (s.value / s.total) * 100 : 0}%` }}
                                        transition={{ delay: 0.8 + i * 0.1, duration: 0.8, ease: 'easeOut' }}
                                    />
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <hr className="border-border" />

                    <div className="space-y-3">
                        {[
                            { label: 'Drivers On Duty', value: driverAvail, total: d.total, dot: 'bg-purple-500', bar: 'bg-purple-500' },
                            { label: 'Drivers On Trip', value: driverOnTrip, total: d.total, dot: 'bg-blue-400', bar: 'bg-blue-400' },
                        ].map((s, i) => (
                            <motion.div key={s.label}
                                initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.9 + i * 0.1 }}
                            >
                                <div className="flex items-center justify-between text-xs font-bold text-text-secondary mb-1">
                                    <span className="flex items-center"><StatusDot color={s.dot} />{s.label}</span>
                                    <span className="font-black text-text-primary">{s.value}/{s.total}</span>
                                </div>
                                <div className="h-1.5 bg-border rounded-full overflow-hidden">
                                    <motion.div
                                        className={`h-full rounded-full ${s.bar}`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${s.total > 0 ? (s.value / s.total) * 100 : 0}%` }}
                                        transition={{ delay: 1.0 + i * 0.1, duration: 0.8, ease: 'easeOut' }}
                                    />
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <hr className="border-border" />

                    <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                        {v.in_maintenance > 0 ? (
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-warning/10 border border-warning/20">
                                <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                                    <Wrench size={16} className="text-warning flex-shrink-0" />
                                </motion.div>
                                <p className="text-xs font-bold text-warning">{v.in_maintenance} vehicle{v.in_maintenance > 1 ? 's' : ''} currently in shop</p>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-success/10 border border-success/20">
                                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                                    <CheckCircle2 size={16} className="text-success" />
                                </motion.div>
                                <p className="text-xs font-bold text-success">All systems operational ✓</p>
                            </div>
                        )}
                    </motion.div>
                </motion.div>

                {/* Fleet Performance Bar Chart */}
                <motion.div
                    initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.55, duration: 0.5 }}
                    className="lg:col-span-2 bg-card rounded-3xl border border-border p-6 shadow-sm shine-card"
                >
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h4 className="text-base font-extrabold text-text-primary">Fleet Performance Overview</h4>
                            <p className="text-xs text-text-secondary font-bold uppercase tracking-widest mt-0.5">Real-time database snapshot</p>
                        </div>
                        <motion.div
                            animate={{ scale: [1, 1.3, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="flex items-center gap-1.5 text-xs font-bold text-success"
                        >
                            <span className="h-2 w-2 rounded-full bg-success animate-pulse" /> Live
                        </motion.div>
                    </div>
                    <div className="h-64">
                        <Bar data={barData} options={barOptions} />
                    </div>
                </motion.div>
            </div>

            {/* ROI Summary Row */}
            {roi.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                    className="bg-card rounded-3xl border border-border p-6 shadow-sm shine-card"
                >
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-text-secondary mb-5 flex items-center gap-2">
                        <BarChart3 size={14} className="text-primary" />
                        Vehicle Operational Cost Summary
                    </h4>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[10px] font-black uppercase tracking-[0.15em] text-text-secondary border-b border-border">
                                    <th className="pb-3 pr-8">Vehicle</th>
                                    <th className="pb-3 pr-8">Plate</th>
                                    <th className="pb-3 pr-8">Fuel Cost</th>
                                    <th className="pb-3 pr-8">Maintenance Cost</th>
                                    <th className="pb-3">Total Op. Cost</th>
                                </tr>
                            </thead>
                            <motion.tbody
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="divide-y divide-border"
                            >
                                {roi.map((v, i) => (
                                    <motion.tr
                                        key={v.id}
                                        variants={rowVariants}
                                        whileHover={{ backgroundColor: 'rgba(var(--color-primary) / 0.04)', x: 2 }}
                                        className="text-sm transition-colors cursor-default"
                                    >
                                        <td className="py-3 pr-8 font-bold text-text-primary">{v.name}</td>
                                        <td className="py-3 pr-8 text-text-secondary font-medium">{v.license_plate}</td>
                                        <td className="py-3 pr-8 font-medium text-text-secondary">₹{parseFloat(v.total_fuel_cost || 0).toLocaleString('en-IN')}</td>
                                        <td className="py-3 pr-8 font-medium text-text-secondary">₹{parseFloat(v.total_maint_cost || 0).toLocaleString('en-IN')}</td>
                                        <td className="py-3 font-extrabold text-success">₹{parseFloat(v.total_operational_cost || 0).toLocaleString('en-IN')}</td>
                                    </motion.tr>
                                ))}
                            </motion.tbody>
                        </table>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default Dashboard;
