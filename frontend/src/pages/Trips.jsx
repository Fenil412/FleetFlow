import React, { useState, useEffect, useMemo, useCallback } from 'react';
import api from '../api/axios';
import { Navigation, Loader2, X, Check, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatSafeDate } from '../utils/dateUtils';
import { useAuth } from '../features/auth/AuthContext';
import { motion } from 'framer-motion';

const STATUS_BG = {
    DRAFT: 'bg-yellow-400/10 border-yellow-400/20 text-yellow-400',
    DISPATCHED: 'bg-primary/10 border-primary/20 text-primary',
    COMPLETED: 'bg-success/10 border-success/20 text-success',
    CANCELLED: 'bg-danger/10 border-danger/20 text-danger',
};

const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({ opacity: 1, x: 0, transition: { delay: i * 0.04, type: 'spring', stiffness: 260, damping: 25 } }),
};


const STATUS_COLOR = {
    DRAFT: 'text-yellow-400',
    DISPATCHED: 'text-primary',
    COMPLETED: 'text-success',
    CANCELLED: 'text-danger',
};

const STATUS_LABEL = {
    DRAFT: 'Pending',
    DISPATCHED: 'On Trip',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
};

// Memoized Animated Trip Row
const TripRow = React.memo(({ trip, canDispatch, onDispatch, onComplete, onCancel, index }) => (
    <motion.tr
        custom={index}
        variants={rowVariants}
        initial="hidden"
        animate="visible"
        whileHover={{ backgroundColor: 'rgba(var(--color-primary) / 0.03)', x: 2 }}
        className="transition-colors group"
    >
        <td className="px-6 py-4 font-black text-text-primary">#{trip.id}</td>
        <td className="px-6 py-4 text-sm font-bold text-text-secondary">{trip.vehicle_type || 'Fleet'}</td>
        <td className="px-6 py-4"><span className="font-bold text-text-primary text-sm">{trip.vehicle_name || 'N/A'}</span></td>
        <td className="px-6 py-4"><span className="text-sm font-medium text-text-secondary">{trip.driver_name || 'N/A'}</span></td>
        <td className="px-6 py-4 text-sm font-medium text-text-secondary">{trip.origin}</td>
        <td className="px-6 py-4 text-sm font-medium text-text-secondary">{trip.destination}</td>
        <td className="px-6 py-4 text-xs font-bold text-text-secondary">{formatSafeDate(trip.created_at)}</td>
        <td className="px-6 py-4">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${STATUS_BG[trip.status] || 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-current opacity-75 animate-ping" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current" />
                </span>
                {STATUS_LABEL[trip.status] || trip.status}
            </span>
        </td>
        {canDispatch && (
            <td className="px-6 py-4">
                <div className="flex items-center justify-end gap-2 text-right">
                    {trip.status === 'DRAFT' && (
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={() => onDispatch(trip.id)} className="text-xs font-black uppercase px-3 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all outline-none">
                            Dispatch
                        </motion.button>
                    )}
                    {trip.status === 'DISPATCHED' && (
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={() => onComplete(trip)} className="text-xs font-black uppercase px-3 py-1 rounded-lg bg-success/10 text-success hover:bg-success hover:text-white transition-all outline-none">
                            Complete
                        </motion.button>
                    )}
                    {(trip.status === 'DRAFT' || trip.status === 'DISPATCHED') && (
                        <motion.button whileHover={{ scale: 1.05, color: '#ef4444' }} whileTap={{ scale: 0.95 }}
                            onClick={() => onCancel(trip.id)} className="text-xs font-black uppercase px-3 py-1 rounded-lg bg-danger/10 text-danger hover:bg-danger hover:text-white transition-all outline-none">
                            Cancel
                        </motion.button>
                    )}
                </div>
            </td>
        )}
    </motion.tr>
));


const Trips = () => {
    const { user } = useAuth();
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [showNewTripForm, setShowNewTripForm] = useState(false);
    const [availableVehicles, setAvailableVehicles] = useState([]);
    const [availableDrivers, setAvailableDrivers] = useState([]);
    const [formData, setFormData] = useState({
        vehicle_id: '', driver_id: '', origin: '', destination: '',
        cargo_weight_kg: 0, cargo_details: ''
    });
    // Complete trip modal
    const [completingTrip, setCompletingTrip] = useState(null);
    const [completeForm, setCompleteForm] = useState({ end_odometer: '', revenue: '' });

    const fetchTrips = useCallback(async () => {
        try {
            const res = await api.get('/trips');
            setTrips(res.data?.data?.trips || []);
        } catch (err) {
            console.error('Failed to fetch trips', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchResources = useCallback(async () => {
        try {
            const [vRes, dRes] = await Promise.all([
                api.get('/vehicles'),
                api.get('/drivers'),
            ]);
            setAvailableVehicles((vRes.data.data.vehicles || []).filter(v => v.status === 'AVAILABLE'));
            setAvailableDrivers((dRes.data.data.drivers || []).filter(d => d.status === 'ON_DUTY'));
        } catch (err) {
            console.error('Failed to fetch resources', err);
        }
    }, []);

    useEffect(() => { fetchTrips(); }, [fetchTrips]);

    // KPIs - Memoized
    const stats = useMemo(() => ({
        activeFleet: trips.filter(t => t.status === 'DISPATCHED').length,
        pendingCargo: trips.filter(t => t.status === 'DRAFT').length,
        completed: trips.filter(t => t.status === 'COMPLETED').length,
    }), [trips]);

    const handleCreateTrip = async (e) => {
        e.preventDefault();
        const t = toast.loading('Creating trip...');
        try {
            await api.post('/trips', formData);
            toast.success('Trip created & dispatched!', { id: t });
            setShowNewTripForm(false);
            setFormData({ vehicle_id: '', driver_id: '', origin: '', destination: '', cargo_weight_kg: 0, cargo_details: '' });
            fetchTrips();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create trip', { id: t });
        }
    };

    const handleDispatch = useCallback(async (id) => {
        const t = toast.loading('Dispatching...');
        try {
            await api.patch(`/trips/${id}/dispatch`);
            toast.success('Trip dispatched!', { id: t });
            fetchTrips();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Dispatch failed', { id: t });
        }
    }, [fetchTrips]);

    const openCompleteModal = useCallback((trip) => {
        setCompletingTrip(trip);
        setCompleteForm({ end_odometer: '', revenue: '' });
    }, []);

    const handleComplete = async (e) => {
        e.preventDefault();
        const t = toast.loading('Finalizing trip...');
        try {
            await api.patch(`/trips/${completingTrip.id}/complete`, {
                end_odometer: completeForm.end_odometer ? Number(completeForm.end_odometer) : undefined,
                revenue: completeForm.revenue ? Number(completeForm.revenue) : undefined,
            });
            toast.success('Trip completed!', { id: t });
            setCompletingTrip(null);
            fetchTrips();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to complete trip', { id: t });
        }
    };

    const handleCancel = useCallback(async (id) => {
        if (!window.confirm('Cancel and delete this trip? This will release the vehicle and driver.')) return;
        const t = toast.loading('Cancelling trip...');
        try {
            await api.delete(`/trips/${id}`);
            toast.success('Trip cancelled — resources released', { id: t });
            fetchTrips();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to cancel trip', { id: t });
        }
    }, [fetchTrips]);

    const canDispatch = useMemo(() =>
        ['FLEET_MANAGER', 'DISPATCHER'].includes(user?.role_name)
        , [user?.role_name]);

    const filteredTrips = useMemo(() =>
        trips.filter(t => {
            const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;
            const matchSearch = t.vehicle_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.driver_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.origin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.destination?.toLowerCase().includes(searchTerm.toLowerCase());
            return matchStatus && matchSearch;
        })
        , [trips, statusFilter, searchTerm]);

    const handleShowNewTrip = useCallback(() => {
        setShowNewTripForm(v => !v);
        fetchResources();
    }, [fetchResources]);

    return (
        <div className="space-y-6 text-text-primary">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
                <div>
                    <div className="flex items-center gap-2">
                        <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 6, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}>
                            <Navigation size={22} className="text-primary" />
                        </motion.div>
                        <h2 className="text-2xl font-bold gradient-text">Trip Dispatcher &amp; Management</h2>
                    </div>
                    <p className="text-sm text-text-secondary font-medium mt-1 uppercase tracking-tighter">Live deployment tracking</p>
                </div>
                <div className="flex gap-2">
                    {canDispatch && (
                        <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.97 }}
                            onClick={handleShowNewTrip}
                            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all outline-none"
                        >
                            <Navigation size={16} /> New Trip
                        </motion.button>
                    )}
                </div>
            </motion.div>

            {/* KPI Cards */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Active Fleet', value: stats.activeFleet, color: 'text-primary', glow: 'hover:glow-primary' },
                    { label: 'Pending Cargo', value: stats.pendingCargo, color: 'text-yellow-400', glow: '' },
                    { label: 'Completed', value: stats.completed, color: 'text-success', glow: 'hover:glow-success' },
                ].map((kpi, i) => (
                    <motion.div key={kpi.label}
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 + 0.2, type: 'spring', stiffness: 260, damping: 24 }}
                        whileHover={{ y: -4, scale: 1.02 }}
                        className={`bg-card rounded-2xl border border-border p-5 text-center shadow-sm shine-card cursor-default transition-shadow ${kpi.glow}`}
                    >
                        <p className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-2">{kpi.label}</p>
                        <motion.p className={`text-3xl font-extrabold ${kpi.color}`}
                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                            transition={{ delay: i * 0.1 + 0.4, type: 'spring', stiffness: 300 }}
                        >{kpi.value}</motion.p>
                    </motion.div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
                    <input type="text" placeholder="Search by vehicle, driver, origin, destination..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-card rounded-xl border border-border text-sm font-medium text-text-primary placeholder:text-text-secondary/50 focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div className="flex items-center gap-2">
                    <Filter size={15} className="text-text-secondary" />
                    {['ALL', 'DRAFT', 'DISPATCHED', 'COMPLETED', 'CANCELLED'].map(s => (
                        <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase transition-all outline-none ${statusFilter === s ? 'bg-primary text-white' : 'bg-card border border-border text-text-secondary hover:bg-background'}`}>
                            {s === 'ALL' ? 'All' : STATUS_LABEL[s] || s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-background/50 border-b border-border text-[10px] font-black text-text-secondary uppercase tracking-[0.15em]">
                                <th className="px-6 py-4">Trip #</th>
                                <th className="px-6 py-4">Fleet Type</th>
                                <th className="px-6 py-4">Vehicle</th>
                                <th className="px-6 py-4">Driver</th>
                                <th className="px-6 py-4">Origin</th>
                                <th className="px-6 py-4">Destination</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Status</th>
                                {canDispatch && <th className="px-6 py-4 text-right">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                [1, 2, 3, 4].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={canDispatch ? 9 : 8} className="h-14 bg-background/20" />
                                    </tr>
                                ))
                            ) : filteredTrips.length === 0 ? (
                                <tr>
                                    <td colSpan={canDispatch ? 9 : 8} className="px-6 py-16 text-center">
                                        <Navigation className="mx-auto mb-3 text-text-secondary/30" size={40} />
                                        <p className="text-sm font-bold text-text-secondary uppercase tracking-widest">No trips found</p>
                                    </td>
                                </tr>
                            ) : filteredTrips.map((trip, i) => (
                                <TripRow
                                    key={trip.id}
                                    index={i}
                                    trip={trip}
                                    canDispatch={canDispatch}
                                    onDispatch={handleDispatch}
                                    onComplete={openCompleteModal}
                                    onCancel={handleCancel}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* New Trip Form */}
            {showNewTripForm && canDispatch && (
                <div className="bg-card rounded-3xl border border-border shadow-sm p-8 animate-scale-in">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-black text-text-primary uppercase tracking-wider">New Trip Form</h3>
                        <button onClick={() => setShowNewTripForm(false)} className="p-2 rounded-xl text-text-secondary hover:bg-background transition-colors outline-none"><X size={18} /></button>
                    </div>
                    <form onSubmit={handleCreateTrip} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest pl-1">Select Vehicle</label>
                            <select required value={formData.vehicle_id} onChange={e => setFormData({ ...formData, vehicle_id: e.target.value })} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-bold text-text-primary focus:ring-2 focus:ring-primary outline-none">
                                <option value="">-- Select Available Vehicle --</option>
                                {availableVehicles.map(v => <option key={v.id} value={v.id}>{v.name} ({v.license_plate}) — {v.vehicle_type}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest pl-1">Cargo Weight (KG)</label>
                            <input required type="number" min="0.1" step="0.1" value={formData.cargo_weight_kg} onChange={e => setFormData({ ...formData, cargo_weight_kg: parseFloat(e.target.value) || 0 })} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-bold text-text-primary focus:ring-2 focus:ring-primary outline-none" placeholder="e.g. 500" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest pl-1">Select Driver</label>
                            <select required value={formData.driver_id} onChange={e => setFormData({ ...formData, driver_id: e.target.value })} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-bold text-text-primary focus:ring-2 focus:ring-primary outline-none">
                                <option value="">-- Select On-Duty Driver --</option>
                                {availableDrivers.map(d => <option key={d.id} value={d.id}>{d.name} (Score: {d.safety_score})</option>)}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest pl-1">Estimated Fuel Cost (₹)</label>
                            <input type="number" min="0" step="0.01" value={formData.cargo_details} onChange={e => setFormData({ ...formData, cargo_details: e.target.value })} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-bold text-text-primary focus:ring-2 focus:ring-primary outline-none" placeholder="Optional estimate" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest pl-1">Origin Address</label>
                            <input required type="text" value={formData.origin} onChange={e => setFormData({ ...formData, origin: e.target.value })} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-bold text-text-primary focus:ring-2 focus:ring-primary outline-none" placeholder="Pickup point" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest pl-1">Destination</label>
                            <input required type="text" value={formData.destination} onChange={e => setFormData({ ...formData, destination: e.target.value })} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-bold text-text-primary focus:ring-2 focus:ring-primary outline-none" placeholder="Delivery point" />
                        </div>
                        <div className="md:col-span-2">
                            <button type="submit" className="w-full py-3 rounded-xl bg-primary text-white text-sm font-black uppercase tracking-widest hover:bg-blue-700 transition-colors outline-none flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
                                <Check size={16} /> Confirm & Dispatch Trip
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Complete Trip Modal */}
            {completingTrip && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-card border border-border w-full max-w-md rounded-3xl shadow-2xl p-8 animate-scale-in">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-text-primary">Complete Trip #{completingTrip.id}</h3>
                                <p className="text-sm text-text-secondary mt-1">{completingTrip.origin} → {completingTrip.destination}</p>
                            </div>
                            <button onClick={() => setCompletingTrip(null)} className="p-2 rounded-xl hover:bg-background text-text-secondary outline-none"><X size={18} /></button>
                        </div>
                        <form onSubmit={handleComplete} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest pl-1">End Odometer (km) <span className="text-text-secondary/50 normal-case font-normal">(optional)</span></label>
                                <input type="number" min="0" value={completeForm.end_odometer} onChange={e => setCompleteForm({ ...completeForm, end_odometer: e.target.value })} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-bold text-text-primary focus:ring-2 focus:ring-primary outline-none" placeholder="Current vehicle odometer" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest pl-1">Revenue (₹) <span className="text-text-secondary/50 normal-case font-normal">(optional)</span></label>
                                <input type="number" min="0" step="0.01" value={completeForm.revenue} onChange={e => setCompleteForm({ ...completeForm, revenue: e.target.value })} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-bold text-text-primary focus:ring-2 focus:ring-primary outline-none" placeholder="Trip revenue earned" />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setCompletingTrip(null)} className="flex-1 py-3 rounded-xl border border-border text-sm font-bold text-text-secondary hover:bg-background transition-colors outline-none">Cancel</button>
                                <button type="submit" className="flex-1 py-3 rounded-xl bg-success text-white text-sm font-bold hover:bg-green-700 transition-colors outline-none flex items-center justify-center gap-2">
                                    <Check size={16} /> Mark Completed
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Trips;
