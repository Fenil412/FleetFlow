import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Search, Plus, Filter, MoreVertical, Truck, Bike, Car } from 'lucide-react';

const Vehicles = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        license_plate: '',
        vehicle_type: 'Truck',
        max_capacity_kg: 2000,
        odometer_km: 0
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

    useEffect(() => {
        fetchVehicles();
    }, []);

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await api.post('/vehicles', formData);
            setShowRegisterModal(false);
            fetchVehicles();
            setFormData({ name: '', license_plate: '', vehicle_type: 'Truck', max_capacity_kg: 2000, odometer_km: 0 });
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to register vehicle');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to decommission this vehicle?')) {
            try {
                await api.delete(`/vehicles/${id}`);
                fetchVehicles();
            } catch (err) {
                alert('Action denied: Unauthorized or active trip constraint.');
            }
        }
    };

    const filteredVehicles = vehicles.filter(v => {
        const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.license_plate.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || v.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'AVAILABLE': return 'bg-success/10 text-success border-success/20';
            case 'ON_TRIP': return 'bg-primary/10 text-primary border-primary/20';
            case 'IN_SHOP': return 'bg-warning/10 text-warning border-warning/20';
            case 'OUT_OF_SERVICE': return 'bg-danger/10 text-danger border-danger/20';
            default: return 'bg-gray-100 text-gray-500';
        }
    };

    const getVehicleIcon = (type) => {
        switch (type) {
            case 'Truck': return <Truck size={20} />;
            case 'Bike': return <Bike size={20} />;
            default: return <Car size={20} />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-text-primary">Vehicle Registry</h2>
                    <p className="text-sm text-text-secondary font-medium uppercase tracking-tighter mt-1">Manage and track fleet assets</p>
                </div>
                <button
                    onClick={() => setShowRegisterModal(true)}
                    className="flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:bg-blue-700 hover:-translate-y-0.5 transition-all outline-none"
                >
                    <Plus size={20} />
                    Register Vehicle
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 bg-card p-4 rounded-2xl border border-border shadow-sm">
                <div className="relative flex-1 min-w-[240px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                    <input
                        type="text"
                        placeholder="Search by license plate or model..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 rounded-xl border-0 bg-background ring-1 ring-inset ring-border focus:ring-2 focus:ring-primary text-text-primary outline-none transition-all placeholder:text-text-secondary/50"
                    />
                </div>
                <div className="flex gap-2">
                    {['ALL', 'AVAILABLE', 'ON_TRIP', 'IN_SHOP'].map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setStatusFilter(filter)}
                            className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all truncate ${statusFilter === filter
                                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                                : 'bg-background text-text-secondary border-border hover:bg-card hover:text-text-primary'
                                }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
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
                                <th className="px-6 py-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                [1, 2, 3].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="6" className="px-6 py-4 h-16 bg-background/20" />
                                    </tr>
                                ))
                            ) : filteredVehicles.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-20 text-center font-bold text-text-secondary uppercase tracking-widest">
                                        No vehicles match your search
                                    </td>
                                </tr>
                            ) : filteredVehicles.map((vehicle) => (
                                <tr key={vehicle.id} className="hover:bg-background/50 transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mr-4 group-hover:bg-primary group-hover:text-white transition-all">
                                                {getVehicleIcon(vehicle.vehicle_type)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-text-primary leading-none">{vehicle.name}</p>
                                                <p className="text-xs font-semibold text-text-secondary mt-1">{vehicle.license_plate}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="text-sm font-semibold text-text-primary px-3 py-1 bg-gray-100 rounded-lg">{vehicle.vehicle_type}</span>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <p className="text-sm font-bold text-text-primary">{(vehicle.max_capacity_kg / 1000).toFixed(1)}t</p>
                                    </td>
                                    <td className="px-6 py-5">
                                        <p className="text-sm font-bold text-text-primary">{vehicle.odometer_km?.toLocaleString()} KM</p>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(vehicle.status)}`}>
                                            {vehicle.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <button
                                            onClick={() => handleDelete(vehicle.id)}
                                            className="p-2 text-text-secondary hover:text-danger hover:bg-danger/10 rounded-lg transition-all outline-none"
                                        >
                                            <MoreVertical size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Registration Modal */}
            {showRegisterModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-card border border-border w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
                        <div className="p-8">
                            <h3 className="text-2xl font-bold text-text-primary mb-2">Register Asset</h3>
                            <p className="text-sm text-text-secondary mb-6">Enter vehicle technical specifications</p>

                            <form onSubmit={handleRegister} className="space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest pl-1">Model Name</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-bold text-text-primary focus:ring-2 focus:ring-primary outline-none"
                                            placeholder="e.g. Volvo FH16"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest pl-1">License Plate</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.license_plate}
                                            onChange={e => setFormData({ ...formData, license_plate: e.target.value })}
                                            className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-bold text-text-primary focus:ring-2 focus:ring-primary outline-none"
                                            placeholder="e.g. ABC-1234"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest pl-1">Vehicle Type</label>
                                        <select
                                            value={formData.vehicle_type}
                                            onChange={e => setFormData({ ...formData, vehicle_type: e.target.value })}
                                            className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-bold text-text-primary focus:ring-2 focus:ring-primary outline-none appearance-none cursor-pointer"
                                        >
                                            <option value="Truck">Heavy Truck</option>
                                            <option value="Van">Light Van</option>
                                            <option value="Bike">Delivery Bike</option>
                                            <option value="Car">Utility Car</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest pl-1">Capacity (KG)</label>
                                        <input
                                            type="number"
                                            value={formData.max_capacity_kg}
                                            onChange={e => setFormData({ ...formData, max_capacity_kg: parseInt(e.target.value) || 0 })}
                                            className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-bold text-text-primary focus:ring-2 focus:ring-primary outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest pl-1">Initial Odometer (KM)</label>
                                    <input
                                        type="number"
                                        value={formData.odometer_km}
                                        onChange={e => setFormData({ ...formData, odometer_km: parseInt(e.target.value) || 0 })}
                                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-bold text-text-primary focus:ring-2 focus:ring-primary outline-none"
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowRegisterModal(false)}
                                        className="flex-1 py-3 bg-background text-text-secondary font-black text-[10px] uppercase tracking-widest rounded-xl border border-border hover:bg-card transition-all outline-none"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-3 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:bg-blue-700 hover:-translate-y-0.5 transition-all outline-none"
                                    >
                                        Confirm Registration
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
