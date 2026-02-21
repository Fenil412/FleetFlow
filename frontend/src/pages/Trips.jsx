import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Navigation, MapPin, Calendar, CreditCard, ChevronRight, Package, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const Trips = () => {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);

    const [statusFilter, setStatusFilter] = useState('ALL');
    const [showDispatchModal, setShowDispatchModal] = useState(false);
    const [availableVehicles, setAvailableVehicles] = useState([]);
    const [availableDrivers, setAvailableDrivers] = useState([]);
    const [formData, setFormData] = useState({
        vehicle_id: '',
        driver_id: '',
        origin: '',
        destination: '',
        cargo_details: '',
        cargo_weight_kg: 0
    });

    const fetchTrips = async () => {
        try {
            const res = await api.get('/trips');
            setTrips(res.data?.data?.trips || []);
        } catch (err) {
            console.error('Failed to fetch trips', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchResources = async () => {
        try {
            const [vRes, dRes] = await Promise.all([
                api.get('/vehicles'),
                api.get('/drivers')
            ]);
            setAvailableVehicles(vRes.data.data.vehicles.filter(v => v.status === 'AVAILABLE'));
            setAvailableDrivers(dRes.data.data.drivers.filter(d => d.status === 'ON_DUTY'));
        } catch (err) {
            console.error('Failed to fetch resources', err);
        }
    };

    useEffect(() => {
        fetchTrips();
    }, []);

    const handleCreateTrip = async (e) => {
        e.preventDefault();
        try {
            await api.post('/trips', formData);
            setShowDispatchModal(false);
            fetchTrips();
            setFormData({ vehicle_id: '', driver_id: '', origin: '', destination: '', cargo_details: '', cargo_weight_kg: 0 });
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create trip');
        }
    };

    const handleComplete = async (id) => {
        try {
            await api.patch(`/trips/${id}/complete`);
            fetchTrips();
        } catch (err) {
            alert('Failed to complete trip');
        }
    };

    const filteredTrips = trips.filter(t => statusFilter === 'ALL' || t.status === statusFilter);

    const getStatusStyle = (status) => {
        switch (status) {
            case 'DISPATCHED': return 'bg-primary text-white ring-primary/30';
            case 'COMPLETED': return 'bg-success text-white ring-success/30';
            case 'DRAFT': return 'bg-text-secondary/10 text-text-secondary ring-text-secondary/20';
            case 'CANCELLED': return 'bg-danger text-white ring-danger/30';
            default: return 'bg-background text-text-secondary';
        }
    };

    return (
        <div className="space-y-6 text-text-primary">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold font-sans tracking-tight text-text-primary">Trip Dispatcher</h2>
                    <p className="text-sm text-text-secondary font-medium mt-1 uppercase tracking-tighter">Live deployment tracking</p>
                </div>
                <div className="flex gap-2">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-card border border-border rounded-xl px-4 py-2.5 text-xs font-bold text-text-primary outline-none cursor-pointer"
                    >
                        <option value="ALL">All Activity</option>
                        <option value="DISPATCHED">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                    </select>
                    <button
                        onClick={() => {
                            fetchResources();
                            setShowDispatchModal(true);
                        }}
                        className="flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-xl hover:bg-blue-700 hover:-translate-y-0.5 transition-all outline-none"
                    >
                        <Navigation size={18} />
                        New Dispatch
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Active Trips Section */}
                <div className="space-y-4">
                    <h3 className="text-xs font-black text-text-secondary uppercase tracking-[0.2em] px-2 mb-4">Active Deployments</h3>
                    {loading ? (
                        <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" size={32} /></div>
                    ) : filteredTrips.filter(t => t.status === 'DISPATCHED').length === 0 ? (
                        <div className="bg-card border-2 border-dashed border-border rounded-3xl p-12 text-center">
                            <Package className="mx-auto text-text-secondary/30 mb-4" size={48} />
                            <p className="text-sm font-bold text-text-secondary uppercase tracking-widest">No matching active trips</p>
                        </div>
                    ) : filteredTrips.filter(t => t.status === 'DISPATCHED').map((trip) => (
                        <div key={trip.id} className="bg-card rounded-3xl p-6 shadow-sm border border-border relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
                            <div className="absolute right-0 top-0 h-1 w-full bg-primary" />
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center">
                                    <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mr-4 shadow-lg group-hover:bg-primary group-hover:text-white transition-all">
                                        <Navigation size={20} />
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-black uppercase text-primary tracking-widest leading-none">Trip ID: FF-{trip.id}</span>
                                        <h4 className="font-extrabold text-text-primary text-xl mt-1 leading-none">{trip.origin} <span className="text-primary mx-2">→</span> {trip.destination}</h4>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ring-4 ${getStatusStyle(trip.status)}`}>
                                    Live
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-background/50 p-4 rounded-2xl border border-border">
                                    <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1">Assigned Vehicle</p>
                                    <p className="font-bold text-text-primary truncate">{trip.vehicle_name || 'Heavy Unit A'}</p>
                                </div>
                                <div className="bg-background/50 p-4 rounded-2xl border border-border">
                                    <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1">Command Driver</p>
                                    <p className="font-bold text-text-primary truncate">{trip.driver_name || 'Personnel 01'}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-xs font-bold pt-4 border-t border-border">
                                <div className="flex items-center text-text-secondary">
                                    <Calendar size={14} className="mr-2" />
                                    Started: {format(new Date(trip.start_time), 'HH:mm | MMM d')}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleComplete(trip.id)}
                                        className="text-success hover:text-white hover:bg-success border border-success/50 px-3 py-1 rounded-lg text-[10px] font-black uppercase transition-all outline-none"
                                    >
                                        Complete
                                    </button>
                                    <button
                                        onClick={() => alert(`Redirecting to trip FF-${trip.id} log...`)}
                                        className="text-primary hover:text-text-primary transition-colors flex items-center uppercase tracking-widest outline-none"
                                    >
                                        Detail <ChevronRight size={14} className="ml-1" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Completed History Section */}
                <div className="space-y-4 lg:border-l lg:pl-8 border-border">
                    <h3 className="text-xs font-black text-text-secondary uppercase tracking-[0.2em] px-2 mb-4">Operations History</h3>
                    <div className="space-y-3">
                        {filteredTrips.filter(t => t.status === 'COMPLETED').length === 0 ? (
                            <p className="text-sm font-bold text-text-secondary text-center py-10 uppercase tracking-widest">No history recorded</p>
                        ) : filteredTrips.filter(t => t.status === 'COMPLETED').slice(0, 5).map((trip) => (
                            <div
                                key={trip.id}
                                onClick={() => alert(`Reviewing completed trip FF-${trip.id}`)}
                                className="bg-card/50 border border-border rounded-2xl p-4 flex items-center justify-between hover:bg-background transition-all shadow-sm hover:shadow-md cursor-pointer group"
                            >
                                <div className="flex items-center">
                                    <div className="h-8 w-8 rounded-lg bg-success/10 text-success flex items-center justify-center mr-4 group-hover:bg-success group-hover:text-white transition-all">
                                        <Navigation size={16} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-text-primary leading-none mb-1">{trip.origin} to {trip.destination}</p>
                                        <p className="text-[10px] font-semibold text-text-secondary uppercase">{format(new Date(trip.end_time), 'MMM d, yyyy')}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-success">+${trip.revenue?.toLocaleString() || '0'}</p>
                                    <p className="text-[10px] font-bold text-text-secondary uppercase leading-none mt-1">Revenue</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full py-3 text-xs font-black text-text-secondary uppercase tracking-widest bg-background rounded-2xl hover:bg-card transition-all border border-border outline-none">
                        View Archive
                    </button>
                </div>
            </div>

            {/* New Dispatch Modal */}
            {showDispatchModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-card border border-border w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
                        <div className="p-8">
                            <h3 className="text-2xl font-bold text-text-primary mb-2">Deploy Fleet</h3>
                            <p className="text-sm text-text-secondary mb-6">Assign resources for a new operational route</p>

                            <form onSubmit={handleCreateTrip} className="space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest pl-1">Origin</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.origin}
                                            onChange={e => setFormData({ ...formData, origin: e.target.value })}
                                            className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-bold text-text-primary focus:ring-2 focus:ring-primary outline-none"
                                            placeholder="Loading Point"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest pl-1">Destination</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.destination}
                                            onChange={e => setFormData({ ...formData, destination: e.target.value })}
                                            className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-bold text-text-primary focus:ring-2 focus:ring-primary outline-none"
                                            placeholder="Unloading Point"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest pl-1">Assigned Vehicle</label>
                                    <select
                                        required
                                        value={formData.vehicle_id}
                                        onChange={e => setFormData({ ...formData, vehicle_id: e.target.value })}
                                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-bold text-text-primary focus:ring-2 focus:ring-primary outline-none appearance-none cursor-pointer"
                                    >
                                        <option value="">Select Available Vehicle</option>
                                        {availableVehicles.map(v => (
                                            <option key={v.id} value={v.id}>{v.name} ({v.license_plate})</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest pl-1">Command Driver</label>
                                    <select
                                        required
                                        value={formData.driver_id}
                                        onChange={e => setFormData({ ...formData, driver_id: e.target.value })}
                                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-bold text-text-primary focus:ring-2 focus:ring-primary outline-none appearance-none cursor-pointer"
                                    >
                                        <option value="">Select Active Personnel</option>
                                        {availableDrivers.map(d => (
                                            <option key={d.id} value={d.id}>{d.name} (Score: {d.safety_score})</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest pl-1">Cargo Weight (KG)</label>
                                        <input
                                            required
                                            type="number"
                                            value={formData.cargo_weight_kg}
                                            onChange={e => setFormData({ ...formData, cargo_weight_kg: parseFloat(e.target.value) || 0 })}
                                            className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-bold text-text-primary focus:ring-2 focus:ring-primary outline-none"
                                            placeholder="Weight in KG"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest pl-1">Cargo Specifications</label>
                                        <input
                                            type="text"
                                            value={formData.cargo_details}
                                            onChange={e => setFormData({ ...formData, cargo_details: e.target.value })}
                                            className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-bold text-text-primary focus:ring-2 focus:ring-primary outline-none"
                                            placeholder="e.g. Spare Parts"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowDispatchModal(false)}
                                        className="flex-1 py-3 bg-background text-text-secondary font-black text-[10px] uppercase tracking-widest rounded-xl border border-border hover:bg-card transition-all outline-none"
                                    >
                                        Abort
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-3 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:bg-blue-700 hover:-translate-y-0.5 transition-all outline-none"
                                    >
                                        Dispatch Unit
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

export default Trips;
