import React, { useState, useEffect } from 'react';
import { Truck, Users, Navigation, AlertTriangle, TrendingUp, DollarSign, Wrench, BarChart3 } from 'lucide-react';
import api from '../api/axios';
import { useSocket } from '../hooks/useSocket';

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-sm font-bold text-text-secondary uppercase tracking-widest mb-1">{title}</p>
                <h3 className="text-3xl font-extrabold text-navy">{value}</h3>
                {trend && (
                    <div className="mt-2 flex items-center text-xs font-bold text-success">
                        <TrendingUp size={14} className="mr-1" />
                        <span>{trend}</span>
                    </div>
                )}
            </div>
            <div className={`p-4 rounded-2xl ${color} bg-opacity-10 text-${color.split('-')[1]}-600`}>
                <Icon size={24} />
            </div>
        </div>
    </div>
);

const Dashboard = () => {
    const [stats, setStats] = useState({
        vehicles: { total: 0, available: 0, on_trip: 0, in_maintenance: 0 },
        drivers: { total: 0, on_duty: 0, on_trip: 0 },
        trips: { total: 0, total_revenue: 0, completed: 0 }
    });
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            const res = await api.get('/analytics/dashboard');
            setStats(res.data.data);
        } catch (err) {
            console.error('Failed to fetch dashboard stats', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    // Real-time updates
    useSocket('vehicle:statusChanged', fetchStats);
    useSocket('trip:created', fetchStats);
    useSocket('trip:completed', fetchStats);

    if (loading) return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-200 rounded-3xl" />)}
        </div>
    );

    return (
        <div className="space-y-8">
            {/* KPI Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Active Fleet"
                    value={stats.vehicles.total}
                    icon={Truck}
                    color="bg-blue-500"
                />
                <StatCard
                    title="Utilization"
                    value={`${((stats.vehicles.on_trip / Math.max(stats.vehicles.total, 1)) * 100).toFixed(1)}%`}
                    icon={Navigation}
                    color="bg-success"
                />
                <StatCard
                    title="Driver Status"
                    value={`${stats.drivers.on_duty} Duty`}
                    icon={Users}
                    color="bg-purple-500"
                />
                <StatCard
                    title="Revenue (USD)"
                    value={`$${(stats.trips.total_revenue || 0).toLocaleString()}`}
                    icon={DollarSign}
                    color="bg-warning"
                />
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Real-time Alerts */}
                <div className="lg:col-span-1 bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h4 className="text-lg font-bold text-navy flex items-center">
                            <AlertTriangle className="text-warning mr-2" size={20} />
                            Operational Alerts
                        </h4>
                        <span className="px-2 py-1 bg-gray-100 text-xs font-bold rounded-lg">{stats.vehicles.in_maintenance} Critical</span>
                    </div>

                    <div className="space-y-4">
                        {stats.vehicles.in_maintenance > 0 ? (
                            <div className="flex items-center p-4 rounded-2xl bg-warning/5 border border-warning/10 text-warning">
                                <Wrench size={18} className="mr-3" />
                                <p className="text-sm font-semibold">{stats.vehicles.in_maintenance} Vehicles in Shop</p>
                            </div>
                        ) : (
                            <div className="text-center py-10">
                                <p className="text-sm text-text-secondary font-medium">All systems green 🟢</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Charts Placeholder (Will implement in next step) */}
                <div className="lg:col-span-2 bg-navy rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
                    <div className="relative z-10">
                        <h4 className="text-xl font-bold text-white mb-2 uppercase tracking-widest">Fleet Performance</h4>
                        <p className="text-white/50 text-sm mb-8 font-medium">Monthly efficiency and ROI tracking</p>
                        <div className="h-64 flex items-center justify-center border border-white/10 rounded-2xl bg-white/5">
                            <BarChart3 className="text-white/20 animate-pulse" size={64} />
                            <span className="ml-4 text-white/40 font-bold">Chart Engine Initializing...</span>
                        </div>
                    </div>
                    {/* Decorative background element */}
                    <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-primary/20 blur-[100px] rounded-full group-hover:bg-primary/30 transition-all duration-700" />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
