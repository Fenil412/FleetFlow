import React, { useState, useEffect } from 'react';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
    BarElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import api from '../api/axios';
import { Download, FileText, Table, TrendingUp, Fuel, Activity, DollarSign, Loader2 } from 'lucide-react';
import { downloadCSV, downloadPDF } from '../utils/exportUtils';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const Analytics = () => {
    const [roiData, setRoiData] = useState([]);
    const [efficiencyData, setEfficiencyData] = useState([]);
    const [financialData, setFinancialData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [roiRes, effRes, finRes] = await Promise.all([
                    api.get('/analytics/roi'),
                    api.get('/analytics/efficiency').catch(() => ({ data: { data: { efficiency: [] } } })),
                    api.get('/analytics/financial').catch(() => ({ data: { data: { monthly: [] } } })),
                ]);
                setRoiData(roiRes.data.data.vehicles || roiRes.data.data || []);
                setEfficiencyData(effRes.data?.data?.efficiency || []);
                setFinancialData(finRes.data?.data?.monthly || []);
            } catch (err) {
                if (err.response?.status === 403) {
                    setError('Access denied: You need Fleet Manager or Financial Analyst permissions.');
                } else {
                    setError('Failed to load analytics data.');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    // KPIs
    const totalFuelCost = efficiencyData.reduce((s, v) => s + parseFloat(v.total_cost || 0), 0);
    const avgRoi = roiData.length > 0
        ? (roiData.reduce((s, v) => s + parseFloat(v.roi_percentage || 0), 0) / roiData.length).toFixed(1)
        : null;
    const utilizationRate = roiData.length > 0
        ? Math.min(100, ((roiData.filter(v => parseFloat(v.total_revenue || 0) > 0).length / roiData.length) * 100)).toFixed(0)
        : null;

    // Fuel Cost per Vehicle Chart (total_cost in ₹, since liters_per_100km requires odometer data)
    const efficiencyChartData = {
        labels: efficiencyData.map(v => v.name || v.license_plate),
        datasets: [{
            label: 'Fuel Cost (₹)',
            data: efficiencyData.map(v => parseFloat(v.total_cost || 0).toFixed(2)),
            borderColor: '#2563EB',
            backgroundColor: 'rgba(37,99,235,0.08)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#2563EB',
            pointRadius: 5,
        }],
    };

    // Top 5 Costliest Bar Chart
    const top5 = [...roiData]
        .sort((a, b) => parseFloat(b.total_operational_cost || 0) - parseFloat(a.total_operational_cost || 0))
        .slice(0, 5);
    const barChartData = {
        labels: top5.map(v => v.name || v.license_plate),
        datasets: [{
            label: 'Operational Cost ($)',
            data: top5.map(v => parseFloat(v.total_operational_cost || 0).toFixed(2)),
            backgroundColor: ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981'],
            borderRadius: 10,
        }],
    };

    const chartOpts = {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, grid: { color: 'rgba(128,128,128,0.1)' } }, x: { grid: { display: false } } },
    };

    // Financial summary for download
    const buildPayroll = () => {
        return financialData.map(row => ({
            Month: MONTH_NAMES[parseInt(row.month) - 1] || row.month,
            Revenue: `\u20b9${parseFloat(row.revenue || 0).toFixed(2)}`,
            'Fuel Cost': `\u20b9${parseFloat(row.fuel_cost || 0).toFixed(2)}`,
            Maintenance: `\u20b9${parseFloat(row.maintenance_cost || 0).toFixed(2)}`,
            'Net Profit': `\u20b9${(parseFloat(row.revenue || 0) - parseFloat(row.fuel_cost || 0) - parseFloat(row.maintenance_cost || 0)).toFixed(2)}`,
        }));
    };

    if (loading) return (
        <div className="flex items-center justify-center h-96">
            <Loader2 className="animate-spin text-primary mr-3" size={32} />
            <span className="text-text-secondary font-bold uppercase tracking-widest text-sm">Loading analytics...</span>
        </div>
    );

    if (error) return (
        <div className="flex flex-col items-center justify-center h-96 text-center">
            <Activity className="text-danger mb-4" size={48} />
            <p className="font-bold text-text-primary text-lg mb-2">Analytics Unavailable</p>
            <p className="text-sm text-text-secondary max-w-md">{error}</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-text-primary">Operational Analytics & Financial Reports</h2>
                    <p className="text-sm text-text-secondary font-medium mt-1 uppercase tracking-tighter">Financial and operational performance insights</p>
                </div>
                <div className="flex gap-2">
                    <div className="relative group">
                        <button className="flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 hover:-translate-y-0.5 transition-all outline-none">
                            <Download size={18} /> Export Data
                        </button>
                        <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 p-2">
                            <button onClick={() => downloadCSV(roiData, 'fleet_roi_report.csv')} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-text-primary hover:bg-background rounded-xl transition-colors">
                                <Table size={16} className="text-success" /> ROI Report (CSV)
                            </button>
                            <button onClick={() => downloadPDF(roiData, 'FleetFlow ROI Analytics', 'fleet_roi_report.pdf')} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-text-primary hover:bg-background rounded-xl transition-colors">
                                <FileText size={16} className="text-danger" /> ROI Report (PDF)
                            </button>
                            <hr className="border-border my-1" />
                            <button onClick={() => { const p = buildPayroll(); if (p.length) downloadCSV(p, 'monthly_payroll.csv'); else alert('No financial data available yet.'); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-text-primary hover:bg-background rounded-xl transition-colors">
                                <Table size={16} className="text-primary" /> Monthly Payroll (CSV)
                            </button>
                            <button onClick={() => { const p = buildPayroll(); if (p.length) downloadPDF(p, 'FleetFlow Monthly Payroll', 'monthly_payroll.pdf'); else alert('No financial data available yet.'); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-text-primary hover:bg-background rounded-xl transition-colors">
                                <FileText size={16} className="text-warning" /> Monthly Payroll (PDF)
                            </button>
                            <hr className="border-border my-1" />
                            <button onClick={() => downloadPDF(efficiencyData, 'FleetFlow Fleet Health Audit', 'health_audit.pdf')} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-text-primary hover:bg-background rounded-xl transition-colors">
                                <FileText size={16} className="text-success" /> Health Audit (PDF)
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-card rounded-2xl border border-border p-6 shadow-sm flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><Fuel size={22} /></div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-text-secondary mb-1">Total Fuel Cost</p>
                        <p className="text-2xl font-extrabold text-text-primary">₹{totalFuelCost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                    </div>
                </div>
                <div className="bg-card rounded-2xl border border-border p-6 shadow-sm flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center text-success"><TrendingUp size={22} /></div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-text-secondary mb-1">Fleet ROI</p>
                        <p className="text-2xl font-extrabold text-text-primary">{avgRoi !== null ? `${avgRoi}%` : '---'}</p>
                    </div>
                </div>
                <div className="bg-card rounded-2xl border border-border p-6 shadow-sm flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-warning/10 flex items-center justify-center text-warning"><Activity size={22} /></div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-text-secondary mb-1">Utilization Rate</p>
                        <p className="text-2xl font-extrabold text-text-primary">{utilizationRate !== null ? `${utilizationRate}%` : '---'}</p>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Fuel Efficiency Line Chart */}
                <div className="bg-card rounded-3xl p-8 shadow-sm border border-border">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h4 className="text-lg font-extrabold text-text-primary">Fuel Efficiency</h4>
                            <p className="text-xs text-text-secondary font-bold uppercase tracking-widest mt-1">Liters per 100km by vehicle</p>
                        </div>
                    </div>
                    <div className="h-64">
                        {efficiencyData.length === 0 ? (
                            <div className="h-full flex items-center justify-center">
                                <p className="text-sm font-bold text-text-secondary uppercase tracking-widest">No fuel log data yet</p>
                            </div>
                        ) : (
                            <Line data={efficiencyChartData} options={chartOpts} />
                        )}
                    </div>
                </div>

                {/* Top 5 Costliest Bar Chart */}
                <div className="bg-card rounded-3xl p-8 shadow-sm border border-border">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h4 className="text-lg font-extrabold text-text-primary">Top 5 Costliest Vehicles</h4>
                            <p className="text-xs text-text-secondary font-bold uppercase tracking-widest mt-1">Total operational spend</p>
                        </div>
                    </div>
                    <div className="h-64">
                        {top5.length === 0 ? (
                            <div className="h-full flex items-center justify-center">
                                <p className="text-sm font-bold text-text-secondary uppercase tracking-widest">No cost data yet</p>
                            </div>
                        ) : (
                            <Bar data={barChartData} options={chartOpts} />
                        )}
                    </div>
                </div>
            </div>

            {/* Financial Summary of Month */}
            <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-8 py-5 border-b border-border">
                    <div>
                        <h4 className="text-base font-extrabold text-text-primary">Financial Summary of Month</h4>
                        <p className="text-xs text-text-secondary font-bold uppercase tracking-widest mt-0.5">Revenue vs Costs breakdown</p>
                    </div>
                    <button
                        onClick={() => { const p = buildPayroll(); if (p.length) downloadPDF(p, 'FleetFlow Monthly Payroll', 'monthly_payroll.pdf'); else alert('No financial data available yet.'); }}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-black uppercase rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all outline-none"
                    >
                        <Download size={14} /> Download Payroll
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] font-black uppercase tracking-[0.15em] text-text-secondary bg-background/50 border-b border-border">
                                <th className="px-8 py-4">Month</th>
                                <th className="px-8 py-4">Revenue</th>
                                <th className="px-8 py-4">Fuel Cost</th>
                                <th className="px-8 py-4">Maintenance</th>
                                <th className="px-8 py-4">Net Profit</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {financialData.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-12 text-center">
                                        <DollarSign className="mx-auto mb-3 text-text-secondary/30" size={36} />
                                        <p className="text-sm font-bold text-text-secondary uppercase tracking-widest">No financial data yet</p>
                                        <p className="text-xs text-text-secondary mt-1">Complete trips with revenue to populate this table</p>
                                    </td>
                                </tr>
                            ) : financialData.map((row, i) => {
                                const revenue = parseFloat(row.revenue || 0);
                                const fuelCost = parseFloat(row.fuel_cost || 0);
                                const maintCost = parseFloat(row.maintenance_cost || 0);
                                const netProfit = revenue - fuelCost - maintCost;
                                return (
                                    <tr key={i} className="hover:bg-background/50 transition-colors">
                                        <td className="px-8 py-4 font-bold text-text-primary">{MONTH_NAMES[parseInt(row.month) - 1] || row.month}</td>
                                        <td className="px-8 py-4 font-bold text-success">₹{revenue.toLocaleString('en-IN')}</td>
                                        <td className="px-8 py-4 font-medium text-text-secondary">₹{fuelCost.toLocaleString('en-IN')}</td>
                                        <td className="px-8 py-4 font-medium text-text-secondary">₹{maintCost.toLocaleString('en-IN')}</td>
                                        <td className={`px-8 py-4 font-extrabold ${netProfit >= 0 ? 'text-success' : 'text-danger'}`}>
                                            ₹{netProfit.toLocaleString('en-IN')}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Top Performing Assets */}
            {roiData.length > 0 && (
                <div className="bg-card rounded-3xl p-8 text-text-primary shadow-sm border border-border relative overflow-hidden">
                    <h4 className="text-xs font-black text-text-secondary uppercase tracking-[0.2em] mb-6">Top Performing Assets</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {roiData.slice(0, 3).map((v, i) => (
                            <div key={v.id} className={`space-y-2 border-l-2 pl-6 ${i === 0 ? 'border-success' : i === 1 ? 'border-primary' : 'border-warning'}`}>
                                <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">{v.license_plate}</p>
                                <h5 className="text-lg font-bold">{v.name}</h5>
                                <p className="text-sm text-text-secondary">
                                    Op. Cost: <span className="font-black text-text-primary">₹{parseFloat(v.total_operational_cost || 0).toLocaleString('en-IN')}</span>
                                    &nbsp;· Revenue: <span className="font-black text-text-primary">₹{parseFloat(v.total_revenue || 0).toLocaleString('en-IN')}</span>
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Analytics;
