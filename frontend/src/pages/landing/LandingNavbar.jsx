import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Menu, X, Sun, Moon, Home, LayoutGrid, GitBranch, CloudLightning, Radio, LogIn, UserPlus, LayoutDashboard } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../features/auth/AuthContext';

const navLinks = [
    { label: 'Home', href: '#hero', icon: Home },
    { label: 'Features', href: '#features', icon: LayoutGrid },
    { label: 'How It Works', href: '#how-it-works', icon: GitBranch },
    { label: 'AI & Cloud', href: '#ai-cloud', icon: CloudLightning },
    { label: 'Live Status', href: '#live-status', icon: Radio },
];

const LandingNavbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const { user } = useAuth();
    const navigate = useNavigate();
    const isLoggedIn = !!user;

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const scrollTo = (href) => {
        setMenuOpen(false);
        const el = document.querySelector(href);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <motion.nav
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                ? 'bg-card/80 backdrop-blur-xl border-b border-border shadow-lg'
                : 'bg-transparent'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/landing" className="flex items-center gap-2 group">
                        <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 3, repeat: Infinity, repeatDelay: 4 }}
                        >
                            <Zap size={22} className="text-primary" />
                        </motion.div>
                        <span className="text-xl font-black gradient-text">FleetFlow</span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            return (
                                <button
                                    key={link.label}
                                    onClick={() => scrollTo(link.href)}
                                    className="relative flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary rounded-lg transition-colors group"
                                >
                                    <Icon size={14} className="group-hover:scale-110 transition-transform duration-200" />
                                    {link.label}
                                    {/* Animated underline */}
                                    <span className="absolute bottom-0.5 left-4 right-4 h-px bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full" />
                                </button>
                            );
                        })}
                    </div>

                    {/* Desktop CTAs */}
                    <div className="hidden md:flex items-center gap-2">
                        <motion.button
                            onClick={toggleTheme}
                            whileHover={{ scale: 1.1, rotate: 20 }}
                            whileTap={{ scale: 0.9 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                            className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-background/60 transition-colors"
                            title="Toggle theme"
                        >
                            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                        </motion.button>

                        {isLoggedIn ? (
                            <motion.button
                                whileHover={{ scale: 1.06, boxShadow: '0 6px 20px rgba(var(--color-primary)/0.35)' }}
                                whileTap={{ scale: 0.94 }}
                                onClick={() => navigate('/')}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-primary rounded-xl transition-all"
                            >
                                <LayoutDashboard size={14} />
                                Go to Dashboard
                            </motion.button>
                        ) : (
                            <>
                                <motion.button
                                    whileHover={{ scale: 1.06, boxShadow: '0 0 0 2px rgba(var(--color-primary)/0.3)' }}
                                    whileTap={{ scale: 0.94 }}
                                    onClick={() => navigate('/login')}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-text-primary border border-border rounded-xl hover:bg-background/80 hover:border-primary/40 transition-all"
                                >
                                    <LogIn size={14} />
                                    Sign In
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.06, boxShadow: '0 6px 20px rgba(var(--color-primary)/0.35)' }}
                                    whileTap={{ scale: 0.94 }}
                                    onClick={() => navigate('/signup')}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-primary rounded-xl transition-all"
                                >
                                    <UserPlus size={14} />
                                    Get Started
                                </motion.button>
                            </>
                        )}
                    </div>

                    {/* Mobile Hamburger */}
                    <div className="md:hidden flex items-center gap-2">
                        <button onClick={toggleTheme} className="p-2 rounded-lg text-text-secondary">
                            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-background/60 transition-colors"
                        >
                            {menuOpen ? <X size={22} /> : <Menu size={22} />}
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="md:hidden bg-card/95 backdrop-blur-xl border-b border-border overflow-hidden"
                    >
                        <div className="px-4 py-4 space-y-1">
                            {navLinks.map((link) => {
                                const Icon = link.icon;
                                return (
                                    <button
                                        key={link.label}
                                        onClick={() => scrollTo(link.href)}
                                        className="flex items-center gap-2.5 w-full text-left px-4 py-3 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-background/60 rounded-xl transition-colors"
                                    >
                                        <Icon size={15} className="text-primary" />
                                        {link.label}
                                    </button>
                                );
                            })}
                            <div className="flex gap-2 pt-2">
                                {isLoggedIn ? (
                                    <button
                                        onClick={() => { setMenuOpen(false); navigate('/'); }}
                                        className="flex-1 py-3 text-sm font-bold text-white bg-primary rounded-xl shadow-primary/25 hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <LayoutDashboard size={14} /> Go to Dashboard
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => { setMenuOpen(false); navigate('/login'); }}
                                            className="flex-1 py-3 text-sm font-semibold text-text-primary border border-border rounded-xl hover:bg-background/80 transition-colors"
                                        >
                                            Sign In
                                        </button>
                                        <button
                                            onClick={() => { setMenuOpen(false); navigate('/signup'); }}
                                            className="flex-1 py-3 text-sm font-bold text-white bg-primary rounded-xl shadow-primary/25 hover:bg-primary/90 transition-colors"
                                        >
                                            Get Started
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
};

export default LandingNavbar;
