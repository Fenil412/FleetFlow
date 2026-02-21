import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Fuel, Calendar, DollarSign, Droplets, ArrowUpRight, Plus, MapPin } from 'lucide-react';
import { format } from 'date-fns';

const FuelLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [vehicles, setVehicles] = useState([]);
    const [formData, setFormData] = useState({
        vehicle_id: '',
        liters: 0,
        price_per_liter: 0,
        fuel_date: new Date().toISOString().split('T')[0],
        odometer_km: 0
    });

    const fetchLogs = async () => {
        try {
            const res = await api.get('/fuel');
            setLogs(res.data?.data?.logs || []);
        } catch (err) {
            console.error('Failed to fetch fuel logs', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchVehicles = async () => {
        try {
            const res = await api.get('/vehicles');
            setVehicles(res.data.data.vehicles);
        } catch (err) {
            console.error('Failed to fetch vehicles', err);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const handleAddFuel = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                cost: formData.liters * formData.price_per_liter
            };
            await api.post('/fuel', payload);
            setShowModal(false);
            fetchLogs();
            setFormData({ vehicle_id: '', liters: 0, price_per_liter: 0, fuel_date: new Date().toISOString().split('T')[0], odometer_km: 0 });
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to add fuel entry');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-text-primary">Fuel Expenditures</h2>
                    <p className="text-sm text-text-secondary font-medium mt-1 uppercase tracking-tighter">Energy consumption and cost management</p>
                </div>
                <button
                    onClick={() => {
                        fetchVehicles();
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all outline-none"
                >
                    <Plus size={18} />
                    Add Fuel Entry
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* KPI Summary */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-card rounded-3xl p-6 text-text-primary shadow-sm border border-border relative overflow-hidden group">
                        <div className="relative z-10">
                            <p className="text-xs font-bold text-text-secondary uppercase tracking-[0.2em] mb-4">Avg. Efficiency</p>
                            <h4 className="text-3xl font-extrabold mb-2">9.2 km/L</h4>
                            <div className="flex items-center text-success text-xs font-bold bg-success/10 w-fit px-2 py-1 rounded-lg">
                                <ArrowUpRight size={14} className="mr-1" />
                                +2.1% Improved
                            </div>
                        </div>
                        <Droplets className="absolute -right-8 -bottom-8 text-primary/10 group-hover:scale-110 transition-transform duration-700" size={160} />
                    </div>

                    <div className="bg-card rounded-3xl p-6 border border-border shadow-sm">
                        <p className="text-xs font-bold text-text-secondary uppercase tracking-[0.2em] mb-4">Fuel Budget</p>
                        <div className="h-2 w-full bg-background rounded-full overflow-hidden mb-2">
                            <div className="h-full bg-warning w-[75%] rounded-full shadow-[0_0_10px_rgba(245,158,11,0.3)]" />
                        </div>
                        <div className="flex justify-between text-xs font-bold text-text-primary">
                            <span>$12,450 Used</span>
                            <span className="text-text-secondary">$15,000 Total</span>
                        </div>
                    </div>
                </div>

                {/* History Table */}
                <div className="lg:col-span-3">
                    <div className="bg-card rounded-3xl shadow-sm border border-border overflow-hidden">
                        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                            <h3 className="text-xs font-black text-text-secondary uppercase tracking-[0.2em]">Transaction Log</h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => alert('Filtering by geographical location...')}
                                    className="p-2 hover:bg-background rounded-lg text-text-secondary transition-colors outline-none"
                                >
                                    <MapPin size={18} />
                                </button>
                                <button
                                    onClick={() => alert('Filtering by date range...')}
                                    className="p-2 hover:bg-background rounded-lg text-text-secondary transition-colors outline-none"
                                >
                                    <Calendar size={18} />
                                </button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.15em] border-b border-border bg-background/50">
                                        <th className="px-6 py-4">Vehicle</th>
                                        <th className="px-6 py-4">Volume (L)</th>
                                        <th className="px-6 py-4">Fuel Price</th>
                                        <th className="px-6 py-4">Total Cost</th>
                                        <th className="px-6 py-4">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {loading ? (
                                        [1, 2, 3, 4].map(i => <tr key={i} className="h-14 animate-pulse bg-background/30" />)
                                    ) : logs.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-text-secondary font-medium">No fuel logs found</td>
                                        </tr>
                                    ) : logs.map((log) => (
                                        <tr key={log.id} className="hover:bg-background transition-colors">
                                            <td className="px-6 py-4 flex items-center">
                                                <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center mr-3">
                                                    <Fuel size={16} />
                                                </div>
                                                <span className="text-sm font-bold text-text-primary">{log.vehicle_name}</span>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold text-text-primary">{log.quantity_liters} L</td>
                                            <td className="px-6 py-4 text-sm font-semibold text-text-secondary">${log.price_per_liter}/L</td>
                                            <td className="px-6 py-4 text-sm font-black text-text-primary">${(log.total_cost || 0).toLocaleString()}</td>
                                            <td className="px-6 py-4 text-xs font-bold text-text-secondary uppercase">
                                                {format(new Date(log.fill_date), 'MMM d, yyyy')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Fuel Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-card border border-border w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
                        <div className="p-8">
                            <h3 className="text-2xl font-bold text-text-primary mb-2">Record Fuel Loading</h3>
                            <p className="text-sm text-text-secondary mb-6">Track energy consumption and costs</p>

                            <form onSubmit={handleAddFuel} className="space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest pl-1">Vehicle</label>
                                    <select
                                        required
                                        value={formData.vehicle_id}
                                        onChange={e => setFormData({ ...formData, vehicle_id: e.target.value })}
                                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-bold text-text-primary focus:ring-2 focus:ring-primary outline-none appearance-none cursor-pointer"
                                    >
                                        <option value="">Select Asset</option>
                                        {vehicles.map(v => (
                                            <option key={v.id} value={v.id}>{v.name} ({v.license_plate})</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest pl-1">Quantity (Liters)</label>
                                        <input
                                            required
                                            type="number"
                                            step="0.01"
                                            value={formData.liters}
                                            onChange={e => setFormData({ ...formData, liters: parseFloat(e.target.value) || 0 })}
                                            className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-bold text-text-primary focus:ring-2 focus:ring-primary outline-none"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest pl-1">Price per Liter</label>
                                        <input
                                            required
                                            type="number"
                                            step="0.001"
                                            value={formData.price_per_liter}
                                            onChange={e => setFormData({ ...formData, price_per_liter: parseFloat(e.target.value) || 0 })}
                                            className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-bold text-text-primary focus:ring-2 focus:ring-primary outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest pl-1">Odometer Reading (KM)</label>
                                    <input
                                        required
                                        type="number"
                                        value={formData.odometer_km}
                                        onChange={e => setFormData({ ...formData, odometer_km: parseInt(e.target.value) || 0 })}
                                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-bold text-text-primary focus:ring-2 focus:ring-primary outline-none"
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 py-3 bg-background text-text-secondary font-black text-[10px] uppercase tracking-widest rounded-xl border border-border hover:bg-card transition-all outline-none"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-3 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:bg-blue-700 hover:-translate-y-0.5 transition-all outline-none"
                                    >
                                        Save Record
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FuelLogs;
