import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import {
    User, Shield, Clock, Star, Plus, Edit2, Trash2, Check, Users, Search, Filter
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../features/auth/AuthContext';
import { formatSafeDate } from '../utils/dateUtils';
import { motion } from 'framer-motion';
import PageHeader from '../components/ui/PageHeader';
import ModalWrapper from '../components/ui/ModalWrapper';
import FormField from '../components/ui/FormField';
import EmptyState from '../components/ui/EmptyState';

/* ─── Safety score ring ─── */
const ScoreRing = ({ score }) => {
    const pct = Math.min(100, (score / 10) * 100);
    const color = pct >= 80 ? 'text-success' : pct >= 50 ? 'text-warning' : 'text-danger';
    return (
        <div className="relative w-14 h-14 flex-shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="2" className="text-border" />
                <motion.circle
                    cx="18" cy="18" r="15.9" fill="none" strokeWidth="2.5"
                    stroke="currentColor" className={color}
                    strokeDasharray="100" strokeLinecap="round"
                    initial={{ strokeDashoffset: 100 }}
                    animate={{ strokeDashoffset: 100 - pct }}
                    transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-xs font-black ${color}`}>{Number(score).toFixed(1)}</span>
            </div>
        </div>
    );
};

const statusBadge = {
    ON_DUTY: 'badge-success',
    ON_TRIP: 'badge-primary',
    OFF_DUTY: 'badge bg-gray-100 text-gray-500 border-gray-200',
    SUSPENDED: 'badge-danger',
};

const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: (i) => ({ opacity: 1, y: 0, scale: 1, transition: { delay: i * 0.07, type: 'spring', stiffness: 260, damping: 24 } }),
};

/* ─── Initials Avatar ─── */
const Avatar = ({ name }) => {
    const initials = name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?';
    return (
        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/20 to-violet-500/20 flex items-center justify-center text-primary font-black text-lg border border-primary/20 flex-shrink-0">
            {initials}
        </div>
    );
};

const Drivers = () => {
    const { user } = useAuth();
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [showModal, setShowModal] = useState(false);
    const [editingDriver, setEditingDriver] = useState(null);
    const [formData, setFormData] = useState({ name: '', license_number: '', license_expiry: '', status: 'ON_DUTY', safety_score: 5 });

    const fetchDrivers = async () => {
        try { const res = await api.get('/drivers'); setDrivers(res.data.data.drivers); }
        catch (err) { console.error(err); } finally { setLoading(false); }
    };

    useEffect(() => { fetchDrivers(); }, []);

    const openCreate = () => {
        setEditingDriver(null);
        setFormData({ name: '', license_number: '', license_expiry: '', status: 'ON_DUTY', safety_score: 5 });
        setShowModal(true);
    };

    const openEdit = (driver) => {
        setEditingDriver(driver);
        setFormData({ name: driver.name, license_number: driver.license_number, license_expiry: driver.license_expiry?.split('T')[0] || '', status: driver.status, safety_score: driver.safety_score || 5 });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const t = toast.loading(editingDriver ? 'Updating...' : 'Registering...');
        try {
            if (editingDriver) { await api.put(`/drivers/${editingDriver.id}`, formData); toast.success('Driver updated!', { id: t }); }
            else { await api.post('/drivers', formData); toast.success('Driver registered!', { id: t }); }
            setShowModal(false); fetchDrivers();
        } catch (err) { toast.error(err.response?.data?.message || 'Action failed', { id: t }); }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Remove ${name} from records?`)) return;
        const t = toast.loading('Removing...');
        try { await api.delete(`/drivers/${id}`); toast.success('Driver removed', { id: t }); fetchDrivers(); }
        catch (err) { toast.error(err.response?.data?.message || 'Failed', { id: t }); }
    };

    const filteredDrivers = drivers.filter(d => {
        const s = `${d.name} ${d.license_number}`.toLowerCase().includes(searchTerm.toLowerCase());
        const f = statusFilter === 'ALL' || d.status === statusFilter;
        return s && f;
    });

    const canManage = ['FLEET_MANAGER', 'SAFETY_OFFICER'].includes(user?.role_name);
    const fc = (key) => (e) => setFormData(p => ({ ...p, [key]: e.target.value }));

    return (
        <div className="page-container">
            <PageHeader icon={Users} title="Personnel Registry" subtitle="Driver licenses and duty status management">
                {canManage && (
                    <motion.button whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}
                        onClick={openCreate} className="btn-primary">
                        <Plus size={16} /> Add Driver
                    </motion.button>
                )}
            </PageHeader>

            {/* Filters */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="flex flex-col sm:flex-row gap-3 card p-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
                    <input type="text" placeholder="Search by name or license..." value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)} className="input-field pl-9" />
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <Filter size={14} className="text-text-secondary" />
                    {['ALL', 'ON_DUTY', 'ON_TRIP', 'OFF_DUTY', 'SUSPENDED'].map(s => (
                        <button key={s} onClick={() => setStatusFilter(s)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all outline-none ${statusFilter === s ? 'bg-primary text-white border-primary' : 'bg-background text-text-secondary border-border hover:bg-card'}`}>
                            {s.replace(/_/g, ' ')}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Driver Cards Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-52 skeleton rounded-2xl" />)}
                </div>
            ) : filteredDrivers.length === 0 ? (
                <EmptyState icon={<Users size={52} />} title="No drivers found" message="Try adjusting your search or add a new driver." action={canManage && <button onClick={openCreate} className="btn-primary"><Plus size={15} /> Add Driver</button>} />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredDrivers.map((driver, i) => {
                        const expired = new Date(driver.license_expiry) < new Date();
                        return (
                            <motion.div key={driver.id} custom={i} variants={cardVariants} initial="hidden" animate="visible"
                                whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(0,0,0,0.12)' }}
                                className="card-hover p-5 shine-card animated-border cursor-default">
                                {/* Top row */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <Avatar name={driver.name} />
                                        <div>
                                            <h4 className="font-bold text-text-primary text-base leading-tight">{driver.name}</h4>
                                            <span className={`badge mt-1.5 ${statusBadge[driver.status] || ''}`}>
                                                <span className="relative flex h-1.5 w-1.5">
                                                    <span className="absolute inline-flex h-full w-full rounded-full bg-current opacity-75 animate-ping" />
                                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current" />
                                                </span>
                                                {driver.status.replace(/_/g, ' ')}
                                            </span>
                                        </div>
                                    </div>
                                    <ScoreRing score={driver.safety_score || 5} />
                                </div>

                                {/* Info */}
                                <div className="space-y-2.5 py-3.5 border-y border-border">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="flex items-center gap-1.5 text-text-secondary font-medium"><Shield size={14} />License</span>
                                        <span className="font-bold text-text-primary font-mono text-xs">{driver.license_number}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="flex items-center gap-1.5 text-text-secondary font-medium"><Clock size={14} />Expiry</span>
                                        <span className={`font-bold text-sm ${expired ? 'text-danger' : 'text-text-primary'}`}>
                                            {expired && <span className="text-[10px] font-black text-danger mr-1">EXPIRED</span>}
                                            {formatSafeDate(driver.license_expiry)}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                {canManage && (
                                    <div className="mt-3.5 flex gap-2">
                                        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                                            onClick={() => openEdit(driver)}
                                            className="flex-1 btn btn-sm bg-primary/8 text-primary border-0 hover:bg-primary/15">
                                            <Edit2 size={13} /> Edit
                                        </motion.button>
                                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                            onClick={() => handleDelete(driver.id, driver.name)}
                                            className="btn-icon btn btn-sm bg-danger/8 text-danger border-0 hover:bg-danger/15">
                                            <Trash2 size={14} />
                                        </motion.button>
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Create/Edit Modal */}
            <ModalWrapper isOpen={showModal} onClose={() => setShowModal(false)}
                title={editingDriver ? 'Edit Driver' : 'Register Driver'}
                subtitle="Enter official driver documentation details">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                        <FormField label="Full Name" name="name" value={formData.name} onChange={fc('name')} leftIcon={User} placeholder="Full legal name" required />
                        <FormField label="License Number" name="license_number" value={formData.license_number} onChange={fc('license_number')} leftIcon={Shield} placeholder="MH-DL-0000000000" required />
                        <FormField label="License Expiry" name="license_expiry" type="date" value={formData.license_expiry} onChange={fc('license_expiry')} required />
                        <FormField label="Safety Score (0–10)" name="safety_score" type="number" min="0" max="10" step="0.1" value={formData.safety_score} onChange={fc('safety_score')} />
                        {editingDriver && (
                            <FormField label="Status" name="status" type="select" value={formData.status} onChange={fc('status')} className="sm:col-span-2">
                                {['ON_DUTY', 'OFF_DUTY', 'SUSPENDED'].map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                            </FormField>
                        )}
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                        <button type="submit" className="btn-primary flex-1">
                            <Check size={15} /> {editingDriver ? 'Save Changes' : 'Register Driver'}
                        </button>
                    </div>
                </form>
            </ModalWrapper>
        </div>
    );
};

export default Drivers;
