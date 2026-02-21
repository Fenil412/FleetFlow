import React, { useState, Suspense, Component } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { Eye, EyeOff, Lock, Mail, Loader2, Navigation, User } from 'lucide-react';
import Spline from '@splinetool/react-spline';

class SplineErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true };
    }
    render() {
        if (this.state.hasError) {
            return <div className="absolute inset-0 bg-gradient-to-br from-navy to-secondary opacity-50" />;
        }
        return this.props.children;
    }
}

const SignUp = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('DISPATCHER');
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const { signUp } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        const result = await signUp(name, email, password, role);

        if (result.success) {
            navigate('/');
        } else {
            setError(result.message);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center bg-navy overflow-hidden">
            {/* 🧊 Spline Background (Safe Load) */}
            <div className="absolute inset-0 z-0 opacity-40">
                <SplineErrorBoundary>
                    <Suspense fallback={<div className="h-full w-full bg-navy" />}>
                        <Spline scene="https://prod.spline.design/6Wq1Q7YGyH-9T9-n/scene.splinecode" />
                    </Suspense>
                </SplineErrorBoundary>
            </div>

            <div className="relative z-10 w-full max-w-md px-4 animate-fade-in">
                <div className="overflow-hidden rounded-3xl glass-morphism shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]">
                    <div className="px-8 pt-10 pb-12">
                        <div className="text-center mb-10">
                            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
                                <Navigation size={32} />
                            </div>
                            <h2 className="text-3xl font-bold tracking-tight text-text-primary">Join FleetFlow</h2>
                            <p className="mt-2 text-sm text-text-secondary">Register as a Fleet Dispatcher</p>
                        </div>

                        {error && (
                            <div className="mb-6 rounded-xl bg-danger/10 p-4 text-sm text-danger border border-danger/20 animate-shake">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-2 ml-1">Full Name</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-text-secondary group-focus-within:text-primary transition-colors">
                                            <User size={18} />
                                        </div>
                                        <input
                                            type="text"
                                            required
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="John Doe"
                                            className="block w-full rounded-xl border-0 bg-gray-50 pl-11 pr-4 py-3.5 text-navy ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary focus:bg-white transition-all outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-2 ml-1">Email Address</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-text-secondary group-focus-within:text-primary transition-colors">
                                            <Mail size={18} />
                                        </div>
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="admin@fleetflow.com"
                                            className="block w-full rounded-xl border-0 bg-gray-50 pl-11 pr-4 py-3.5 text-navy ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary focus:bg-white transition-all outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-2 ml-1">Password</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-text-secondary group-focus-within:text-primary transition-colors">
                                            <Lock size={18} />
                                        </div>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="block w-full rounded-xl border-0 bg-gray-50 pl-11 pr-12 py-3.5 text-navy ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary focus:bg-white transition-all outline-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 flex items-center pr-4 text-text-secondary hover:text-navy transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-2 ml-1">Operational Role</label>
                                    <select
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        className="block w-full rounded-xl border-0 bg-gray-50 pl-4 pr-10 py-3.5 text-navy ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-inset focus:ring-primary focus:bg-white transition-all outline-none appearance-none cursor-pointer font-bold"
                                    >
                                        <option value="FLEET_MANAGER">Fleet Manager</option>
                                        <option value="DISPATCHER">Dispatcher</option>
                                        <option value="SAFETY_OFFICER">Safety Officer</option>
                                        <option value="FINANCIAL_ANALYST">Financial Analyst</option>
                                    </select>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="group relative flex w-full justify-center rounded-xl bg-navy px-4 py-4 text-sm font-bold text-white shadow-xl hover:bg-navy/90 hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all disabled:opacity-70 disabled:pointer-events-none overflow-hidden"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <>
                                        <span className="relative z-10 font-bold uppercase tracking-widest">Create Account</span>
                                        <div className="absolute inset-x-0 bottom-0 h-1 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    <div className="bg-gray-50 px-8 py-5 border-t border-gray-100 text-center">
                        <p className="text-xs text-text-secondary font-medium">
                            Already have an account?{' '}
                            <Link to="/login" className="text-primary font-bold hover:underline">
                                Log In
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
