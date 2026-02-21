import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Search, Plus, Filter, Truck, Bike, Car, Upload, Edit2, Trash2, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../features/auth/AuthContext';

const Vehicles = () => {
    const { user } = useAuth();
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState(null);
    const [formData, setFormData] = useState({
        name: '', license_plate: '', vehicle_type: 'Truck', max_capacity_kg: 2000, odometer_km: 0, status: 'AVAILABLE'
    });

    const fetchVehicles = async () => {
        try {
            const res = await api.get('/vehicles');
            setVehicles(res.data.data.vehicles);
        } catch (err) {
            console.error('Failed to fetch vehicles', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchVehicles(); }, []);

    const openCreate = () => {
        setEditingVehicle(null);
        setFormData({ name: '', license_plate: '', vehicle_type: 'Truck', max_capacity_kg: 2000, odometer_km: 0, status: 'AVAILABLE' });
        setShowRegisterModal(true);
    };

    const openEdit = (vehicle) => {
        setEditingVehicle(vehicle);
        setFormData({
            name: vehicle.name, license_plate: vehicle.license_plate,
            vehicle_type: vehicle.vehicle_type, max_capacity_kg: vehicle.max_capacity_kg,
            odometer_km: vehicle.odometer_km, status: vehicle.status
        });
        setShowRegisterModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const t = toast.loading(editingVehicle ? 'Updating vehicle...' : 'Registering vehicle...');
        try {
            if (editingVehicle) {
                await api.put(`/vehicles/${editingVehicle.id}`, formData);
                toast.success('Vehicle updated!', { id: t });
            } else {
                await api.post('/vehicles', formData);
                toast.success('Vehicle registered!', { id: t });
            }
            setShowRegisterModal(false);
            fetchVehicles();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Action failed', { id: t });
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

    const handleDelete = async (id) => {
        if (!window.confirm('Decommission this vehicle?')) return;
        const t = toast.loading('Decommissioning...');
        try {
            await api.delete(`/vehicles/${id}`);
            toast.success('Asset retired from fleet', { id: t });
            fetchVehicles();
        } catch (err) {
            toast.error('Action denied: active trip constraint.', { id: t });
        }
    };

    const filteredVehicles = vehicles.filter(v => {
        const search = `${v.name} ${v.license_plate}`.toLowerCase().includes(searchTerm.toLowerCase());
        const status = statusFilter === 'ALL' || v.status === statusFilter;
        return search && status;
    });

    const statusColor = (s) => {
        const map = { AVAILABLE: 'bg-success/10 text-success border-success/20', ON_TRIP: 'bg-primary/10 text-primary border-primary/20', IN_SHOP: 'bg-warning/10 text-warning border-warning/20', OUT_OF_SERVICE: 'bg-danger/10 text-danger border-danger/20' };
        return map[s] || 'bg-gray-100 text-gray-500';
    };

    const vehicleIcon = (t) => t === 'Truck' ? <Truck size={20} /> : t === 'Bike' ? <Bike size={20} /> : <Car size={20} />;

    const isManager = user?.role_name === 'FLEET_MANAGER';

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-text-primary">Vehicle Registry</h2>
                    <p className="text-sm text-text-secondary font-medium uppercase tracking-tighter mt-1">Manage and track fleet assets</p>
                </div>
                {isManager && (
                    <div className="flex gap-2">
                        <label className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-bold text-text-primary hover:bg-background transition-all cursor-pointer outline-none">
                            <Upload size={20} /> Bulk Import
                            <input type="file" accept=".csv" className="hidden" onChange={handleBulkImport} />
                        </label>
                        <button onClick={openCreate} className="flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:bg-blue-700 hover:-translate-y-0.5 transition-all outline-none">
                            <Plus size={20} /> Register Vehicle
                        </button>
                    </div>
                )}
            </div>

            <div className="flex flex-wrap items-center gap-4 bg-card p-4 rounded-2xl border border-border shadow-sm">
                <div className="relative flex-1 min-w-[240px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                    <input type="text" placeholder="Search by license plate or model..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-2.5 rounded-xl border-0 bg-background ring-1 ring-inset ring-border focus:ring-2 focus:ring-primary text-text-primary outline-none transition-all placeholder:text-text-secondary/50" />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {['ALL', 'AVAILABLE', 'ON_TRIP', 'IN_SHOP'].map(f => (
                        <button key={f} onClick={() => setStatusFilter(f)} className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${statusFilter === f ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-background text-text-secondary border-border hover:bg-card hover:text-text-primary'}`}>{f.replace('_', ' ')}</button>
                    ))}
                </div>
            </div>

            <div className="bg-card rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-background/50 border-b border-border text-xs font-bold text-text-secondary uppercase tracking-widest">
                                <th className="px-6 py-4">Asset Info</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4 text-center">Payload</th>
                                <th className="px-6 py-4">Odometer</th>
                                <th className="px-6 py-4">Status</th>
                                {isManager && <th className="px-6 py-4 text-right">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                [1, 2, 3].map(i => <tr key={i} className="animate-pulse"><td colSpan="6" className="px-6 py-4 h-16 bg-background/20" /></tr>)
                            ) : filteredVehicles.length === 0 ? (
                                <tr><td colSpan="6" className="px-6 py-20 text-center font-bold text-text-secondary uppercase tracking-widest">No vehicles match your search</td></tr>
                            ) : filteredVehicles.map(vehicle => (
                                <tr key={vehicle.id} className="hover:bg-background/50 transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mr-4 group-hover:bg-primary group-hover:text-white transition-all">
                                                {vehicleIcon(vehicle.vehicle_type)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-text-primary leading-none">{vehicle.name}</p>
                                                <p className="text-xs font-semibold text-text-secondary mt-1">{vehicle.license_plate}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5"><span className="text-sm font-semibold text-text-primary px-3 py-1 bg-background rounded-lg border border-border">{vehicle.vehicle_type}</span></td>
                                    <td className="px-6 py-5 text-center"><p className="text-sm font-bold text-text-primary">{(vehicle.max_capacity_kg / 1000).toFixed(1)}t</p></td>
                                    <td className="px-6 py-5"><p className="text-sm font-bold text-text-primary">{vehicle.odometer_km?.toLocaleString()} KM</p></td>
                                    <td className="px-6 py-5">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusColor(vehicle.status)}`}>
                                            {vehicle.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    {isManager && (
                                        <td className="px-6 py-5">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => openEdit(vehicle)} className="p-2 text-text-secondary hover:text-primary hover:bg-primary/10 rounded-lg transition-all outline-none" title="Edit"><Edit2 size={16} /></button>
                                                <button onClick={() => handleDelete(vehicle.id)} className="p-2 text-text-secondary hover:text-danger hover:bg-danger/10 rounded-lg transition-all outline-none" title="Delete"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create/Edit Modal */}
            {showRegisterModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-card border border-border w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-2xl font-bold text-text-primary">{editingVehicle ? 'Edit Vehicle' : 'Register Vehicle'}</h3>
                                    <p className="text-sm text-text-secondary mt-1">{editingVehicle ? 'Update asset details' : 'Add a new asset to the fleet'}</p>
                                </div>
                                <button onClick={() => setShowRegisterModal(false)} className="p-2 rounded-xl hover:bg-background text-text-secondary transition-colors outline-none"><X size={20} /></button>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {[
                                    { label: 'Vehicle Name', key: 'name', type: 'text', placeholder: 'e.g. Fleet Truck Alpha' },
                                    { label: 'License Plate', key: 'license_plate', type: 'text', placeholder: 'e.g. MH-01-AB-1234' },
                                    { label: 'Max Payload (kg)', key: 'max_capacity_kg', type: 'number', placeholder: '2000' },
                                    { label: 'Odometer (km)', key: 'odometer_km', type: 'number', placeholder: '0' },
                                ].map(({ label, key, type, placeholder }) => (
                                    <div key={key} className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest pl-1">{label}</label>
                                        <input required type={type} value={formData[key]} onChange={e => setFormData({ ...formData, [key]: e.target.value })} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-bold text-text-primary focus:ring-2 focus:ring-primary outline-none" placeholder={placeholder} />
                                    </div>
                                ))}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest pl-1">Vehicle Type</label>
                                        <select value={formData.vehicle_type} onChange={e => setFormData({ ...formData, vehicle_type: e.target.value })} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-bold text-text-primary focus:ring-2 focus:ring-primary outline-none">
                                            {['Truck', 'Van', 'Car', 'Bike'].map(t => <option key={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    {editingVehicle && (
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest pl-1">Status</label>
                                            <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-bold text-text-primary focus:ring-2 focus:ring-primary outline-none">
                                                {['AVAILABLE', 'IN_SHOP', 'OUT_OF_SERVICE'].map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                                            </select>
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={() => setShowRegisterModal(false)} className="flex-1 py-3 rounded-xl border border-border text-sm font-bold text-text-secondary hover:bg-background transition-colors outline-none">Cancel</button>
                                    <button type="submit" className="flex-1 py-3 rounded-xl bg-primary text-sm font-bold text-white hover:bg-blue-700 transition-colors outline-none flex items-center justify-center gap-2">
                                        <Check size={16} /> {editingVehicle ? 'Save Changes' : 'Register Vehicle'}
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

export default Vehicles;
