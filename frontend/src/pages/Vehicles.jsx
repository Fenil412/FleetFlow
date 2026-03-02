import React, { useState, useEffect, useMemo, useCallback } from 'react';
import api from '../api/axios';
import {
    Search, Plus, Truck, Bike, Car, Upload, Edit2, Trash2, Check, Loader2, Gauge, Zap, Filter
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../features/auth/AuthContext';
import { motion } from 'framer-motion';
import PageHeader from '../components/ui/PageHeader';
import DataTable, { rowVariants } from '../components/ui/DataTable';
import ModalWrapper from '../components/ui/ModalWrapper';
import FormField from '../components/ui/FormField';
import EmptyState from '../components/ui/EmptyState';

/* ─── Status badge helper ─── */
const statusStyles = {
    AVAILABLE: 'badge-success',
    ON_TRIP: 'badge-primary',
    IN_SHOP: 'badge-warning',
    OUT_OF_SERVICE: 'badge-danger',
};
const StatusBadge = ({ status }) => (
    <span className={`badge ${statusStyles[status] || 'badge bg-gray-100 text-gray-500 border-gray-200'}`}>
        <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-current opacity-75 animate-ping" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current" />
        </span>
        {status.replace(/_/g, ' ')}
    </span>
);

/* ─── Vehicle table row ─── */
const VehicleRow = React.memo(({ vehicle, isManager, onEdit, onDelete, index }) => {
    const VIcon = vehicle.vehicle_type === 'Truck' ? Truck : vehicle.vehicle_type === 'Bike' ? Bike : Car;
    return (
        <motion.tr
            custom={index}
            variants={rowVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ backgroundColor: 'rgba(var(--color-primary) / 0.03)', x: 2 }}
            className="transition-colors group"
        >
            <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                    <motion.div
                        whileHover={{ scale: 1.15, rotate: 8 }}
                        className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all flex-shrink-0"
                    >
                        <VIcon size={18} />
                    </motion.div>
                    <div>
                        <p className="font-bold text-text-primary text-sm leading-tight">{vehicle.name}</p>
                        <p className="text-xs text-text-secondary mt-0.5 font-mono">{vehicle.license_plate}</p>
                    </div>
                </div>
            </td>
            <td className="px-5 py-4">
                <span className="text-sm font-semibold text-text-primary px-3 py-1 bg-background rounded-lg border border-border">
                    {vehicle.vehicle_type}
                </span>
            </td>
            <td className="px-5 py-4 text-center">
                <p className="text-sm font-bold text-text-primary">
                    {((vehicle.max_capacity_kg || 0) / 1000).toFixed(1)}<span className="text-xs text-text-secondary ml-0.5">t</span>
                </p>
            </td>
            <td className="px-5 py-4">
                <div className="flex items-center gap-1.5">
                    <Gauge size={13} className="text-text-secondary/40" />
                    <span className="text-sm font-bold text-text-primary">
                        {vehicle.odometer_km?.toLocaleString()} <span className="text-xs text-text-secondary">km</span>
                    </span>
                </div>
            </td>
            <td className="px-5 py-4"><StatusBadge status={vehicle.status} /></td>
            {isManager && (
                <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                        <motion.button
                            whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                            onClick={() => onEdit(vehicle)}
                            className="btn-icon btn-ghost text-text-secondary hover:text-primary hover:bg-primary/10"
                            title="Edit"
                        >
                            <Edit2 size={15} />
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                            onClick={() => onDelete(vehicle.id)}
                            className="btn-icon btn-ghost text-text-secondary hover:text-danger hover:bg-danger/10"
                            title="Delete"
                        >
                            <Trash2 size={15} />
                        </motion.button>
                    </div>
                </td>
            )}
        </motion.tr>
    );
});

/* ─── Main Page ─── */
const Vehicles = () => {
    const { user } = useAuth();
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [showModal, setShowModal] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '', license_plate: '', vehicle_type: 'Truck', max_capacity_kg: 2000, odometer_km: 0, status: 'AVAILABLE'
    });

    const fetchVehicles = useCallback(async () => {
        try {
            const res = await api.get('/vehicles');
            setVehicles(res.data.data.vehicles || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchVehicles(); }, [fetchVehicles]);

    const handleOpenCreate = useCallback(() => {
        setEditingVehicle(null);
        setFormData({ name: '', license_plate: '', vehicle_type: 'Truck', max_capacity_kg: 2000, odometer_km: 0, status: 'AVAILABLE' });
        setShowModal(true);
    }, []);

    const handleOpenEdit = useCallback((v) => {
        setEditingVehicle(v);
        setFormData({ name: v.name, license_plate: v.license_plate, vehicle_type: v.vehicle_type, max_capacity_kg: v.max_capacity_kg, odometer_km: v.odometer_km, status: v.status });
        setShowModal(true);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        const t = toast.loading(editingVehicle ? 'Updating...' : 'Registering...');
        try {
            if (editingVehicle) {
                await api.put(`/vehicles/${editingVehicle.id}`, formData);
                toast.success('Vehicle updated!', { id: t });
            } else {
                await api.post('/vehicles', formData);
                toast.success('Vehicle registered!', { id: t });
            }
            setShowModal(false);
            fetchVehicles();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Action failed', { id: t });
        } finally {
            setSubmitting(false);
        }
    };

    const handleBulkImport = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (event) => {
            const lines = event.target.result.split('\n').filter(l => l.trim());
            const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
            const data = lines.slice(1).map(line => {
                const values = line.split(',');
                return headers.reduce((obj, h, i) => { obj[h] = values[i]?.trim(); return obj; }, {});
            });
            const t = toast.loading(`Importing ${data.length} vehicles...`);
            let ok = 0, fail = 0;
            for (const item of data) {
                try {
                    await api.post('/vehicles', { name: item.name, license_plate: item.license_plate, vehicle_type: item.vehicle_type || 'Truck', max_capacity_kg: parseInt(item.max_capacity_kg) || 2000, odometer_km: parseInt(item.odometer_km) || 0 });
                    ok++;
                } catch { fail++; }
            }
            toast.success(`${ok} imported, ${fail} failed.`, { id: t, duration: 4000 });
            fetchVehicles();
        };
        reader.readAsText(file);
    };

    const handleDelete = useCallback(async (id) => {
        if (!window.confirm('Decommission this vehicle?')) return;
        const t = toast.loading('Decommissioning...');
        try {
            await api.delete(`/vehicles/${id}`);
            toast.success('Asset retired from fleet', { id: t });
            fetchVehicles();
        } catch {
            toast.error('Action denied: active trip constraint.', { id: t });
        }
    }, [fetchVehicles]);

    const filteredVehicles = useMemo(() =>
        vehicles.filter(v => {
            const s = `${v.name} ${v.license_plate}`.toLowerCase().includes(searchTerm.toLowerCase());
            const f = statusFilter === 'ALL' || v.status === statusFilter;
            return s && f;
        }), [vehicles, searchTerm, statusFilter]);

    const isManager = useMemo(() => user?.role_name === 'FLEET_MANAGER', [user?.role_name]);

    const tableColumns = [
        { label: 'Asset Info' }, { label: 'Type' }, { label: 'Payload', className: 'text-center' },
        { label: 'Odometer' }, { label: 'Status' },
        ...(isManager ? [{ label: 'Actions', className: 'text-right' }] : []),
    ];

    const fieldChange = (key) => (e) => setFormData(p => ({ ...p, [key]: e.target.value }));

    return (
        <div className="page-container">
            <PageHeader icon={Truck} title="Vehicle Registry" subtitle="Manage and track fleet assets" iconSpin>
                {isManager && (
                    <>
                        <motion.label
                            whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}
                            className="btn-secondary cursor-pointer"
                        >
                            <Upload size={16} /> Bulk Import
                            <input type="file" accept=".csv" className="hidden" onChange={handleBulkImport} />
                        </motion.label>
                        <motion.button
                            whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}
                            onClick={handleOpenCreate}
                            className="btn-primary"
                        >
                            <Plus size={16} /> Register Vehicle
                        </motion.button>
                    </>
                )}
            </PageHeader>

            {/* Filters */}
            <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                className="flex flex-col sm:flex-row flex-wrap items-center gap-3 card p-4"
            >
                <div className="relative flex-1 min-w-[220px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
                    <input
                        type="text" placeholder="Search by name or plate..."
                        value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                        className="input-field pl-9"
                    />
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <Filter size={14} className="text-text-secondary" />
                    {['ALL', 'AVAILABLE', 'ON_TRIP', 'IN_SHOP', 'OUT_OF_SERVICE'].map(f => (
                        <button
                            key={f}
                            onClick={() => setStatusFilter(f)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all outline-none ${statusFilter === f ? 'bg-primary text-white border-primary shadow-md shadow-primary/20' : 'bg-background text-text-secondary border-border hover:bg-card hover:text-text-primary'}`}
                        >
                            {f.replace(/_/g, ' ')}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Table */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <DataTable
                    columns={tableColumns}
                    rows={filteredVehicles}
                    loading={loading}
                    colSpan={isManager ? 6 : 5}
                    emptyIcon={<Truck size={48} />}
                    emptyText="No vehicles match your search"
                    renderRow={(vehicle, i) => (
                        <VehicleRow
                            key={vehicle.id} index={i} vehicle={vehicle}
                            isManager={isManager} onEdit={handleOpenEdit} onDelete={handleDelete}
                        />
                    )}
                />
            </motion.div>

            {/* Create / Edit Modal */}
            <ModalWrapper
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingVehicle ? 'Edit Vehicle' : 'Register Vehicle'}
                subtitle={editingVehicle ? 'Update asset details' : 'Add a new asset to the fleet'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                        <FormField label="Vehicle Name" name="name" value={formData.name} onChange={fieldChange('name')} placeholder="e.g. Fleet Truck Alpha" required />
                        <FormField label="License Plate" name="license_plate" value={formData.license_plate} onChange={fieldChange('license_plate')} placeholder="MH-01-AB-1234" required />
                        <FormField label="Max Payload (kg)" name="max_capacity_kg" type="number" value={formData.max_capacity_kg} onChange={fieldChange('max_capacity_kg')} placeholder="2000" required min="1" />
                        <FormField label="Odometer (km)" name="odometer_km" type="number" value={formData.odometer_km} onChange={fieldChange('odometer_km')} placeholder="0" required min="0" />
                        <FormField label="Vehicle Type" name="vehicle_type" type="select" value={formData.vehicle_type} onChange={fieldChange('vehicle_type')}>
                            {['Truck', 'Van', 'Car', 'Bike'].map(t => <option key={t}>{t}</option>)}
                        </FormField>
                        {editingVehicle && (
                            <FormField label="Status" name="status" type="select" value={formData.status} onChange={fieldChange('status')}>
                                {['AVAILABLE', 'IN_SHOP', 'OUT_OF_SERVICE'].map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                            </FormField>
                        )}
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                        <button type="submit" disabled={submitting} className="btn-primary flex-1">
                            {submitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                            {editingVehicle ? 'Save Changes' : 'Register Vehicle'}
                        </button>
                    </div>
                </form>
            </ModalWrapper>
        </div>
    );
};

export default Vehicles;
