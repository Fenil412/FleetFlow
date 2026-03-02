import React, { useState, useEffect, useMemo, useCallback } from 'react';
import api from '../api/axios';
import { Navigation, Loader2, X, Check, Search, Filter, MapPin, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatSafeDate } from '../utils/dateUtils';
import { useAuth } from '../features/auth/AuthContext';
import { motion } from 'framer-motion';
import PageHeader from '../components/ui/PageHeader';
import DataTable, { rowVariants } from '../components/ui/DataTable';
import ModalWrapper from '../components/ui/ModalWrapper';
import FormField from '../components/ui/FormField';
import StatCard from '../components/ui/StatCard';

const STATUS_BADGE = {
    DRAFT: 'badge-warning',
    DISPATCHED: 'badge-primary',
    COMPLETED: 'badge-success',
    CANCELLED: 'badge-danger',
};
const STATUS_LABEL = {
    DRAFT: 'Pending', DISPATCHED: 'On Trip', COMPLETED: 'Completed', CANCELLED: 'Cancelled',
};

const StatusBadge = ({ status }) => (
    <span className={`badge ${STATUS_BADGE[status] || 'badge bg-gray-100 text-gray-500 border-gray-200'}`}>
        <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-current opacity-75 animate-ping" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current" />
        </span>
        {STATUS_LABEL[status] || status}
    </span>
);

const TripRow = React.memo(({ trip, canDispatch, onDispatch, onComplete, onCancel, index }) => (
    <motion.tr
        custom={index} variants={rowVariants} initial="hidden" animate="visible"
        whileHover={{ backgroundColor: 'rgba(var(--color-primary) / 0.03)', x: 2 }}
        className="transition-colors group"
    >
        <td className="px-5 py-4 font-black text-text-primary text-sm">#{trip.id}</td>
        <td className="px-5 py-4 text-sm font-semibold text-text-secondary">{trip.vehicle_type || 'Fleet'}</td>
        <td className="px-5 py-4 font-bold text-text-primary text-sm">{trip.vehicle_name || 'N/A'}</td>
        <td className="px-5 py-4 text-sm text-text-secondary">{trip.driver_name || 'N/A'}</td>
        <td className="px-5 py-4 text-sm text-text-secondary">{trip.origin}</td>
        <td className="px-5 py-4 text-sm text-text-secondary">{trip.destination}</td>
        <td className="px-5 py-4 text-sm text-text-secondary">{formatSafeDate(trip.created_at)}</td>
        <td className="px-5 py-4"><StatusBadge status={trip.status} /></td>
        {canDispatch && (
            <td className="px-5 py-4">
                <div className="flex items-center justify-end gap-1.5">
                    {trip.status === 'DRAFT' && (
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={() => onDispatch(trip.id)}
                            className="btn btn-sm bg-primary/10 text-primary hover:bg-primary hover:text-white border-0">
                            Dispatch
                        </motion.button>
                    )}
                    {trip.status === 'DISPATCHED' && (
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={() => onComplete(trip)}
                            className="btn btn-sm bg-success/10 text-success hover:bg-success hover:text-white border-0">
                            Complete
                        </motion.button>
                    )}
                    {(trip.status === 'DRAFT' || trip.status === 'DISPATCHED') && (
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={() => onCancel(trip.id)}
                            className="btn btn-sm bg-danger/10 text-danger hover:bg-danger hover:text-white border-0">
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
    const [showNewTripModal, setShowNewTripModal] = useState(false);
    const [availableVehicles, setAvailableVehicles] = useState([]);
    const [availableDrivers, setAvailableDrivers] = useState([]);
    const [formData, setFormData] = useState({ vehicle_id: '', driver_id: '', origin: '', destination: '', cargo_weight_kg: 0, cargo_details: '' });
    const [completingTrip, setCompletingTrip] = useState(null);
    const [completeForm, setCompleteForm] = useState({ end_odometer: '', revenue: '' });
    const [submitting, setSubmitting] = useState(false);

    const fetchTrips = useCallback(async () => {
        try {
            const res = await api.get('/trips');
            setTrips(res.data?.data?.trips || []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }, []);

    const fetchResources = useCallback(async () => {
        try {
            const [vRes, dRes] = await Promise.all([api.get('/vehicles'), api.get('/drivers')]);
            setAvailableVehicles((vRes.data.data.vehicles || []).filter(v => v.status === 'AVAILABLE'));
            setAvailableDrivers((dRes.data.data.drivers || []).filter(d => d.status === 'ON_DUTY'));
        } catch (err) { console.error(err); }
    }, []);

    useEffect(() => { fetchTrips(); }, [fetchTrips]);

    const stats = useMemo(() => ({
        activeFleet: trips.filter(t => t.status === 'DISPATCHED').length,
        pendingCargo: trips.filter(t => t.status === 'DRAFT').length,
        completed: trips.filter(t => t.status === 'COMPLETED').length,
    }), [trips]);

    const handleCreateTrip = async (e) => {
        e.preventDefault(); setSubmitting(true);
        const t = toast.loading('Creating trip...');
        try {
            await api.post('/trips', formData);
            toast.success('Trip created & dispatched!', { id: t });
            setShowNewTripModal(false);
            setFormData({ vehicle_id: '', driver_id: '', origin: '', destination: '', cargo_weight_kg: 0, cargo_details: '' });
            fetchTrips();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed', { id: t }); }
        finally { setSubmitting(false); }
    };

    const handleDispatch = useCallback(async (id) => {
        const t = toast.loading('Dispatching...');
        try { await api.patch(`/trips/${id}/dispatch`); toast.success('Trip dispatched!', { id: t }); fetchTrips(); }
        catch (err) { toast.error(err.response?.data?.message || 'Failed', { id: t }); }
    }, [fetchTrips]);

    const openCompleteModal = useCallback((trip) => {
        setCompletingTrip(trip); setCompleteForm({ end_odometer: '', revenue: '' });
    }, []);

    const handleComplete = async (e) => {
        e.preventDefault(); setSubmitting(true);
        const t = toast.loading('Finalizing trip...');
        try {
            await api.patch(`/trips/${completingTrip.id}/complete`, {
                end_odometer: completeForm.end_odometer ? Number(completeForm.end_odometer) : undefined,
                revenue: completeForm.revenue ? Number(completeForm.revenue) : undefined,
            });
            toast.success('Trip completed!', { id: t }); setCompletingTrip(null); fetchTrips();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed', { id: t }); }
        finally { setSubmitting(false); }
    };

    const handleCancel = useCallback(async (id) => {
        if (!window.confirm('Cancel trip? This will release the vehicle and driver.')) return;
        const t = toast.loading('Cancelling...');
        try { await api.delete(`/trips/${id}`); toast.success('Trip cancelled', { id: t }); fetchTrips(); }
        catch (err) { toast.error(err.response?.data?.message || 'Failed', { id: t }); }
    }, [fetchTrips]);

    const canDispatch = useMemo(() => ['FLEET_MANAGER', 'DISPATCHER'].includes(user?.role_name), [user?.role_name]);
    const filteredTrips = useMemo(() => trips.filter(t => {
        const ms = statusFilter === 'ALL' || t.status === statusFilter;
        const mq = [t.vehicle_name, t.driver_name, t.origin, t.destination].some(v => v?.toLowerCase().includes(searchTerm.toLowerCase()));
        return ms && mq;
    }), [trips, statusFilter, searchTerm]);

    const handleShowNewTrip = useCallback(() => { setShowNewTripModal(v => !v); fetchResources(); }, [fetchResources]);
    const fc = (key) => (e) => setFormData(p => ({ ...p, [key]: e.target.value }));
    const fcc = (key) => (e) => setCompleteForm(p => ({ ...p, [key]: e.target.value }));

    const tableColumns = [
        'Trip #', 'Fleet Type', 'Vehicle', 'Driver', 'Origin', 'Destination', 'Date', 'Status',
        ...(canDispatch ? [{ label: 'Actions', className: 'text-right' }] : []),
    ];

    return (
        <div className="page-container">
            <PageHeader icon={Navigation} title="Trip Dispatcher" subtitle="Live deployment tracking" iconSpin>
                {canDispatch && (
                    <motion.button
                        whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}
                        onClick={handleShowNewTrip}
                        className="btn-primary"
                    >
                        <Navigation size={15} /> New Trip
                    </motion.button>
                )}
            </PageHeader>

            {/* KPI Row */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { title: 'Active Fleet', value: stats.activeFleet, iconColor: 'text-primary', iconBg: 'bg-primary/10' },
                    { title: 'Pending Cargo', value: stats.pendingCargo, iconColor: 'text-warning', iconBg: 'bg-warning/10' },
                    { title: 'Completed', value: stats.completed, iconColor: 'text-success', iconBg: 'bg-success/10' },
                ].map((kpi, i) => (
                    <StatCard key={kpi.title} {...kpi} delay={i * 0.1} />
                ))}
            </div>

            {/* Filters */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                className="flex flex-col sm:flex-row gap-3 card p-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
                    <input type="text" placeholder="Search vehicle, driver, route..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="input-field pl-9" />
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <Filter size={14} className="text-text-secondary" />
                    {['ALL', 'DRAFT', 'DISPATCHED', 'COMPLETED', 'CANCELLED'].map(s => (
                        <button key={s} onClick={() => setStatusFilter(s)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all outline-none ${statusFilter === s ? 'bg-primary text-white border-primary' : 'bg-background text-text-secondary border-border hover:bg-card'}`}>
                            {s === 'ALL' ? 'All' : STATUS_LABEL[s] || s}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Table */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <DataTable
                    columns={tableColumns} rows={filteredTrips} loading={loading}
                    colSpan={canDispatch ? 9 : 8}
                    emptyIcon={<Navigation size={48} />}
                    emptyText="No trips found"
                    renderRow={(trip, i) => (
                        <TripRow key={trip.id} index={i} trip={trip} canDispatch={canDispatch}
                            onDispatch={handleDispatch} onComplete={openCompleteModal} onCancel={handleCancel} />
                    )}
                />
            </motion.div>

            {/* New Trip Modal */}
            <ModalWrapper isOpen={showNewTripModal} onClose={() => setShowNewTripModal(false)}
                title="New Trip" subtitle="Fill in route and assignment details" maxWidth="max-w-2xl">
                <form onSubmit={handleCreateTrip} className="grid sm:grid-cols-2 gap-4">
                    <FormField label="Select Vehicle" name="vehicle_id" type="select" value={formData.vehicle_id} onChange={fc('vehicle_id')} required>
                        <option value="">-- Select Available Vehicle --</option>
                        {availableVehicles.map(v => <option key={v.id} value={v.id}>{v.name} ({v.license_plate}) — {v.vehicle_type}</option>)}
                    </FormField>
                    <FormField label="Select Driver" name="driver_id" type="select" value={formData.driver_id} onChange={fc('driver_id')} required>
                        <option value="">-- Select On-Duty Driver --</option>
                        {availableDrivers.map(d => <option key={d.id} value={d.id}>{d.name} (Score: {d.safety_score})</option>)}
                    </FormField>
                    <FormField label="Origin Address" name="origin" value={formData.origin} onChange={fc('origin')} placeholder="Pickup point" required leftIcon={MapPin} />
                    <FormField label="Destination" name="destination" value={formData.destination} onChange={fc('destination')} placeholder="Delivery point" required leftIcon={MapPin} />
                    <FormField label="Cargo Weight (kg)" name="cargo_weight_kg" type="number" min="0.1" step="0.1" value={formData.cargo_weight_kg} onChange={fc('cargo_weight_kg')} placeholder="e.g. 500" required />
                    <FormField label="Estimated Fuel Cost (₹)" name="cargo_details" type="number" min="0" step="0.01" value={formData.cargo_details} onChange={fc('cargo_details')} placeholder="Optional estimate" />
                    <div className="sm:col-span-2">
                        <button type="submit" disabled={submitting} className="btn-primary w-full btn-lg">
                            {submitting ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                            Confirm & Dispatch Trip
                        </button>
                    </div>
                </form>
            </ModalWrapper>

            {/* Complete Trip Modal */}
            <ModalWrapper isOpen={!!completingTrip} onClose={() => setCompletingTrip(null)}
                title={`Complete Trip #${completingTrip?.id}`}
                subtitle={completingTrip ? `${completingTrip.origin} → ${completingTrip.destination}` : ''}>
                <form onSubmit={handleComplete} className="space-y-4">
                    <FormField label="End Odometer (km)" name="end_odometer" type="number" min="0" value={completeForm.end_odometer} onChange={fcc('end_odometer')} placeholder="Current odometer reading" hint="Optional — leave blank to skip" />
                    <FormField label="Revenue (₹)" name="revenue" type="number" min="0" step="0.01" value={completeForm.revenue} onChange={fcc('revenue')} placeholder="Trip revenue earned" hint="Optional" />
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setCompletingTrip(null)} className="btn-secondary flex-1">Cancel</button>
                        <button type="submit" disabled={submitting} className="btn flex-1 bg-success text-white hover:bg-success/90">
                            {submitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                            Mark Completed
                        </button>
                    </div>
                </form>
            </ModalWrapper>
        </div>
    );
};

export default Trips;
