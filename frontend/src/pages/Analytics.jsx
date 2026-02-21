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
import { Download, Filter, FileText, Table } from 'lucide-react';
import { downloadCSV, downloadPDF } from '../utils/exportUtils';

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
        labels: roiData.map(v => v.name),
        datasets: [
            {
                label: 'Operational ROI (%)',
                data: roiData.map(v => parseFloat(v.roi_percentage) || 0),
                borderColor: '#2563EB',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                fill: true,
                tension: 0.4,
            },
        ],
    };

    const barChartData = {
        labels: roiData.map(v => v.name),
        datasets: [
            {
                label: 'Operational ROI (%)',
                data: roiData.map(v => parseFloat(v.roi_percentage) || 0),
                backgroundColor: '#3B82F6',
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
                    <div className="relative group">
                        <button className="flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 hover:-translate-y-0.5 transition-all outline-none">
                            <Download size={18} />
                            Export Data
                        </button>
                        <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 p-2">
                            <button
                                onClick={() => downloadCSV(roiData, 'fleet_roi_report.csv')}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-text-primary hover:bg-background rounded-xl transition-colors"
                            >
                                <Table size={16} className="text-success" />
                                Export as CSV
                            </button>
                            <button
                                onClick={() => downloadPDF(roiData, 'FleetFlow ROI Analytics Report', 'fleet_roi_report.pdf')}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-text-primary hover:bg-background rounded-xl transition-colors"
                            >
                                <FileText size={16} className="text-danger" />
                                Export as PDF
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Performance Chart */}
                <div className="bg-card rounded-3xl p-8 shadow-sm border border-border">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h4 className="text-lg font-extrabold text-text-primary">Vehicle ROI Distribution</h4>
                            <p className="text-xs text-text-secondary font-bold uppercase tracking-widest mt-1">Revenue vs Operational Costs</p>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-black text-primary">
                                {roiData.length > 0
                                    ? `${(roiData.reduce((s, v) => s + parseFloat(v.roi_percentage || 0), 0) / roiData.length).toFixed(1)}%`
                                    : '---'}
                                <span className="text-xs font-bold text-text-secondary"> avg</span>
                            </p>
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
                            <p className="text-2xl font-black text-text-primary">
                                {roiData.length > 0
                                    ? `${(roiData.reduce((s, v) => s + parseFloat(v.roi_percentage || 0), 0) / roiData.length).toFixed(1)}%`
                                    : '---'}
                                <span className="text-xs font-bold text-text-secondary"> avg</span>
                            </p>
                        </div>
                    </div>
                    <div className="h-64">
                        {loading ? (
                            <div className="h-full w-full bg-background rounded-2xl flex items-center justify-center animate-pulse" />
                        ) : error ? (
                            <div className="h-full w-full bg-background rounded-2xl flex flex-col items-center justify-center p-6 text-center">
                                <p className="text-sm font-bold text-text-secondary leading-relaxed">{error}</p>
                            </div>
                        ) : roiData.length === 0 ? (
                            <div className="h-full w-full bg-background rounded-2xl flex items-center justify-center">
                                <p className="text-sm font-bold text-text-secondary uppercase tracking-widest">No ROI data yet</p>
                            </div>
                        ) : (
                            <Bar data={barChartData} options={chartOptions} />
                        )}
                    </div>
                </div>
            </div>

            {roiData.length > 0 && (
                <div className="bg-card rounded-3xl p-8 text-text-primary shadow-sm border border-border relative overflow-hidden">
                    <div className="relative z-10">
                        <h4 className="text-xs font-black text-text-secondary uppercase tracking-[0.2em] mb-6">Top Performing Assets</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {roiData.slice(0, 3).map((v, i) => (
                                <div key={v.id} className={`space-y-2 border-l-2 pl-6 ${i === 0 ? 'border-success' : i === 1 ? 'border-primary' : 'border-warning'}`}>
                                    <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">{v.license_plate}</p>
                                    <h5 className="text-lg font-bold">{v.name}</h5>
                                    <p className="text-sm text-text-secondary">
                                        ROI: <span className="font-black text-text-primary">{parseFloat(v.roi_percentage || 0).toFixed(1)}%</span>
                                        &nbsp;· Revenue: <span className="font-black text-text-primary">${parseFloat(v.total_revenue || 0).toLocaleString()}</span>
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
                </div>
            )}
        </div>
    );
};

export default Analytics;
