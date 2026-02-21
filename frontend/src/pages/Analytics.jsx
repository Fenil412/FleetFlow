import React, { useState, useEffect } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import api from '../api/axios';
import { Download, Filter, TrendingUp, TrendingDown } from 'lucide-react';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const Analytics = () => {
    const [roiData, setRoiData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('/analytics/roi');
                setRoiData(res.data.data.vehicles || []);
            } catch (err) {
                console.error('Failed to fetch analytics', err);
                if (err.response?.status === 403) {
                    setError('Access denied: You need Administrator permissions to view detailed ROI data.');
                } else {
                    setError('Failed to load analytical data.');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const lineChartData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                label: 'Fuel Efficiency (km/L)',
                data: [8.5, 9.0, 8.8, 9.2, 9.5, 9.3],
                borderColor: '#2563EB',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                fill: true,
                tension: 0.4,
            },
        ],
    };

    const barChartData = {
        labels: roiData.map(v => v.name) || ['V1', 'V2', 'V3'],
        datasets: [
            {
                label: 'Operational ROI (%)',
                data: roiData.map(v => v.roi_percentage) || [45, 52, 38],
                backgroundColor: '#3B82F6', // Primary Blue for better visibility in both themes
                borderRadius: 12,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    display: false,
                },
            },
            x: {
                grid: {
                    display: false,
                },
            },
        },
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-text-primary">Fleet Analytics</h2>
                    <p className="text-sm text-text-secondary font-medium mt-1 uppercase tracking-tighter">Financial and operational performance insights</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-text-secondary font-semibold hover:bg-background transition-colors outline-none">
                        <Filter size={18} />
                        Period
                    </button>
                    <button className="flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 hover:-translate-y-0.5 transition-all outline-none">
                        <Download size={18} />
                        Export Report
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Performance Chart */}
                <div className="bg-card rounded-3xl p-8 shadow-sm border border-border">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h4 className="text-lg font-extrabold text-text-primary">Fuel Efficiency Trends</h4>
                            <p className="text-xs text-text-secondary font-bold uppercase tracking-widest mt-1">Last 6 Months</p>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-black text-primary">9.3 <span className="text-xs font-bold text-text-secondary">avg</span></p>
                            <div className="flex items-center text-success text-[10px] font-bold">
                                <TrendingUp size={12} className="mr-1" />
                                +12% vs LY
                            </div>
                        </div>
                    </div>
                    <div className="h-64">
                        <Line data={lineChartData} options={chartOptions} />
                    </div>
                </div>

                {/* ROI Chart */}
                <div className="bg-card rounded-3xl p-8 shadow-sm border border-border">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h4 className="text-lg font-extrabold text-text-primary">Vehicle Operational ROI</h4>
                            <p className="text-xs text-text-secondary font-bold uppercase tracking-widest mt-1">Based on Trip Revenue vs Service Costs</p>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-black text-text-primary">42.5% <span className="text-xs font-bold text-text-secondary">avg</span></p>
                            <div className="flex items-center text-danger text-[10px] font-bold">
                                <TrendingDown size={12} className="mr-1" />
                                -5% vs Target
                            </div>
                        </div>
                    </div>
                    <div className="h-64">
                        {loading ? (
                            <div className="h-full w-full bg-background rounded-2xl flex items-center justify-center animate-pulse" />
                        ) : error ? (
                            <div className="h-full w-full bg-background rounded-2xl flex flex-col items-center justify-center p-6 text-center">
                                <p className="text-sm font-bold text-text-secondary leading-relaxed">{error}</p>
                            </div>
                        ) : (
                            <Bar data={barChartData} options={chartOptions} />
                        )}
                    </div>
                </div>
            </div>

            {/* Strategic Insights */}
            <div className="bg-card rounded-3xl p-8 text-text-primary shadow-sm border border-border relative overflow-hidden">
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-2 border-l-2 border-primary pl-6">
                        <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">Profitability Alert</p>
                        <h5 className="text-lg font-bold">Aging Fleet Impact</h5>
                        <p className="text-sm text-text-secondary">Vehicles over 5 years are showing 15% higher maintenance costs vs revenue growth.</p>
                    </div>
                    <div className="space-y-2 border-l-2 border-success pl-6">
                        <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">Efficiency Gain</p>
                        <h5 className="text-lg font-bold">Optimized Route Effect</h5>
                        <p className="text-sm text-text-secondary">Recent dispatcher updates improved fuel efficiency by 0.5km/L across the fleet.</p>
                    </div>
                    <div className="space-y-2 border-l-2 border-warning pl-6">
                        <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">Asset Utilization</p>
                        <h5 className="text-lg font-bold">High Idle Warning</h5>
                        <p className="text-sm text-text-secondary">4 vehicles had &gt;20% idle time last week. Operational review recommended.</p>
                    </div>
                </div>
                <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
            </div>
        </div>
    );
};

export default Analytics;
