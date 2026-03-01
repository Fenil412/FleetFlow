import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Wrench, Calendar, Truck, AlertCircle, Plus, Edit2, Trash2, X, Check, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../features/auth/AuthContext';
import { formatSafeDate } from '../utils/dateUtils';

const SERVICE_TYPES = ['Routine', 'Oil Change', 'Tire Replacement', 'Brake Service', 'Engine Repair', 'Electrical', 'Inspection', 'Other'];

const Maintenance = () => {
    const { user } = useAuth();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingLog, setEditingLog] = useState(null);
    const [vehicles, setVehicles] = useState([]);
    const [formData, setFormData] = useState({
        vehicle_id: '', service_type: 'Routine', description: '', cost: 0, service_date: new Date().toISOString().split('T')[0]
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

    useEffect(() => { fetchLogs(); }, []);

    const openCreate = () => {
        setEditingLog(null);
        setFormData({ vehicle_id: '', service_type: 'Routine', description: '', cost: 0, service_date: new Date().toISOString().split('T')[0] });
        fetchVehicles();
        setShowModal(true);
    };

    const openEdit = (log) => {
        setEditingLog(log);
        setFormData({
            vehicle_id: log.vehicle_id, service_type: log.service_type,
            description: log.description || '', cost: log.cost,
            service_date: log.service_date ? log.service_date.split('T')[0] : ''
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const t = toast.loading(editingLog ? 'Updating service record...' : 'Recording service log...');
        try {
            if (editingLog) {
                await api.put(`/maintenance/${editingLog.id}`, formData);
                toast.success('Service record updated', { id: t });
            } else {
                await api.post('/maintenance', formData);
                toast.success('Maintenance entry recorded', { id: t });
            }
            setShowModal(false);
            fetchLogs();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed', { id: t });
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this maintenance record?')) return;
        const t = toast.loading('Deleting record...');
        try {
            await api.delete(`/maintenance/${id}`);
            toast.success('Record deleted', { id: t });
            fetchLogs();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete', { id: t });
        }
    };

    const filteredLogs = logs.filter(log =>
        log.vehicle_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.service_type?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const isManager = user?.role_name === 'FLEET_MANAGER';

    return (
        <div className="space-y-6 text-text-primary">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold">Service & Maintenance</h2>
                    <p className="text-sm text-text-secondary font-medium mt-1 uppercase tracking-tighter">Asset health and repair history</p>
                </div>
                {isManager && (
                    <button onClick={openCreate} className="flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all outline-none">
                        <Plus size={18} /> Log Service
                    </button>
                )}
            </div>

            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                <input type="text" placeholder="Search by vehicle or service type..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-card rounded-2xl border border-border focus:ring-2 focus:ring-primary outline-none text-text-primary placeholder:text-text-secondary/50 transition-all" />
            </div>

            <div className="bg-card rounded-3xl shadow-sm border border-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-background/50 border-b border-border text-xs font-bold text-text-secondary uppercase tracking-widest">
                                <th className="px-6 py-4">Vehicle</th>
                                <th className="px-6 py-4">Service Type</th>
                                <th className="px-6 py-4">Description</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Cost</th>
                                {isManager && <th className="px-6 py-4 text-right">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                [1, 2, 3].map(i => <tr key={i} className="animate-pulse"><td colSpan="6" className="h-16 bg-background/20" /></tr>)
                            ) : filteredLogs.length === 0 ? (
                                <tr><td colSpan="6" className="px-6 py-20 text-center font-bold text-text-secondary uppercase tracking-widest">No maintenance records found</td></tr>
                            ) : filteredLogs.map(log => (
                                <tr key={log.id} className="hover:bg-background/50 transition-colors">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-xl bg-warning/10 flex items-center justify-center text-warning"><Truck size={16} /></div>
                                            <span className="font-bold text-text-primary">{log.vehicle_name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-primary/10 text-primary text-xs font-black uppercase">
                                            <Wrench size={11} /> {log.service_type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-sm text-text-secondary font-medium max-w-[200px] truncate">{log.description || '---'}</td>
                                    <td className="px-6 py-5 text-sm text-text-secondary font-medium">{formatSafeDate(log.service_date)}</td>
                                    <td className="px-6 py-5 font-bold text-text-primary">₹{parseFloat(log.cost || 0).toLocaleString('en-IN')}</td>
                                    {isManager && (
                                        <td className="px-6 py-5">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => openEdit(log)} className="p-2 text-text-secondary hover:text-primary hover:bg-primary/10 rounded-lg transition-all outline-none" title="Edit"><Edit2 size={15} /></button>
                                                <button onClick={() => handleDelete(log.id)} className="p-2 text-text-secondary hover:text-danger hover:bg-danger/10 rounded-lg transition-all outline-none" title="Delete"><Trash2 size={15} /></button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create / Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-card border border-border w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-2xl font-bold text-text-primary">{editingLog ? 'Edit Service Record' : 'Log Service Entry'}</h3>
                                    <p className="text-sm text-text-secondary mt-1">Record vehicle maintenance details</p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-background text-text-secondary transition-colors outline-none"><X size={20} /></button>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {!editingLog && (
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest pl-1">Vehicle</label>
                                        <select required value={formData.vehicle_id} onChange={e => setFormData({ ...formData, vehicle_id: e.target.value })} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-bold text-text-primary focus:ring-2 focus:ring-primary outline-none">
                                            <option value="">Select vehicle...</option>
                                            {vehicles.map(v => <option key={v.id} value={v.id}>{v.name} ({v.license_plate})</option>)}
                                        </select>
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest pl-1">Service Type</label>
                                        <select value={formData.service_type} onChange={e => setFormData({ ...formData, service_type: e.target.value })} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-bold text-text-primary focus:ring-2 focus:ring-primary outline-none">
                                            {SERVICE_TYPES.map(t => <option key={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest pl-1">Cost (₹)</label>
                                        <input required type="number" min="0" step="0.01" value={formData.cost} onChange={e => setFormData({ ...formData, cost: e.target.value })} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-bold text-text-primary focus:ring-2 focus:ring-primary outline-none" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest pl-1">Service Date</label>
                                    <input required type="date" value={formData.service_date} onChange={e => setFormData({ ...formData, service_date: e.target.value })} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-bold text-text-primary focus:ring-2 focus:ring-primary outline-none" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest pl-1">Description</label>
                                    <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows="3" className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-bold text-text-primary focus:ring-2 focus:ring-primary outline-none resize-none" placeholder="Describe the service performed..." />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl border border-border text-sm font-bold text-text-secondary hover:bg-background transition-colors outline-none">Cancel</button>
                                    <button type="submit" className="flex-1 py-3 rounded-xl bg-primary text-sm font-bold text-white hover:bg-blue-700 transition-colors outline-none flex items-center justify-center gap-2">
                                        <Check size={16} /> {editingLog ? 'Save Changes' : 'Log Service'}
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
