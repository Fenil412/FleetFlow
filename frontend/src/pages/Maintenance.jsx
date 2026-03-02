import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Wrench, Truck, Plus, Edit2, Trash2, Check, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../features/auth/AuthContext';
import { formatSafeDate } from '../utils/dateUtils';
import { motion } from 'framer-motion';
import PageHeader from '../components/ui/PageHeader';
import DataTable, { rowVariants } from '../components/ui/DataTable';
import ModalWrapper from '../components/ui/ModalWrapper';
import FormField from '../components/ui/FormField';




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

    const fc = (key) => (e) => setFormData(p => ({ ...p, [key]: e.target.value }));
    const tableColumns = ['Vehicle', 'Service Type', 'Description', 'Date', 'Cost (₹)', ...(isManager ? [{ label: 'Actions', className: 'text-right' }] : [])];

    return (
        <div className="page-container">
            <PageHeader icon={Wrench} title="Service & Maintenance" subtitle="Asset health and repair history">
                {isManager && (
                    <motion.button whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}
                        onClick={openCreate} className="btn-primary">
                        <Plus size={16} /> Log Service
                    </motion.button>
                )}
            </PageHeader>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
                <input type="text" placeholder="Search by vehicle or service type..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="input-field pl-9" />
            </motion.div>

            <DataTable columns={tableColumns} rows={filteredLogs} loading={loading} colSpan={isManager ? 6 : 5}
                emptyIcon={<Wrench size={48} />} emptyText="No maintenance records found"
                renderRow={(log, i) => (
                    <motion.tr key={log.id} custom={i} variants={rowVariants} initial="hidden" animate="visible"
                        whileHover={{ backgroundColor: 'rgba(var(--color-primary) / 0.03)', x: 2 }} className="transition-colors">
                        <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                                <motion.div whileHover={{ rotate: 15, scale: 1.1 }} className="h-9 w-9 rounded-xl bg-warning/10 flex items-center justify-center text-warning flex-shrink-0"><Truck size={15} /></motion.div>
                                <span className="font-bold text-text-primary text-sm">{log.vehicle_name}</span>
                            </div>
                        </td>
                        <td className="px-5 py-4">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-primary/10 text-primary text-xs font-black uppercase">
                                <Wrench size={10} /> {log.service_type}
                            </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-text-secondary max-w-[160px] truncate">{log.description || '—'}</td>
                        <td className="px-5 py-4 text-sm text-text-secondary">{formatSafeDate(log.service_date)}</td>
                        <td className="px-5 py-4 font-bold text-text-primary text-sm">₹{parseFloat(log.cost || 0).toLocaleString('en-IN')}</td>
                        {isManager && (
                            <td className="px-5 py-4">
                                <div className="flex items-center justify-end gap-1">
                                    <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} onClick={() => openEdit(log)} className="btn-icon btn-ghost hover:text-primary hover:bg-primary/10"><Edit2 size={14} /></motion.button>
                                    <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} onClick={() => handleDelete(log.id)} className="btn-icon btn-ghost hover:text-danger hover:bg-danger/10"><Trash2 size={14} /></motion.button>
                                </div>
                            </td>
                        )}
                    </motion.tr>
                )}
            />

            <ModalWrapper isOpen={showModal} onClose={() => setShowModal(false)}
                title={editingLog ? 'Edit Service Record' : 'Log Service Entry'}
                subtitle="Record vehicle maintenance details">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {!editingLog && (
                        <FormField label="Vehicle" name="vehicle_id" type="select" value={formData.vehicle_id} onChange={fc('vehicle_id')} required>
                            <option value="">Select vehicle...</option>
                            {vehicles.map(v => <option key={v.id} value={v.id}>{v.name} ({v.license_plate})</option>)}
                        </FormField>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                        <FormField label="Service Type" name="service_type" type="select" value={formData.service_type} onChange={fc('service_type')}>
                            {SERVICE_TYPES.map(t => <option key={t}>{t}</option>)}
                        </FormField>
                        <FormField label="Cost (₹)" name="cost" type="number" min="0" step="0.01" value={formData.cost} onChange={fc('cost')} required />
                    </div>
                    <FormField label="Service Date" name="service_date" type="date" value={formData.service_date} onChange={fc('service_date')} required />
                    <FormField label="Description" name="description" type="textarea" rows={3} value={formData.description} onChange={fc('description')} placeholder="Describe the service performed..." />
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                        <button type="submit" className="btn-primary flex-1"><Check size={15} /> {editingLog ? 'Save Changes' : 'Log Service'}</button>
                    </div>
                </form>
            </ModalWrapper>
        </div>
    );
};

export default Maintenance;
