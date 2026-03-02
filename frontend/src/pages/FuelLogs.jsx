import React, { useState, useEffect, useMemo, useCallback } from 'react';
import api from '../api/axios';
import { Fuel, Droplets, Plus, Edit2, Trash2, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../features/auth/AuthContext';
import { formatSafeDate } from '../utils/dateUtils';
import { motion } from 'framer-motion';
import PageHeader from '../components/ui/PageHeader';
import ModalWrapper from '../components/ui/ModalWrapper';
import FormField from '../components/ui/FormField';

const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({ opacity: 1, x: 0, transition: { delay: i * 0.04, type: 'spring', stiffness: 260, damping: 25 } }),
};


// Memoized Animated Row Component
const FuelLogRow = React.memo(({ log, canManage, onEdit, onDelete, index }) => (
    <motion.tr
        custom={index}
        variants={rowVariants}
        initial="hidden"
        animate="visible"
        whileHover={{ backgroundColor: 'rgba(var(--color-primary) / 0.03)', x: 2 }}
        className="transition-colors"
    >
        <td className="px-6 py-4">
            <div className="flex items-center gap-3">
                <motion.div whileHover={{ scale: 1.2, rotate: 10 }} className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><Fuel size={14} /></motion.div>
                <span className="text-sm font-bold text-text-primary">{log.vehicle_name}</span>
            </div>
        </td>
        <td className="px-6 py-4 text-sm font-bold text-text-primary">{log.liters ?? '---'} L</td>
        <td className="px-6 py-4 text-sm font-semibold text-text-secondary">₹{log.cost ?? '---'}</td>
        <td className="px-6 py-4 text-sm text-text-secondary">{log.odometer_km ? `${parseFloat(log.odometer_km).toLocaleString()} km` : '---'}</td>
        <td className="px-6 py-4 text-xs font-bold text-text-secondary uppercase">{formatSafeDate(log.fuel_date)}</td>
        {canManage && (
            <td className="px-6 py-4">
                <div className="flex items-center justify-end gap-2">
                    <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} onClick={() => onEdit(log)} className="p-1.5 text-text-secondary hover:text-primary hover:bg-primary/10 rounded-lg transition-all outline-none" title="Edit"><Edit2 size={14} /></motion.button>
                    <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} onClick={() => onDelete(log.id)} className="p-1.5 text-text-secondary hover:text-danger hover:bg-danger/10 rounded-lg transition-all outline-none" title="Delete"><Trash2 size={14} /></motion.button>
                </div>
            </td>
        )}
    </motion.tr>
));


const FuelLogs = () => {
    const { user } = useAuth();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingLog, setEditingLog] = useState(null);
    const [vehicles, setVehicles] = useState([]);
    const [formData, setFormData] = useState({
        vehicle_id: '', liters: 0, price_per_liter: 0, fuel_date: new Date().toISOString().split('T')[0], odometer_km: 0
    });

    const totalCost = useMemo(() => logs.reduce((sum, l) => sum + parseFloat(l.cost || 0), 0), [logs]);
    const totalLiters = useMemo(() => logs.reduce((sum, l) => sum + parseFloat(l.liters || 0), 0), [logs]);

    const fetchLogs = useCallback(async () => {
        try {
            const res = await api.get('/fuel');
            setLogs(res.data?.data?.logs || []);
        } catch (err) {
            console.error('Failed to fetch fuel logs', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchVehicles = useCallback(async () => {
        try {
            const res = await api.get('/vehicles');
            setVehicles(res.data.data.vehicles);
        } catch (err) {
            console.error('Failed to fetch vehicles', err);
        }
    }, []);

    useEffect(() => { fetchLogs(); }, [fetchLogs]);

    const openCreate = useCallback(() => {
        setEditingLog(null);
        setFormData({ vehicle_id: '', liters: 0, price_per_liter: 0, fuel_date: new Date().toISOString().split('T')[0], odometer_km: 0 });
        fetchVehicles();
        setShowModal(true);
    }, [fetchVehicles]);

    const openEdit = useCallback((log) => {
        setEditingLog(log);
        setFormData({
            vehicle_id: log.vehicle_id,
            liters: log.liters,
            price_per_liter: log.cost,
            fuel_date: log.fuel_date ? log.fuel_date.split('T')[0] : '',
            odometer_km: log.odometer_km || 0
        });
        setShowModal(true);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const t = toast.loading(editingLog ? 'Updating fuel record...' : 'Logging fuel transaction...');
        try {
            if (editingLog) {
                await api.put(`/fuel/${editingLog.id}`, {
                    liters: formData.liters,
                    cost: formData.price_per_liter,
                    fuel_date: formData.fuel_date,
                    odometer_km: formData.odometer_km
                });
                toast.success('Fuel record updated', { id: t });
            } else {
                await api.post('/fuel', { ...formData, cost: formData.liters * formData.price_per_liter });
                toast.success('Fuel loading recorded', { id: t });
            }
            setShowModal(false);
            fetchLogs();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed', { id: t });
        }
    };

    const handleDelete = useCallback(async (id) => {
        if (!window.confirm('Delete this fuel log entry?')) return;
        const t = toast.loading('Deleting...');
        try {
            await api.delete(`/fuel/${id}`);
            toast.success('Fuel log deleted', { id: t });
            fetchLogs();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete', { id: t });
        }
    }, [fetchLogs]);

    const canManage = useMemo(() => ['FLEET_MANAGER', 'FINANCIAL_ANALYST'].includes(user?.role_name), [user?.role_name]);

    const fc = (key) => (e) => setFormData(p => ({ ...p, [key]: e.target.value }));

    return (
        <div className="page-container">
            <PageHeader icon={Fuel} title="Fuel Expenditures" subtitle="Energy consumption and cost management" iconSpin>
                {canManage && (
                    <motion.button whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}
                        onClick={openCreate} className="btn-primary">
                        <Plus size={16} /> Add Fuel Entry
                    </motion.button>
                )}
            </PageHeader>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* KPI Summary */}
                <div className="lg:col-span-1 space-y-4">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
                        whileHover={{ y: -4 }}
                        className="bg-card rounded-3xl p-6 text-text-primary shadow-sm border border-border relative overflow-hidden group shine-card"
                    >
                        <div className="relative z-10">
                            <p className="text-xs font-bold text-text-secondary uppercase tracking-[0.2em] mb-4">Total Fuel Cost</p>
                            <h4 className="text-3xl font-extrabold mb-2">₹{totalCost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</h4>
                            <p className="text-xs font-bold text-text-secondary">{logs.length} transaction{logs.length !== 1 ? 's' : ''} recorded</p>
                        </div>
                        <motion.div
                            animate={{ rotate: [0, 360] }}
                            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                            className="absolute -right-8 -bottom-8 text-primary/10"
                        >
                            <Droplets size={160} />
                        </motion.div>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}
                        whileHover={{ y: -4 }}
                        className="bg-card rounded-3xl p-6 border border-border shadow-sm shine-card"
                    >
                        <p className="text-xs font-bold text-text-secondary uppercase tracking-[0.2em] mb-4">Total Volume</p>
                        <h4 className="text-3xl font-extrabold text-text-primary mb-1">{totalLiters.toLocaleString(undefined, { maximumFractionDigits: 0 })} L</h4>
                        <p className="text-xs text-text-secondary font-medium">across all vehicles</p>
                    </motion.div>
                </div>

                {/* History Table */}
                <div className="lg:col-span-3">
                    <div className="bg-card rounded-3xl shadow-sm border border-border overflow-hidden">
                        <div className="px-6 py-4 border-b border-border">
                            <h3 className="text-xs font-black text-text-secondary uppercase tracking-[0.2em]">Transaction Log</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.15em] border-b border-border bg-background/50">
                                        <th className="px-6 py-4">Vehicle</th>
                                        <th className="px-6 py-4">Volume (L)</th>
                                        <th className="px-6 py-4">Cost</th>
                                        <th className="px-6 py-4">Odometer</th>
                                        <th className="px-6 py-4">Date</th>
                                        {canManage && <th className="px-6 py-4 text-right">Actions</th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {loading ? (
                                        [1, 2, 3, 4].map(i => <tr key={i} className="h-14 animate-pulse bg-background/30" />)
                                    ) : logs.length === 0 ? (
                                        <tr><td colSpan="6" className="px-6 py-16 text-center">
                                            <Fuel className="mx-auto mb-3 text-text-secondary/30" size={40} />
                                            <p className="text-sm font-bold text-text-secondary uppercase tracking-widest">No fuel logs yet</p>
                                        </td></tr>
                                    ) : logs.map((log, i) => (
                                        <FuelLogRow
                                            key={log.id}
                                            index={i}
                                            log={log}
                                            canManage={canManage}
                                            onEdit={openEdit}
                                            onDelete={handleDelete}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <ModalWrapper isOpen={showModal} onClose={() => setShowModal(false)}
                title={editingLog ? 'Edit Fuel Entry' : 'Log Fuel Entry'}
                subtitle="Record fuel transaction details">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {!editingLog && (
                        <FormField label="Vehicle" name="vehicle_id" type="select" value={formData.vehicle_id} onChange={fc('vehicle_id')} required>
                            <option value="">Select vehicle...</option>
                            {vehicles.map(v => <option key={v.id} value={v.id}>{v.name} ({v.license_plate})</option>)}
                        </FormField>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                        <FormField label="Liters" name="liters" type="number" min="0.01" step="0.01" value={formData.liters} onChange={fc('liters')} required />
                        <FormField label={editingLog ? 'Total Cost (₹)' : 'Price/Liter (₹)'} name="price_per_liter" type="number" min="0.01" step="0.01" value={formData.price_per_liter} onChange={fc('price_per_liter')} required />
                        <FormField label="Fuel Date" name="fuel_date" type="date" value={formData.fuel_date} onChange={fc('fuel_date')} required />
                        <FormField label="Odometer (km)" name="odometer_km" type="number" min="0" value={formData.odometer_km} onChange={fc('odometer_km')} />
                    </div>
                    {!editingLog && formData.liters > 0 && formData.price_per_liter > 0 && (
                        <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-3">
                            <p className="text-sm text-text-secondary font-bold">Total Cost: <span className="text-primary font-black">₹{(formData.liters * formData.price_per_liter).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></p>
                        </div>
                    )}
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                        <button type="submit" className="btn-primary flex-1"><Check size={15} /> {editingLog ? 'Save Changes' : 'Log Fuel'}</button>
                    </div>
                </form>
            </ModalWrapper>
        </div>
    );
};

export default FuelLogs;
