import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Wrench, Calendar, Truck, Clock, AlertCircle, Plus, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

const Maintenance = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [vehicles, setVehicles] = useState([]);
    const [formData, setFormData] = useState({
        vehicle_id: '',
        service_type: 'Routine',
        description: '',
        cost: 0,
        service_date: new Date().toISOString().split('T')[0]
    });

    const fetchLogs = async () => {
        try {
            const res = await api.get('/maintenance');
            setLogs(res.data?.data?.history || []);
        } catch (err) {
            console.error('Failed to fetch maintenance logs', err);
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

    const handleCreateLog = async (e) => {
        e.preventDefault();
        try {
            await api.post('/maintenance', formData);
            setShowModal(false);
            fetchLogs();
            setFormData({ vehicle_id: '', service_type: 'Routine', description: '', cost: 0, service_date: new Date().toISOString().split('T')[0] });
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to log service');
        }
    };

    const filteredLogs = logs.filter(log =>
        log.vehicle_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.service_type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 text-text-primary">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold">Service & Maintenance</h2>
                    <p className="text-sm text-text-secondary font-medium mt-1 uppercase tracking-tighter">Asset health and repair history</p>
                </div>
                <button
                    onClick={() => {
                        fetchVehicles();
                        setShowModal(true);
                    }}
                    className="flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-xl hover:bg-primary/90 transition-all outline-none"
                >
                    <Plus size={18} />
                    Log Service
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 bg-card p-4 rounded-3xl border border-border shadow-sm">
                <div className="flex-1 relative">
                    <input
                        type="text"
                        placeholder="Search logs by vehicle or service type..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-6 pr-4 py-2.5 rounded-2xl border-0 bg-background ring-1 ring-inset ring-border focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-text-secondary/50 text-text-primary"
                    />
                </div>
                <button
                    onClick={() => alert('Advanced filtering coming soon!')}
                    className="px-6 py-2.5 rounded-2xl border border-border text-text-secondary font-bold hover:bg-background transition-colors outline-none text-xs"
                >
                    Advanced Filters
                </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Active Alerts */}
                <div className="xl:col-span-1 space-y-4">
                    <h3 className="text-xs font-black text-text-secondary uppercase tracking-[0.2em] px-2">Critical Alerts</h3>
                    <div className="bg-card rounded-3xl p-6 shadow-sm border border-border">
                        <div className="flex items-center p-4 rounded-2xl bg-danger/5 border border-danger/10 text-danger mb-4">
                            <AlertCircle size={20} className="mr-3" />
                            <p className="text-sm font-bold">3 Vehicles Overdue for Service</p>
                        </div>
                        <p className="text-xs text-text-secondary font-medium leading-relaxed">
                            Regular maintenance prevents costly downtime. Check vehicles with high odometer readings for preventive inspections.
                        </p>
                    </div>
                </div>

                {/* History Table */}
                <div className="xl:col-span-2">
                    <h3 className="text-xs font-black text-text-secondary uppercase tracking-[0.2em] px-2 mb-4">Service History</h3>
                    <div className="bg-card rounded-3xl shadow-sm border border-border overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-background border-b border-border text-[10px] font-bold text-text-secondary uppercase tracking-[0.15em]">
                                        <th className="px-6 py-4">Vehicle</th>
                                        <th className="px-6 py-4">Service Details</th>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4">Cost</th>
                                        <th className="px-6 py-4"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {loading ? (
                                        [1, 2, 3].map(i => <tr key={i} className="h-16 animate-pulse bg-background/50" />)
                                    ) : filteredLogs.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-text-secondary font-bold uppercase tracking-widest">No matching records found</td>
                                        </tr>
                                    ) : filteredLogs.map((log) => (
                                        <tr key={log.id} className="hover:bg-background transition-colors group">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center">
                                                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary mr-3 group-hover:bg-primary group-hover:text-white transition-all">
                                                        <Truck size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-text-primary">{log.vehicle_name}</p>
                                                        <p className="text-[10px] text-text-secondary font-bold uppercase tracking-tighter">ID: {log.vehicle_id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-sm font-semibold text-text-primary">
                                                {log.service_type}
                                                <p className="text-[10px] text-text-secondary font-medium mt-1 truncate max-w-[200px]">{log.description}</p>
                                            </td>
                                            <td className="px-6 py-5 text-sm text-text-secondary font-medium">
                                                {format(new Date(log.service_date), 'MMM d, yyyy')}
                                            </td>
                                            <td className="px-6 py-5 font-bold text-text-primary">
                                                ${log.cost?.toLocaleString() || '0'}
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <button
                                                    onClick={() => alert(`Reviewing service details for vehicle ${log.vehicle_name}`)}
                                                    className="p-2 text-text-secondary hover:text-primary hover:bg-primary/5 rounded-lg transition-all outline-none"
                                                >
                                                    <ChevronRight size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Log Service Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-card border border-border w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
                        <div className="p-8">
                            <h3 className="text-2xl font-bold text-text-primary mb-2">Record Maintenance</h3>
                            <p className="text-sm text-text-secondary mb-6">Log repairs and preventive services</p>

                            <form onSubmit={handleCreateLog} className="space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest pl-1">Target Asset</label>
                                    <select
                                        required
                                        value={formData.vehicle_id}
                                        onChange={e => setFormData({ ...formData, vehicle_id: e.target.value })}
                                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-bold text-text-primary focus:ring-2 focus:ring-primary outline-none appearance-none cursor-pointer"
                                    >
                                        <option value="">Select Vehicle</option>
                                        {vehicles.map(v => (
                                            <option key={v.id} value={v.id}>{v.name} ({v.license_plate})</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest pl-1">Service Type</label>
                                        <select
                                            value={formData.service_type}
                                            onChange={e => setFormData({ ...formData, service_type: e.target.value })}
                                            className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-bold text-text-primary focus:ring-2 focus:ring-primary outline-none appearance-none cursor-pointer"
                                        >
                                            <option value="Routine">Routine Inspection</option>
                                            <option value="Repair">Emergency Repair</option>
                                            <option value="Tier">Tires & Alignment</option>
                                            <option value="Oil">Oil & Fluid Change</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest pl-1">Operational Cost ($)</label>
                                        <input
                                            required
                                            type="number"
                                            value={formData.cost}
                                            onChange={e => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
                                            className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-bold text-text-primary focus:ring-2 focus:ring-primary outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest pl-1">Technical Description</label>
                                    <textarea
                                        required
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-bold text-text-primary focus:ring-2 focus:ring-primary outline-none h-24 resize-none"
                                        placeholder="Describe the maintenance work performed..."
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 py-3 bg-background text-text-secondary font-black text-[10px] uppercase tracking-widest rounded-xl border border-border hover:bg-card transition-all outline-none"
                                    >
                                        Discard
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-3 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:bg-blue-700 hover:-translate-y-0.5 transition-all outline-none"
                                    >
                                        Log Entry
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

export default Maintenance;
