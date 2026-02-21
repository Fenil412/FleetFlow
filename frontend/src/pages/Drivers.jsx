import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { User, Shield, CreditCard, Clock, Star, Plus } from 'lucide-react';

const Drivers = () => {
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        license_number: '',
        license_expiry: '',
        phone: '',
        email: ''
    });
    const [selectedDriver, setSelectedDriver] = useState(null);
    const [showProfileModal, setShowProfileModal] = useState(false);

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

    useEffect(() => {
        fetchDrivers();
    }, []);

    const handleAddPersonnel = async (e) => {
        e.preventDefault();
        try {
            await api.post('/drivers', formData);
            setShowAddModal(false);
            fetchDrivers();
            setFormData({ name: '', license_number: '', license_expiry: '', phone: '', email: '' });
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to add personnel');
        }
    };

    const filteredDrivers = drivers.filter(d => {
        const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.license_number.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || d.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'ON_DUTY': return 'bg-success/10 text-success border-success/20';
            case 'ON_TRIP': return 'bg-primary/10 text-primary border-primary/20';
            case 'OFF_DUTY': return 'bg-gray-100 text-gray-500 border-gray-200';
            case 'SUSPENDED': return 'bg-danger/10 text-danger border-danger/20';
            default: return 'bg-gray-100 text-gray-500';
        }
    };

    return (
        <div className="space-y-6 text-text-primary">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold">Driver Personnel</h2>
                    <p className="text-sm text-text-secondary font-medium mt-1 uppercase tracking-tighter">Monitoring safety and compliance</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-lg hover:bg-blue-700 transition-all outline-none"
                >
                    <Plus size={20} />
                    Add Personnel
                </button>
            </div>

            {/* Quick Actions & Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-card p-4 rounded-3xl border border-border shadow-sm">
                <div className="md:col-span-2 relative">
                    <input
                        type="text"
                        placeholder="Search by name or license..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-6 pr-4 py-2.5 rounded-2xl border-0 bg-background ring-1 ring-inset ring-border focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-text-secondary/50 text-text-primary"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-background border border-border rounded-2xl px-4 py-2.5 text-sm font-bold text-text-primary focus:ring-2 focus:ring-primary outline-none appearance-none cursor-pointer"
                >
                    <option value="ALL">All Status</option>
                    <option value="ON_DUTY">On Duty</option>
                    <option value="ON_TRIP">On Trip</option>
                    <option value="OFF_DUTY">Off Duty</option>
                    <option value="SUSPENDED">Suspended</option>
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    [1, 2, 3].map(i => <div key={i} className="h-48 bg-card border border-border rounded-3xl animate-pulse" />)
                ) : filteredDrivers.length === 0 ? (
                    <div className="md:col-span-2 lg:col-span-3 py-20 text-center font-bold text-text-secondary uppercase tracking-[0.2em]">
                        No personnel found
                    </div>
                ) : filteredDrivers.map((driver) => (
                    <div key={driver.id} className="bg-card rounded-3xl p-6 shadow-sm border border-border hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center">
                                <div className="h-14 w-14 rounded-2xl bg-background flex items-center justify-center text-text-primary shadow-inner border border-border">
                                    <User size={28} />
                                </div>
                                <div className="ml-4">
                                    <h4 className="font-bold text-text-primary text-lg leading-none">{driver.name}</h4>
                                    <div className={`mt-2 inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-black uppercase border ${getStatusColor(driver.status)}`}>
                                        {driver.status.replace('_', ' ')}
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <div className="flex items-center text-warning font-bold">
                                    <Star size={14} className="fill-warning mr-1" />
                                    <span>{Number(driver.safety_score || 5).toFixed(1)}</span>
                                </div>
                                <p className="text-[10px] text-text-secondary font-bold uppercase mt-1">Safety Score</p>
                            </div>
                        </div>

                        <div className="space-y-3 py-4 border-y border-border">
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center text-text-secondary font-medium">
                                    <Shield size={16} className="mr-2" />
                                    License
                                </div>
                                <span className="font-bold text-text-primary">{driver.license_number}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center text-text-secondary font-medium">
                                    <Clock size={16} className="mr-2" />
                                    Expiry
                                </div>
                                <span className={`font-bold ${new Date(driver.license_expiry) < new Date() ? 'text-danger' : 'text-text-primary'}`}>
                                    {new Date(driver.license_expiry).toLocaleDateString()}
                                </span>
                            </div>
                        </div>

                        <div className="mt-4 flex gap-2">
                            <button
                                onClick={() => {
                                    setSelectedDriver(driver);
                                    setShowProfileModal(true);
                                }}
                                className="flex-1 py-2 text-xs font-bold text-primary bg-primary/5 rounded-xl hover:bg-primary/10 transition-colors uppercase tracking-wider outline-none"
                            >
                                Full Profile
                            </button>
                            <button
                                onClick={() => alert(`Assigning vehicle to ${driver.name}`)}
                                className="px-3 py-2 text-xs font-bold text-text-secondary hover:bg-background rounded-xl transition-colors outline-none"
                            >
                                Assign
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Personnel Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-card border border-border w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
                        <div className="p-8">
                            <h3 className="text-2xl font-bold text-text-primary mb-2">Register Personnel</h3>
                            <p className="text-sm text-text-secondary mb-6">Enter official driver documentation details</p>

                            <form onSubmit={handleAddPersonnel} className="space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest pl-1">Full Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-bold text-text-primary focus:ring-2 focus:ring-primary outline-none"
                                        placeholder="Full legal name"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest pl-1">License ID</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.license_number}
                                            onChange={e => setFormData({ ...formData, license_number: e.target.value })}
                                            className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-bold text-text-primary focus:ring-2 focus:ring-primary outline-none"
                                            placeholder="AAA-00-1111"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest pl-1">Expiry Date</label>
                                        <input
                                            required
                                            type="date"
                                            value={formData.license_expiry}
                                            onChange={e => setFormData({ ...formData, license_expiry: e.target.value })}
                                            className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-bold text-text-primary focus:ring-2 focus:ring-primary outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest pl-1">Phone Number</label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-bold text-text-primary focus:ring-2 focus:ring-primary outline-none"
                                            placeholder="+1 (555) 000-0000"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest pl-1">Email Address</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-bold text-text-primary focus:ring-2 focus:ring-primary outline-none"
                                            placeholder="driver@fleetflow.com"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="flex-1 py-3 bg-background text-text-secondary font-black text-[10px] uppercase tracking-widest rounded-xl border border-border hover:bg-card transition-all outline-none"
                                    >
                                        Dismiss
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-3 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:bg-blue-700 hover:-translate-y-0.5 transition-all outline-none"
                                    >
                                        Confirm Entry
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            {/* Driver Profile Modal */}
            {showProfileModal && selectedDriver && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-card border border-border w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
                        <div className="p-8">
                            <div className="flex items-center mb-8">
                                <div className="h-20 w-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary shadow-lg border border-primary/20">
                                    <User size={40} />
                                </div>
                                <div className="ml-6">
                                    <h3 className="text-3xl font-bold text-text-primary leading-tight">{selectedDriver.name}</h3>
                                    <div className={`mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase border ${getStatusColor(selectedDriver.status)}`}>
                                        {selectedDriver.status.replace('_', ' ')}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6 mb-8">
                                <div className="bg-background/50 p-4 rounded-2xl border border-border">
                                    <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-2">License Number</p>
                                    <p className="font-bold text-text-primary text-lg">{selectedDriver.license_number}</p>
                                </div>
                                <div className="bg-background/50 p-4 rounded-2xl border border-border">
                                    <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-2">Safety Rating</p>
                                    <div className="flex items-center text-warning text-lg font-black">
                                        <Star size={18} className="fill-warning mr-2" />
                                        {Number(selectedDriver.safety_score || 5).toFixed(2)}
                                    </div>
                                </div>
                                <div className="bg-background/50 p-4 rounded-2xl border border-border">
                                    <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-2">License Expiry</p>
                                    <p className={`font-bold text-lg ${new Date(selectedDriver.license_expiry) < new Date() ? 'text-danger' : 'text-text-primary'}`}>
                                        {new Date(selectedDriver.license_expiry).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="bg-background/50 p-4 rounded-2xl border border-border">
                                    <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-2">Member Since</p>
                                    <p className="font-bold text-text-primary text-lg">{new Date(selectedDriver.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="flex items-center text-text-secondary">
                                    <Shield className="mr-3" size={20} />
                                    <span className="text-sm font-bold">Verified Background Check: 2024</span>
                                </div>
                                <div className="flex items-center text-text-secondary">
                                    <CreditCard className="mr-3" size={20} />
                                    <span className="text-sm font-bold">{selectedDriver.phone || '+1 (555) 000-0000'}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowProfileModal(false)}
                                className="w-full py-4 bg-primary text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/20 hover:bg-blue-700 hover:-translate-y-0.5 transition-all outline-none"
                            >
                                Close Profile
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Drivers;
