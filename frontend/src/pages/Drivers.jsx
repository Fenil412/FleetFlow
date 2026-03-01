import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { User, Shield, Clock, Star, Plus, Edit2, Trash2, X, Check, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../features/auth/AuthContext';
import { formatSafeDate } from '../utils/dateUtils';
import { motion } from 'framer-motion';

const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: (i) => ({ opacity: 1, y: 0, scale: 1, transition: { delay: i * 0.08, type: 'spring', stiffness: 260, damping: 24 } }),
};


const Drivers = () => {
    const { user } = useAuth();
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [showModal, setShowModal] = useState(false);
    const [editingDriver, setEditingDriver] = useState(null);
    const [formData, setFormData] = useState({
        name: '', license_number: '', license_expiry: '', status: 'ON_DUTY', safety_score: 5
    });

    const fetchDrivers = async () => {
        try {
            const res = await api.get('/drivers');
            setDrivers(res.data.data.drivers);
        } catch (err) {
            console.error('Failed to fetch drivers', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDrivers(); }, []);

    const openCreate = () => {
        setEditingDriver(null);
        setFormData({ name: '', license_number: '', license_expiry: '', status: 'ON_DUTY', safety_score: 5 });
        setShowModal(true);
    };

    const openEdit = (driver) => {
        setEditingDriver(driver);
        setFormData({
            name: driver.name,
            license_number: driver.license_number,
            license_expiry: driver.license_expiry ? driver.license_expiry.split('T')[0] : '',
            status: driver.status,
            safety_score: driver.safety_score || 5
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const t = toast.loading(editingDriver ? 'Updating personnel...' : 'Registering personnel...');
        try {
            if (editingDriver) {
                await api.put(`/drivers/${editingDriver.id}`, formData);
                toast.success('Driver updated!', { id: t });
            } else {
                await api.post('/drivers', formData);
                toast.success('Personnel registered!', { id: t });
            }
            setShowModal(false);
            fetchDrivers();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Action failed', { id: t });
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Remove ${name} from personnel records?`)) return;
        const t = toast.loading('Removing personnel...');
        try {
            await api.delete(`/drivers/${id}`);
            toast.success('Personnel removed', { id: t });
            fetchDrivers();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to remove', { id: t });
        }
    };

    const filteredDrivers = drivers.filter(d => {
        const search = `${d.name} ${d.license_number}`.toLowerCase().includes(searchTerm.toLowerCase());
        const status = statusFilter === 'ALL' || d.status === statusFilter;
        return search && status;
    });

    const statusColor = (s) => {
        const map = { ON_DUTY: 'bg-success/10 text-success border-success/20', ON_TRIP: 'bg-primary/10 text-primary border-primary/20', OFF_DUTY: 'bg-gray-100 text-gray-500 border-gray-200', SUSPENDED: 'bg-danger/10 text-danger border-danger/20' };
        return map[s] || 'bg-gray-100 text-gray-500 border-gray-200';
    };

    const canManage = ['FLEET_MANAGER', 'SAFETY_OFFICER'].includes(user?.role_name);

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
                <div>
                    <div className="flex items-center gap-2">
                        <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}>
                            <Users size={22} className="text-primary" />
                        </motion.div>
                        <h2 className="text-2xl font-bold gradient-text">Personnel Registry</h2>
                    </div>
                    <p className="text-sm text-text-secondary font-medium mt-1 uppercase tracking-tighter">Driver licenses and duty status management</p>
                </div>
                {canManage && (
                    <motion.button whileHover={{ scale: 1.06, y: -2 }} whileTap={{ scale: 0.96 }}
                        onClick={openCreate} className="flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-lg hover:bg-blue-700 transition-all outline-none">
                        <Plus size={20} /> Add Personnel
                    </motion.button>
                )}
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-card p-4 rounded-3xl border border-border shadow-sm">
                <div className="md:col-span-2 relative">
                    <input type="text" placeholder="Search by name or license..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-6 pr-4 py-2.5 rounded-2xl border-0 bg-background ring-1 ring-inset ring-border focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-text-secondary/50 text-text-primary" />
                </div>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-background border border-border rounded-2xl px-4 py-2.5 text-sm font-bold text-text-primary focus:ring-2 focus:ring-primary outline-none appearance-none cursor-pointer">
                    {['ALL', 'ON_DUTY', 'ON_TRIP', 'OFF_DUTY', 'SUSPENDED'].map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    [1, 2, 3].map(i => <div key={i} className="h-56 bg-card border border-border rounded-3xl animate-pulse" />)
                ) : filteredDrivers.length === 0 ? (
                    <div className="md:col-span-2 lg:col-span-3 py-20 text-center font-bold text-text-secondary uppercase tracking-[0.2em]">No personnel found</div>
                ) : filteredDrivers.map((driver, i) => (
                    <motion.div
                        key={driver.id}
                        custom={i}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}
                        className="bg-card rounded-3xl p-6 border border-border shine-card cursor-default animated-border"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center">
                                <motion.div
                                    whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                                    transition={{ duration: 0.4 }}
                                    className="h-14 w-14 rounded-2xl bg-background flex items-center justify-center text-text-primary shadow-inner border border-border"
                                >
                                    <User size={28} />
                                </motion.div>
                                <div className="ml-4">
                                    <h4 className="font-bold text-text-primary text-lg leading-none">{driver.name}</h4>
                                    <div className={`mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase border ${statusColor(driver.status)}`}>
                                        <span className="relative flex h-1.5 w-1.5">
                                            <span className="absolute inline-flex h-full w-full rounded-full bg-current opacity-75 animate-ping" />
                                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current" />
                                        </span>
                                        {driver.status.replace('_', ' ')}
                                    </div>
                                </div>
                            </div>
                            <motion.div whileHover={{ scale: 1.2 }} className="flex items-center text-warning font-bold">
                                <motion.div animate={{ rotate: [0, 20, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}>
                                    <Star size={14} className="fill-warning mr-1" />
                                </motion.div>
                                <span>{Number(driver.safety_score || 5).toFixed(1)}</span>
                            </motion.div>
                        </div>

                        <div className="space-y-3 py-4 border-y border-border">
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center text-text-secondary font-medium"><Shield size={16} className="mr-2" />License</div>
                                <span className="font-bold text-text-primary">{driver.license_number}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center text-text-secondary font-medium"><Clock size={16} className="mr-2" />Expiry</div>
                                <span className={`font-bold ${new Date(driver.license_expiry) < new Date() ? 'text-danger' : 'text-text-primary'}`}>
                                    {formatSafeDate(driver.license_expiry)}
                                </span>
                            </div>
                        </div>

                        <div className="mt-4 flex gap-2">
                            {canManage && (
                                <>
                                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                                        onClick={() => openEdit(driver)} className="flex-1 py-2 text-xs font-bold text-primary bg-primary/5 rounded-xl hover:bg-primary/10 transition-colors uppercase tracking-wider outline-none flex items-center justify-center gap-1">
                                        <Edit2 size={12} /> Edit
                                    </motion.button>
                                    <motion.button whileHover={{ scale: 1.1, color: '#ef4444' }} whileTap={{ scale: 0.9 }}
                                        onClick={() => handleDelete(driver.id, driver.name)} className="px-3 py-2 text-xs font-bold text-danger hover:bg-danger/10 rounded-xl transition-colors outline-none">
                                        <Trash2 size={14} />
                                    </motion.button>
                                </>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Create / Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-card border border-border w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-2xl font-bold text-text-primary">{editingDriver ? 'Edit Personnel' : 'Register Personnel'}</h3>
                                    <p className="text-sm text-text-secondary mt-1">Enter official driver documentation details</p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-background text-text-secondary transition-colors outline-none"><X size={20} /></button>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest pl-1">Full Name</label>
                                    <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-bold text-text-primary focus:ring-2 focus:ring-primary outline-none" placeholder="Full legal name" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest pl-1">License Number</label>
                                    <input required type="text" value={formData.license_number} onChange={e => setFormData({ ...formData, license_number: e.target.value })} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-bold text-text-primary focus:ring-2 focus:ring-primary outline-none" placeholder="MH-DL-0000000000" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest pl-1">License Expiry</label>
                                        <input required type="date" value={formData.license_expiry} onChange={e => setFormData({ ...formData, license_expiry: e.target.value })} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-bold text-text-primary focus:ring-2 focus:ring-primary outline-none" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest pl-1">Safety Score</label>
                                        <input type="number" min="0" max="10" step="0.1" value={formData.safety_score} onChange={e => setFormData({ ...formData, safety_score: e.target.value })} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-bold text-text-primary focus:ring-2 focus:ring-primary outline-none" />
                                    </div>
                                </div>
                                {editingDriver && (
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest pl-1">Status</label>
                                        <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-bold text-text-primary focus:ring-2 focus:ring-primary outline-none">
                                            {['ON_DUTY', 'OFF_DUTY', 'SUSPENDED'].map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                                        </select>
                                    </div>
                                )}
                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl border border-border text-sm font-bold text-text-secondary hover:bg-background transition-colors outline-none">Cancel</button>
                                    <button type="submit" className="flex-1 py-3 rounded-xl bg-primary text-sm font-bold text-white hover:bg-blue-700 transition-colors outline-none flex items-center justify-center gap-2">
                                        <Check size={16} /> {editingDriver ? 'Save Changes' : 'Register Driver'}
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

export default Drivers;
