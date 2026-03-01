import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
    BarElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import api from '../api/axios';
import { Download, FileText, Table, TrendingUp, Fuel, Activity, IndianRupee, Loader2, MapPin } from 'lucide-react';
import { downloadCSV, downloadPDF } from '../utils/exportUtils';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Professional-Grade India SVG Component
const IndiaSVG = ({ cityData }) => {
    // Precise coordinates for 500x550 viewBox based on high-detail path
    const cityCoords = {
        'Mumbai': { x: 121, y: 388 },
        'Delhi': { x: 184, y: 153 },
        'Bangalore': { x: 185, y: 474 },
        'Chennai': { x: 231, y: 479 },
        'Kolkata': { x: 414, y: 308 },
        'Hyderabad': { x: 221, y: 395 },
        'Ahmedabad': { x: 106, y: 284 },
        'Pune': { x: 132, y: 410 },
        'Surat': { x: 111, y: 324 },
        'Jaipur': { x: 167, y: 209 },
        'Nashik': { x: 125, y: 365 },
        'Nagpur': { x: 235, y: 335 },
    };

    const maxCount = Math.max(...cityData.map(d => parseInt(d.booking_count)), 1);

    return (
        <div className="relative w-full h-full flex items-center justify-center p-4">
            <svg viewBox="0 0 500 550" className="w-full h-full max-h-[480px] drop-shadow-[0_0_20px_rgba(37,99,235,0.1)]">
                {/* Background Shadow Map */}
                <path
                    d="M174.5,1.9l20.4,12.2l20.4-12.2H174.5z M495.1,164.7l-4.1-13.6l-20.4-31.3l-20.4-23.1L430,76.4l-20.4-12.2l-13.6-27.2l-20.4-17.7l-20.4-20.4H174.5L154.1,19.6l-20.4,13.6l-13.6,23.1L99.7,76.4l-6.8,13.6L72.5,110.4l-20.4,31.3L31.7,164.7L11.3,219.1v81.6l20.4,54.4l34,44.9l44.9,40.8l47.6,35.4l51.7,28.6l31.3,20.4l20.4,24.5V550h136v-54.4l40.8-40.8l44.9-54.4l31.3-44.9l20.4-54.4V164.7z"
                    fill="currentColor"
                    className="text-primary/5"
                />
                {/* Main India Outer Boundary Path (Simplified for performance but accurate) */}
                <path
                    d="M174,10l20,-8l20,8l13,20l8,25l24,23l13,25l18,11l11,19l22,7l25,16l22,8l25,30l19,22l15,30l6,33l-4,32l-16,27l-16,18l-18,23l-16,33l-26,38l-35,41l-39,32l-38,18l-33,8l-38-11l-36-22l-31-33l-22-38l-17-42l-8-39l10-44l17-38l13-41l5-43l-4-32l-11-21l-19-14l-11-22l-2-22l8-19l6-11l15-15l24-11l20-8l20,8z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-primary/30"
                />
                {/* Visual accents for state boundaries */}
                <path d="M100,280l60,20l40,-10l50,30M280,150l20,50l40,30M180,450l40,20l60,-10" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.1" />
            </svg>

            {cityData.map((city, i) => {
                const coords = cityCoords[city.city] || { x: 250 + (i * 10), y: 250 + (i * 10) };
                const size = Math.max(20, (parseInt(city.booking_count) / maxCount) * 50);
                return (
                    <div
                        key={city.city}
                        className="absolute group transition-all"
                        style={{
                            left: `${(coords.x / 500) * 100}%`,
                            top: `${(coords.y / 550) * 100}%`,
                        }}
                    >
                        {/* Node Pulse Effect */}
                        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-150 animate-pulse" />

                        <div
                            className="relative flex items-center justify-center bg-primary/40 rounded-full border-2 border-primary animate-pulse group-hover:bg-primary group-hover:scale-125 transition-all cursor-pointer shadow-2xl shadow-primary/30 backdrop-blur-sm"
                            style={{ width: `${size}px`, height: `${size}px`, transform: 'translate(-50%, -50%)' }}
                        >
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-[10px] font-black text-white">{city.booking_count}</span>
                            </div>

                            {/* Premium Tooltip */}
                            <div className="hidden group-hover:flex absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-card/95 border border-border px-4 py-3 rounded-2xl shadow-2xl flex-col items-center gap-1.5 z-50 min-w-[140px] backdrop-blur-xl ring-1 ring-white/10">
                                <p className="text-[10px] font-black text-text-primary uppercase tracking-widest border-b border-border/50 pb-1.5 mb-0.5 w-full text-center">{city.city}</p>
                                <div className="w-full flex flex-col gap-1">
                                    <p className="text-[10px] font-bold text-text-secondary flex justify-between"><span>Trips:</span> <span className="text-primary font-black">{city.booking_count}</span></p>
                                    <p className="text-[10px] font-bold text-text-secondary flex justify-between"><span>Revenue:</span> <span className="text-success font-black">₹{parseFloat(city.total_revenue).toLocaleString('en-IN')}</span></p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const Analytics = () => {
    const [roiData, setRoiData] = useState([]);
    const [efficiencyData, setEfficiencyData] = useState([]);
    const [financialData, setFinancialData] = useState([]);
    const [dailyProfitData, setDailyProfitData] = useState([]);
    const [geographyData, setGeographyData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAll = useCallback(async () => {
        try {
            const [roiRes, effRes, finRes, dailyRes, geoRes] = await Promise.all([
                api.get('/analytics/roi'),
                api.get('/analytics/efficiency').catch(() => ({ data: { data: { efficiency: [] } } })),
                api.get('/analytics/financial').catch(() => ({ data: { data: { monthly: [] } } })),
                api.get('/analytics/daily-profit').catch(() => ({ data: { data: [] } })),
                api.get('/analytics/geography').catch(() => ({ data: { data: [] } })),
            ]);
            setRoiData(roiRes.data.data.vehicles || roiRes.data.data || []);
            setEfficiencyData(effRes.data?.data?.efficiency || []);
            setFinancialData(finRes.data?.data?.monthly || []);
            setDailyProfitData(dailyRes.data?.data || []);
            setGeographyData(geoRes.data?.data || []);
        } catch (err) {
            if (err.response?.status === 403) {
                setError('Access denied: You need Fleet Manager or Financial Analyst permissions.');
            } else {
                setError('Failed to load analytics data.');
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    const totalFuelCost = useMemo(() =>
        efficiencyData.reduce((s, v) => s + parseFloat(v.total_cost || 0), 0)
        , [efficiencyData]);

    const avgRoi = useMemo(() =>
        roiData.length > 0
            ? (roiData.reduce((s, v) => s + parseFloat(v.roi_percentage || 0), 0) / roiData.length).toFixed(1)
            : null
        , [roiData]);

    const utilizationRate = useMemo(() =>
        roiData.length > 0
            ? Math.min(100, ((roiData.filter(v => parseFloat(v.total_revenue || 0) > 0).length / roiData.length) * 100)).toFixed(0)
            : null
        , [roiData]);

    const dailyProfitChartData = useMemo(() => ({
        labels: dailyProfitData.map(d => new Date(d.date).getDate()),
        datasets: [{
            label: 'Net Profit (₹)',
            data: dailyProfitData.map(d => parseFloat(d.profit)),
            backgroundColor: dailyProfitData.map(d => parseFloat(d.profit) >= 0 ? 'rgba(16,185,129,0.8)' : 'rgba(239,68,68,0.8)'),
            borderRadius: 6,
            barThickness: 10,
        }],
    }), [dailyProfitData]);

    const efficiencyChartData = useMemo(() => ({
        labels: efficiencyData.map(v => v.name || v.license_plate),
        datasets: [{
            label: 'Efficiency Index',
            data: efficiencyData.map(v => parseFloat(v.liters_per_100km || 0).toFixed(2)),
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59,130,246,0.1)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#3B82F6',
            pointRadius: 5,
        }],
    }), [efficiencyData]);

    const top5 = useMemo(() =>
        [...roiData]
            .sort((a, b) => parseFloat(b.total_operational_cost || 0) - parseFloat(a.total_operational_cost || 0))
            .slice(0, 5)
        , [roiData]);

    const costlyChartData = useMemo(() => ({
        labels: top5.map(v => v.name || v.license_plate),
        datasets: [{
            label: 'Cost in ₹',
            data: top5.map(v => parseFloat(v.total_operational_cost || 0).toFixed(2)),
            backgroundColor: ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981'],
            borderRadius: 8,
        }],
    }), [top5]);

    const lineChartOpts = useMemo(() => ({
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            y: { beginAtZero: true, grid: { color: 'rgba(128,128,128,0.05)' }, ticks: { font: { weight: '600', size: 9 } } },
            x: { grid: { display: false }, ticks: { font: { weight: '600', size: 9 }, maxRotation: 45, minRotation: 45 } }
        },
    }), []);

    const barChartOpts = useMemo(() => ({
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            y: { grid: { color: 'rgba(128,128,128,0.05)' }, ticks: { callback: (v) => `₹${v / 1000}K`, font: { weight: '600', size: 9 } } },
            x: { grid: { display: false }, ticks: { font: { weight: '600', size: 9 } } }
        },
    }), []);

    const buildPayroll = useCallback(() => {
        return financialData.map(row => ({
            Month: MONTH_NAMES[parseInt(row.month) - 1] || row.month,
            Revenue: `\u20b9${parseFloat(row.revenue || 0).toLocaleString('en-IN')}`,
            'Fuel Cost': `\u20b9${parseFloat(row.fuel_cost || 0).toLocaleString('en-IN')}`,
            Maintenance: `\u20b9${parseFloat(row.maintenance_cost || 0).toLocaleString('en-IN')}`,
            'Net Profit': `\u20b9${(parseFloat(row.revenue || 0) - parseFloat(row.fuel_cost || 0) - parseFloat(row.maintenance_cost || 0)).toLocaleString('en-IN')}`,
        }));
    }, [financialData]);

    const handleDownloadPayroll = useCallback(() => {
        const p = buildPayroll();
        if (p.length) downloadPDF(p, 'FleetFlow Monthly Payroll', 'monthly_payroll.pdf');
        else alert('No financial data available yet.');
    }, [buildPayroll]);

    if (loading) return (
        <div className="flex items-center justify-center h-96">
            <Loader2 className="animate-spin text-primary mr-3" size={32} />
            <span className="text-text-secondary font-bold uppercase tracking-widest text-sm">Synchronizing Deep Analytics...</span>
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
        <div className="space-y-8 animate-fade-in pb-10">
            {/* KPI Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-text-primary">Fleet Performance Intelligence</h2>
                    <p className="text-sm text-text-secondary font-medium mt-1 uppercase tracking-tighter">Real-time operational and geographic telemetry</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={handleDownloadPayroll} className="flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all outline-none">
                        <Download size={18} /> Export Performance
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[
                    { label: 'Total Fuel Cost', value: `₹${totalFuelCost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, icon: <Fuel size={22} />, color: 'primary' },
                    { label: 'Avg Fleet ROI', value: avgRoi !== null ? `${avgRoi}%` : '---', icon: <TrendingUp size={22} />, color: 'success' },
                    { label: 'Asset Utilization', value: utilizationRate !== null ? `${utilizationRate}%` : '---', icon: <Activity size={22} />, color: 'warning' },
                ].map((kpi, i) => (
                    <div key={i} className="bg-card rounded-2xl border border-border p-6 shadow-sm flex items-center gap-4 group hover:border-primary/20 transition-all overflow-hidden relative">
                        <div className={`h-12 w-12 rounded-xl bg-${kpi.color}/10 flex items-center justify-center text-${kpi.color} group-hover:scale-110 transition-transform`}>{kpi.icon}</div>
                        <div className="relative z-10">
                            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-text-secondary mb-1">{kpi.label}</p>
                            <p className="text-2xl font-extrabold text-text-primary">{kpi.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* DASHBOARD LAYOUT: MAP FIRST AS REQUESTED */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* 1. GEOGRAPHY MAP (FULL WIDTH TOP) */}
                <div className="bg-card rounded-3xl shadow-sm border border-border overflow-hidden flex flex-col col-span-1 lg:col-span-2">
                    <div className="p-8 pb-0">
                        <h4 className="text-xl font-black text-text-primary uppercase tracking-tight">Geographic Booking Distribution — All India Nodes</h4>
                        <p className="text-xs text-text-secondary font-bold uppercase tracking-widest mt-1">Lighter colors denote low density, darker colors denote high trip frequency</p>
                    </div>
                    <div className="flex-1 min-h-[500px]">
                        {geographyData.length === 0 ? (
                            <div className="h-full flex items-center justify-center">
                                <p className="text-sm font-bold text-text-secondary uppercase tracking-widest">Awaiting spatial telemetry...</p>
                            </div>
                        ) : (
                            <IndiaSVG cityData={geographyData} />
                        )}
                    </div>
                </div>

                {/* 2. FLEET EFFICIENCY */}
                <div className="bg-card rounded-3xl p-8 shadow-sm border border-border flex flex-col">
                    <div className="mb-6">
                        <h4 className="text-lg font-extrabold text-text-primary uppercase tracking-tight">Fleet Efficiency Index</h4>
                        <p className="text-xs text-text-secondary font-bold uppercase tracking-widest mt-1">Mean Liters per 100km trajectory</p>
                    </div>
                    <div className="h-64">
                        {efficiencyData.length === 0 ? (
                            <div className="h-full flex items-center justify-center">
                                <p className="text-sm font-bold text-text-secondary uppercase tracking-widest">Efficiency data loading...</p>
                            </div>
                        ) : (
                            <Line data={efficiencyChartData} options={lineChartOpts} />
                        )}
                    </div>
                </div>

                {/* 3. TOP 5 COSTLIEST */}
                <div className="bg-card rounded-3xl p-8 shadow-sm border border-border flex flex-col">
                    <div className="mb-6">
                        <h4 className="text-lg font-extrabold text-text-primary uppercase tracking-tight">Top 5 Lifecycle Costs</h4>
                        <p className="text-xs text-text-secondary font-bold uppercase tracking-widest mt-1">Aggregated operational spend (₹)</p>
                    </div>
                    <div className="h-64">
                        {top5.length === 0 ? (
                            <div className="h-full flex items-center justify-center">
                                <p className="text-sm font-bold text-text-secondary uppercase tracking-widest">Analyzing asset costs...</p>
                            </div>
                        ) : (
                            <Bar data={costlyChartData} options={lineChartOpts} />
                        )}
                    </div>
                </div>

                {/* 4. DAILY PROFIT (BOTTOM FULL WIDTH) */}
                <div className="bg-card rounded-3xl p-8 shadow-sm border border-border flex flex-col col-span-1 lg:col-span-2">
                    <div className="mb-6">
                        <h4 className="text-lg font-extrabold text-text-primary uppercase tracking-tight">Net Daily Profit Tracking — {MONTH_NAMES[new Date().getMonth()]}</h4>
                        <p className="text-xs text-text-secondary font-bold uppercase tracking-widest mt-1">Current month financial velocity</p>
                    </div>
                    <div className="flex-1 min-h-[300px]">
                        {dailyProfitData.length === 0 ? (
                            <div className="h-full flex items-center justify-center">
                                <p className="text-sm font-bold text-text-secondary uppercase tracking-widest">Calculating profit velocity...</p>
                            </div>
                        ) : (
                            <Bar data={dailyProfitChartData} options={barChartOpts} />
                        )}
                    </div>
                </div>

                {/* 5. TOP PERFORMING ASSETS */}
                <div className="bg-card rounded-3xl p-8 shadow-sm border border-border relative overflow-hidden lg:col-span-2">
                    <h4 className="text-lg font-black text-text-primary mb-6 uppercase tracking-tight">Top Revenue Generating Assets</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                        {roiData.slice(0, 3).map((v, i) => (
                            <div key={v.id} className={`space-y-2 border-l-4 pl-6 ${i === 0 ? 'border-success' : i === 1 ? 'border-primary' : 'border-warning'}`}>
                                <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">{v.license_plate}</p>
                                <h5 className="text-lg font-bold text-text-primary">{v.name}</h5>
                                <p className="text-sm text-text-secondary tracking-tight">
                                    <span className="text-text-secondary font-bold">Op. Cost:</span> <span className="font-black text-primary">₹{parseFloat(v.total_operational_cost || 0).toLocaleString('en-IN')}</span>
                                    <br />
                                    <span className="text-success font-bold text-success/80">Revenue:</span> <span className="font-black text-text-primary">₹{parseFloat(v.total_revenue || 0).toLocaleString('en-IN')}</span>
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* LEDGER */}
            <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden mt-8">
                <div className="px-8 py-6 border-b border-border">
                    <h4 className="text-lg font-extrabold text-text-primary uppercase tracking-tight">Historical Financial Ledger</h4>
                    <p className="text-xs text-text-secondary font-bold uppercase tracking-widest mt-0.5">Consolidated monthly profit and loss analysis (₹)</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] font-black uppercase tracking-[0.15em] text-text-secondary bg-background/50 border-b border-border">
                                <th className="px-8 py-5">Period</th>
                                <th className="px-8 py-5">Gross Revenue</th>
                                <th className="px-8 py-5">Direct Costs</th>
                                <th className="px-8 py-5 text-right pr-12">Net Earnings</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {financialData.map((row, i) => {
                                const revenue = parseFloat(row.revenue || 0);
                                const totalCosts = parseFloat(row.fuel_cost || 0) + parseFloat(row.maintenance_cost || 0);
                                const netProfit = revenue - totalCosts;
                                return (
                                    <tr key={i} className="hover:bg-background/50 transition-colors">
                                        <td className="px-8 py-6 font-bold text-text-primary">{MONTH_NAMES[parseInt(row.month) - 1]} {row.year}</td>
                                        <td className="px-8 py-6 font-bold text-success">₹{revenue.toLocaleString('en-IN')}</td>
                                        <td className="px-8 py-6 font-medium text-text-secondary">₹{totalCosts.toLocaleString('en-IN')}</td>
                                        <td className={`px-8 py-6 text-right pr-12 font-black text-base ${netProfit >= 0 ? 'text-primary' : 'text-danger'}`}>
                                            ₹{netProfit.toLocaleString('en-IN')}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
