import React, { useState, useEffect } from 'react';
import {
    Truck, Users, Navigation, AlertTriangle, TrendingUp, IndianRupee,
    Wrench, BarChart3, Fuel, CheckCircle2, Clock, Activity, Loader2
} from 'lucide-react';
import api from '../api/axios';
import { useSocket } from '../hooks/useSocket';
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const KPICard = ({ title, value, sub, icon: Icon, iconColor, iconBg }) => (
    <div className="bg-card rounded-2xl border border-border p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
        <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-text-secondary mb-1">{title}</p>
                <h3 className="text-2xl font-extrabold text-text-primary">{value}</h3>
                {sub && <p className="text-xs text-text-secondary font-medium mt-1">{sub}</p>}
            </div>
            <div className={`h-11 w-11 min-w-[44px] rounded-xl ${iconBg} flex items-center justify-center`}>
                <Icon className={iconColor} size={20} />
            </div>
        </div>
    </div>
);

const StatusDot = ({ color }) => (
    <span className={`inline-block h-2 w-2 rounded-full ${color} mr-2`} />
);

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
                    <div key={i} className="h-24 bg-card rounded-2xl border border-border animate-pulse" />
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

    // Bar chart — fleet status distribution
    const barData = {
        labels: ['Available', 'On Trip', 'In Shop', 'On Duty Drivers', 'Drivers on Trip', 'Completed Trips'],
        datasets: [{
            label: 'Count',
            data: [v.available, v.on_trip, v.in_maintenance, driverAvail, driverOnTrip, t.completed],
            backgroundColor: [
                'rgba(16,185,129,0.85)',
                'rgba(37,99,235,0.85)',
                'rgba(245,158,11,0.85)',
                'rgba(139,92,246,0.85)',
                'rgba(236,72,153,0.85)',
                'rgba(16,185,129,0.85)',
            ],
            borderRadius: 8,
            borderSkipped: false,
        }],
    };

    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            y: { beginAtZero: true, ticks: { stepSize: 1, color: '#94a3b8' }, grid: { color: 'rgba(148,163,184,0.1)' } },
            x: { ticks: { color: '#94a3b8', font: { size: 10 } }, grid: { display: false } },
        },
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-text-primary">Fleet Dashboard</h2>
                <p className="text-sm text-text-secondary font-medium mt-1 uppercase tracking-tighter">Real-time fleet operations overview</p>
            </div>

            {/* KPI Grid — 8 cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <KPICard title="Total Vehicles" value={v.total} sub={`${v.available} available`} icon={Truck} iconColor="text-primary" iconBg="bg-primary/10" />
                <KPICard title="Fleet Utilization" value={`${utilizationPct}%`} sub={`${v.on_trip} on trip`} icon={Activity} iconColor="text-success" iconBg="bg-success/10" />
                <KPICard title="In Maintenance" value={v.in_maintenance} sub="Vehicles in shop" icon={Wrench} iconColor="text-warning" iconBg="bg-warning/10" />
                <KPICard title="Total Revenue" value={`₹${totalRevenue.toLocaleString('en-IN')}`} sub="All completed trips" icon={IndianRupee} iconColor="text-pink-500" iconBg="bg-pink-500/10" />
                <KPICard title="Total Drivers" value={d.total} sub={`${driverAvail} on duty`} icon={Users} iconColor="text-purple-500" iconBg="bg-purple-500/10" />
                <KPICard title="Drivers on Trip" value={driverOnTrip} sub={`${d.total - driverAvail - driverOnTrip} off duty`} icon={Navigation} iconColor="text-blue-400" iconBg="bg-blue-400/10" />
                <KPICard title="Total Trips" value={t.total} sub={`${t.completed} completed`} icon={CheckCircle2} iconColor="text-success" iconBg="bg-success/10" />
                <KPICard title="Completion Rate" value={`${completionRate}%`} sub="Trips completed" icon={TrendingUp} iconColor="text-warning" iconBg="bg-warning/10" />
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Fleet Status Sidebar */}
                <div className="bg-card rounded-3xl border border-border p-6 shadow-sm space-y-4">
                    <h4 className="text-sm font-black uppercase tracking-widest text-text-secondary flex items-center gap-2">
                        <AlertTriangle size={14} className="text-warning" /> Fleet Status Breakdown
                    </h4>

                    <div className="space-y-3">
                        {[
                            { label: 'Vehicles Available', value: v.available, total: v.total, dot: 'bg-success', bar: 'bg-success/20 text-success' },
                            { label: 'Vehicles On Trip', value: v.on_trip, total: v.total, dot: 'bg-primary', bar: 'bg-primary/20 text-primary' },
                            { label: 'Vehicles In Shop', value: v.in_maintenance, total: v.total, dot: 'bg-warning', bar: 'bg-warning/20 text-warning' },
                        ].map(s => (
                            <div key={s.label}>
                                <div className="flex items-center justify-between text-xs font-bold text-text-secondary mb-1">
                                    <span className="flex items-center"><StatusDot color={s.dot} />{s.label}</span>
                                    <span className="font-black text-text-primary">{s.value}/{s.total}</span>
                                </div>
                                <div className="h-1.5 bg-border rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${s.dot}`}
                                        style={{ width: `${s.total > 0 ? (s.value / s.total) * 100 : 0}%`, transition: 'width 0.6s ease' }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <hr className="border-border" />

                    <div className="space-y-3">
                        {[
                            { label: 'Drivers On Duty', value: driverAvail, total: d.total, dot: 'bg-purple-500' },
                            { label: 'Drivers On Trip', value: driverOnTrip, total: d.total, dot: 'bg-blue-400' },
                        ].map(s => (
                            <div key={s.label}>
                                <div className="flex items-center justify-between text-xs font-bold text-text-secondary mb-1">
                                    <span className="flex items-center"><StatusDot color={s.dot} />{s.label}</span>
                                    <span className="font-black text-text-primary">{s.value}/{s.total}</span>
                                </div>
                                <div className="h-1.5 bg-border rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${s.dot}`}
                                        style={{ width: `${s.total > 0 ? (s.value / s.total) * 100 : 0}%`, transition: 'width 0.6s ease' }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <hr className="border-border" />

                    {/* Alerts */}
                    {v.in_maintenance > 0 ? (
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-warning/10 border border-warning/20">
                            <Wrench size={16} className="text-warning flex-shrink-0" />
                            <p className="text-xs font-bold text-warning">{v.in_maintenance} vehicle{v.in_maintenance > 1 ? 's' : ''} currently in shop</p>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-success/10 border border-success/20">
                            <CheckCircle2 size={16} className="text-success" />
                            <p className="text-xs font-bold text-success">All systems operational ✓</p>
                        </div>
                    )}
                </div>

                {/* Fleet Performance Bar Chart */}
                <div className="lg:col-span-2 bg-card rounded-3xl border border-border p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h4 className="text-base font-extrabold text-text-primary">Fleet Performance Overview</h4>
                            <p className="text-xs text-text-secondary font-bold uppercase tracking-widest mt-0.5">Real-time database snapshot</p>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-success">
                            <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                            Live
                        </div>
                    </div>
                    <div className="h-64">
                        <Bar data={barData} options={barOptions} />
                    </div>
                </div>
            </div>

            {/* ROI Summary Row */}
            {roi.length > 0 && (
                <div className="bg-card rounded-3xl border border-border p-6 shadow-sm">
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-text-secondary mb-5">Vehicle Operational Cost Summary</h4>
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
                            <tbody className="divide-y divide-border">
                                {roi.map(v => (
                                    <tr key={v.id} className="text-sm hover:bg-background/50 transition-colors">
                                        <td className="py-3 pr-8 font-bold text-text-primary">{v.name}</td>
                                        <td className="py-3 pr-8 text-text-secondary font-medium">{v.license_plate}</td>
                                        <td className="py-3 pr-8 font-medium text-text-secondary">₹{parseFloat(v.total_fuel_cost || 0).toLocaleString('en-IN')}</td>
                                        <td className="py-3 pr-8 font-medium text-text-secondary">₹{parseFloat(v.total_maint_cost || 0).toLocaleString('en-IN')}</td>
                                        <td className="py-3 font-extrabold text-danger">₹{parseFloat(v.total_operational_cost || 0).toLocaleString('en-IN')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
