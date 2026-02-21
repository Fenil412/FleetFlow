import React, { useState } from 'react';
import { Mail, Shield, Lock, Eye, EyeOff, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const STEPS = { EMAIL: 0, OTP: 1, NEW_PW: 2, DONE: 3 };

const ForgotPassword = ({ onClose }) => {
    const [step, setStep] = useState(STEPS.EMAIL);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [resetToken, setResetToken] = useState('');
    const [newPw, setNewPw] = useState('');
    const [confirmPw, setConfirmPw] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/forgot-password', { email });
            toast.success('OTP sent! Check your email.');
            setStep(STEPS.OTP);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send OTP');
        } finally { setLoading(false); }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/auth/verify-otp', { email, otp });
            setResetToken(res.data.data.resetToken);
            setStep(STEPS.NEW_PW);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid OTP');
        } finally { setLoading(false); }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPw !== confirmPw) { toast.error('Passwords do not match'); return; }
        if (newPw.length < 6) { toast.error('Password must be at least 6 characters'); return; }
        setLoading(true);
        try {
            await api.post('/auth/reset-password', { resetToken, newPassword: newPw });
            setStep(STEPS.DONE);
            toast.success('Password reset! You can now log in.');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Reset failed');
        } finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="w-full max-w-md bg-card rounded-3xl border border-border shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center gap-3 px-7 py-5 border-b border-border bg-background/50">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <Shield size={20} />
                    </div>
                    <div>
                        <h3 className="font-extrabold text-text-primary">Reset Password</h3>
                        <p className="text-xs text-text-secondary font-bold uppercase tracking-widest">
                            {['Enter email', 'Enter OTP', 'New password', 'Complete'][step]}
                        </p>
                    </div>
                    <button onClick={onClose} className="ml-auto text-text-secondary hover:text-text-primary transition-colors outline-none">
                        <ArrowLeft size={18} />
                    </button>
                </div>

                <div className="px-7 py-7">
                    {/* Step indicator */}
                    <div className="flex items-center mb-7">
                        {[0, 1, 2].map(i => (
                            <React.Fragment key={i}>
                                <div className={`h-2.5 w-2.5 rounded-full transition-all ${step >= i ? 'bg-primary' : 'bg-border'}`} />
                                {i < 2 && <div className={`flex-1 h-0.5 mx-1 transition-all ${step > i ? 'bg-primary' : 'bg-border'}`} />}
                            </React.Fragment>
                        ))}
                    </div>

                    {/* Step 0: Email */}
                    {step === STEPS.EMAIL && (
                        <form onSubmit={handleSendOTP} className="space-y-4">
                            <p className="text-sm text-text-secondary">Enter your registered email. We'll send a 6-digit OTP.</p>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                                    placeholder="admin@fleetflow.com"
                                    className="w-full pl-9 pr-4 py-3 bg-background border border-border rounded-xl text-sm text-text-primary placeholder:text-text-secondary/50 focus:ring-2 focus:ring-primary outline-none" />
                            </div>
                            <button type="submit" disabled={loading}
                                className="w-full flex justify-center items-center gap-2 py-3 bg-primary text-white text-sm font-black uppercase tracking-widest rounded-xl hover:bg-primary/90 transition-all disabled:opacity-60 outline-none">
                                {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                                {loading ? 'Sending...' : 'Send OTP'}
                            </button>
                        </form>
                    )}

                    {/* Step 1: OTP */}
                    {step === STEPS.OTP && (
                        <form onSubmit={handleVerifyOTP} className="space-y-4">
                            <p className="text-sm text-text-secondary">Enter the 6-digit OTP sent to <strong className="text-text-primary">{email}</strong></p>
                            <input type="text" required value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="_ _ _ _ _ _"
                                className="w-full text-center text-2xl font-black tracking-[0.4em] py-4 bg-background border border-border rounded-xl text-text-primary placeholder:text-text-secondary/30 focus:ring-2 focus:ring-primary outline-none"
                                maxLength={6} />
                            <button type="submit" disabled={loading || otp.length < 6}
                                className="w-full flex justify-center items-center gap-2 py-3 bg-primary text-white text-sm font-black uppercase tracking-widest rounded-xl hover:bg-primary/90 transition-all disabled:opacity-60 outline-none">
                                {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                                {loading ? 'Verifying...' : 'Verify OTP'}
                            </button>
                            <button type="button" onClick={() => setStep(STEPS.EMAIL)} className="w-full text-sm text-text-secondary hover:text-primary transition-colors font-semibold outline-none">
                                ← Resend OTP
                            </button>
                        </form>
                    )}

                    {/* Step 2: New Password */}
                    {step === STEPS.NEW_PW && (
                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <p className="text-sm text-text-secondary">Choose a strong new password.</p>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                                <input type={showPw ? 'text' : 'password'} required value={newPw} onChange={e => setNewPw(e.target.value)}
                                    placeholder="New password"
                                    className="w-full pl-9 pr-10 py-3 bg-background border border-border rounded-xl text-sm text-text-primary placeholder:text-text-secondary/50 focus:ring-2 focus:ring-primary outline-none" />
                                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary outline-none">
                                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                                <input type="password" required value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
                                    placeholder="Confirm new password"
                                    className="w-full pl-9 pr-4 py-3 bg-background border border-border rounded-xl text-sm text-text-primary placeholder:text-text-secondary/50 focus:ring-2 focus:ring-primary outline-none" />
                            </div>
                            <button type="submit" disabled={loading}
                                className="w-full flex justify-center items-center gap-2 py-3 bg-primary text-white text-sm font-black uppercase tracking-widest rounded-xl hover:bg-primary/90 transition-all disabled:opacity-60 outline-none">
                                {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </form>
                    )}

                    {/* Step 3: Done */}
                    {step === STEPS.DONE && (
                        <div className="text-center py-4 space-y-4">
                            <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center text-success mx-auto">
                                <CheckCircle2 size={32} />
                            </div>
                            <h4 className="font-extrabold text-text-primary text-lg">Password Reset!</h4>
                            <p className="text-sm text-text-secondary">A confirmation email has been sent. You can now log in with your new password.</p>
                            <button onClick={onClose} className="w-full py-3 bg-primary text-white text-sm font-black uppercase tracking-widest rounded-xl hover:bg-primary/90 transition-all outline-none">
                                Back to Login
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
