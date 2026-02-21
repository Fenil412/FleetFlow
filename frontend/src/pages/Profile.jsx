import React, { useState, useRef } from 'react';
import { useAuth } from '../features/auth/AuthContext';
import { Camera, User, Mail, Phone, Lock, Eye, EyeOff, Loader2, CheckCircle2, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

const Profile = () => {
    const { user, updateUser } = useAuth();

    // Profile edit state
    const [name, setName] = useState(user?.name || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [savingProfile, setSavingProfile] = useState(false);

    // Password change state
    const [currentPw, setCurrentPw] = useState('');
    const [newPw, setNewPw] = useState('');
    const [confirmPw, setConfirmPw] = useState('');
    const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
    const [savingPw, setSavingPw] = useState(false);

    // Avatar state
    const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || null);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const fileInputRef = useRef(null);

    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image must be smaller than 5MB');
            return;
        }
        setUploadingAvatar(true);
        try {
            const formData = new FormData();
            formData.append('avatar', file);
            const res = await api.post('/auth/profile/avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            const newUrl = res.data.data.user.avatar_url;
            setAvatarUrl(newUrl);
            updateUser({ avatar_url: newUrl });
            toast.success('Profile photo updated!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to upload photo');
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleProfileSave = async (e) => {
        e.preventDefault();
        setSavingProfile(true);
        try {
            const res = await api.patch('/auth/profile', { name, phone });
            updateUser({ name: res.data.data.user.name, phone: res.data.data.user.phone });
            toast.success('Profile updated!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setSavingProfile(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (newPw !== confirmPw) { toast.error('New passwords do not match'); return; }
        if (newPw.length < 6) { toast.error('Password must be at least 6 characters'); return; }
        setSavingPw(true);
        try {
            await api.patch('/auth/profile/password', { currentPassword: currentPw, newPassword: newPw });
            toast.success('Password changed! A confirmation email has been sent.');
            setCurrentPw(''); setNewPw(''); setConfirmPw('');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to change password');
        } finally {
            setSavingPw(false);
        }
    };

    const initials = (user?.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const role = user?.role_name || user?.role || 'User';

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
            <div>
                <h2 className="text-2xl font-bold text-text-primary">My Profile</h2>
                <p className="text-sm text-text-secondary font-medium mt-1 uppercase tracking-tighter">Manage your account information</p>
            </div>

            {/* Avatar + Basic Info Card */}
            <div className="bg-card rounded-3xl border border-border p-8 shadow-sm">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                        <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-primary/20 shadow-xl">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt={user?.name} className="h-full w-full object-cover" />
                            ) : (
                                <div className="h-full w-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-black">
                                    {initials}
                                </div>
                            )}
                        </div>
                        {/* Camera button */}
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadingAvatar}
                            className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary border-2 border-card flex items-center justify-center text-white hover:bg-primary/80 transition-colors shadow-lg"
                        >
                            {uploadingAvatar
                                ? <Loader2 size={14} className="animate-spin" />
                                : <Camera size={14} />
                            }
                        </button>
                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                    </div>

                    <div className="text-center sm:text-left">
                        <h3 className="text-xl font-extrabold text-text-primary">{user?.name}</h3>
                        <p className="text-sm text-text-secondary">{user?.email}</p>
                        <span className="mt-2 inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-black uppercase tracking-widest rounded-lg">
                            {role}
                        </span>
                    </div>

                    <div className="sm:ml-auto grid grid-cols-2 gap-4 text-center text-xs text-text-secondary">
                        <div className="bg-background rounded-2xl p-3 border border-border">
                            <p className="font-black text-text-primary text-sm">{user?.last_login_at ? new Date(user.last_login_at).toLocaleDateString('en-IN') : '—'}</p>
                            <p className="font-bold uppercase tracking-widest mt-0.5">Last Login</p>
                        </div>
                        <div className="bg-background rounded-2xl p-3 border border-border">
                            <p className="font-black text-text-primary text-sm">{user?.created_at ? new Date(user.created_at).toLocaleDateString('en-IN') : '—'}</p>
                            <p className="font-bold uppercase tracking-widest mt-0.5">Joined</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Profile Form */}
            <div className="bg-card rounded-3xl border border-border p-8 shadow-sm">
                <h4 className="text-sm font-black uppercase tracking-widest text-text-secondary mb-6 flex items-center gap-2">
                    <User size={14} /> Personal Information
                </h4>
                <form onSubmit={handleProfileSave} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-text-secondary mb-2">Full Name</label>
                            <div className="relative">
                                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                                <input
                                    type="text" value={name} onChange={e => setName(e.target.value)}
                                    className="w-full pl-9 pr-4 py-3 bg-background border border-border rounded-xl text-sm text-text-primary placeholder:text-text-secondary/50 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                                    placeholder="Your full name"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-text-secondary mb-2">Phone</label>
                            <div className="relative">
                                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                                <input
                                    type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                                    className="w-full pl-9 pr-4 py-3 bg-background border border-border rounded-xl text-sm text-text-primary placeholder:text-text-secondary/50 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                                    placeholder="+91 98765 43210"
                                />
                            </div>
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-black uppercase tracking-widest text-text-secondary mb-2">Email Address</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                                <input
                                    type="email" value={user?.email || ''} disabled
                                    className="w-full pl-9 pr-4 py-3 bg-background/50 border border-border rounded-xl text-sm text-text-secondary cursor-not-allowed"
                                />
                            </div>
                            <p className="text-xs text-text-secondary mt-1 ml-1">Email cannot be changed. Contact your Fleet Manager.</p>
                        </div>
                    </div>
                    <button
                        type="submit" disabled={savingProfile}
                        className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white text-sm font-black uppercase tracking-widest rounded-xl hover:bg-primary/90 transition-all disabled:opacity-60 outline-none"
                    >
                        {savingProfile ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                        {savingProfile ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            </div>

            {/* Change Password */}
            <div className="bg-card rounded-3xl border border-border p-8 shadow-sm">
                <h4 className="text-sm font-black uppercase tracking-widest text-text-secondary mb-6 flex items-center gap-2">
                    <Shield size={14} /> Change Password
                </h4>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                    {[
                        { label: 'Current Password', val: currentPw, setter: setCurrentPw, key: 'current' },
                        { label: 'New Password', val: newPw, setter: setNewPw, key: 'new' },
                        { label: 'Confirm New Password', val: confirmPw, setter: setConfirmPw, key: 'confirm' },
                    ].map(field => (
                        <div key={field.key}>
                            <label className="block text-xs font-black uppercase tracking-widest text-text-secondary mb-2">{field.label}</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                                <input
                                    type={showPw[field.key] ? 'text' : 'password'} value={field.val}
                                    onChange={e => field.setter(e.target.value)} required
                                    className="w-full pl-9 pr-10 py-3 bg-background border border-border rounded-xl text-sm text-text-primary placeholder:text-text-secondary/50 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                                    placeholder="••••••••"
                                />
                                <button type="button" onClick={() => setShowPw(p => ({ ...p, [field.key]: !p[field.key] }))}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors outline-none">
                                    {showPw[field.key] ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                    ))}
                    <button
                        type="submit" disabled={savingPw}
                        className="flex items-center gap-2 px-6 py-2.5 bg-danger text-white text-sm font-black uppercase tracking-widest rounded-xl hover:bg-danger/90 transition-all disabled:opacity-60 outline-none"
                    >
                        {savingPw ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
                        {savingPw ? 'Changing...' : 'Change Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Profile;
