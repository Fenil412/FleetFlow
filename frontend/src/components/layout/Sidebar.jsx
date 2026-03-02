import React from 'react';
import {
    LayoutDashboard, Truck, Users, Navigation, Wrench,
    Fuel, BarChart3, ChevronLeft, ChevronRight, LogOut,
    X, History, Info, UserCircle2, Zap, BrainCircuit, Home
} from 'lucide-react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../features/auth/AuthContext';
import ThemeToggle from '../ui/ThemeToggle';

const navVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.055, delayChildren: 0.08 } },
};
const navItemVariants = {
    hidden: { opacity: 0, x: -18 },
    visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 320, damping: 28 } },
};

/* ─── Tooltip wrapper for icon-only mode ─── */
const NavTooltip = ({ label, children, show }) => (
    <div className="relative group/tooltip">
        {children}
        {show && (
            <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 z-[100] opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-150">
                <div className="bg-navy text-white text-xs font-bold px-3 py-2 rounded-xl whitespace-nowrap shadow-xl border border-white/10">
                    {label}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-navy" />
                </div>
            </div>
        )}
    </div>
);

const Sidebar = ({ isOpen, toggleSidebar, isMobile, closeMobile }) => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { name: 'Home', icon: Home, path: '/landing', roles: ['FLEET_MANAGER', 'DISPATCHER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST'] },
        { name: 'Dashboard', icon: LayoutDashboard, path: '/', roles: ['FLEET_MANAGER', 'DISPATCHER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST'] },
        { name: 'AI Intelligence', icon: BrainCircuit, path: '/ai', roles: ['FLEET_MANAGER', 'DISPATCHER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST'] },
        { name: 'Vehicles', icon: Truck, path: '/vehicles', roles: ['FLEET_MANAGER', 'DISPATCHER'] },
        { name: 'Drivers', icon: Users, path: '/drivers', roles: ['FLEET_MANAGER', 'DISPATCHER', 'SAFETY_OFFICER'] },
        { name: 'Trips', icon: Navigation, path: '/trips', roles: ['FLEET_MANAGER', 'DISPATCHER'] },
        { name: 'Maintenance', icon: Wrench, path: '/maintenance', roles: ['FLEET_MANAGER', 'SAFETY_OFFICER'] },
        { name: 'Fuel Logs', icon: Fuel, path: '/fuel', roles: ['FLEET_MANAGER', 'FINANCIAL_ANALYST'] },
        { name: 'Analytics', icon: BarChart3, path: '/analytics', roles: ['FLEET_MANAGER', 'FINANCIAL_ANALYST'] },
        { name: 'History', icon: History, path: '/history', roles: ['FLEET_MANAGER', 'DISPATCHER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST'] },
        { name: 'About', icon: Info, path: '/about', roles: ['FLEET_MANAGER', 'DISPATCHER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST'] },
    ];

    const filteredMenuItems = menuItems.filter(item =>
        item.roles.includes(user?.role_name || user?.role)
    );

    const showTooltip = !isOpen && !isMobile;

    return (
        <motion.aside
            animate={{ width: isMobile ? (isOpen ? 256 : 0) : isOpen ? 256 : 80, x: isMobile && !isOpen ? -256 : 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 35 }}
            className="fixed inset-y-0 left-0 z-50 bg-card text-text-primary border-r border-border overflow-hidden shadow-xl"
        >
            <div className="flex h-full flex-col w-64">
                {/* Header */}
                <div className="flex h-16 items-center justify-between px-4 bg-card border-b border-border flex-shrink-0">
                    <motion.div
                        animate={{ opacity: isOpen ? 1 : 0, scale: isOpen ? 1 : 0.8 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-2 overflow-hidden"
                    >
                        <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 3, repeat: Infinity, repeatDelay: 4 }}
                        >
                            <Zap size={20} className="text-primary flex-shrink-0" />
                        </motion.div>
                        <span className="text-xl font-bold gradient-text whitespace-nowrap">FleetFlow</span>
                    </motion.div>

                    {isMobile ? (
                        <motion.button whileTap={{ scale: 0.85 }} whileHover={{ rotate: 90 }}
                            transition={{ duration: 0.2 }}
                            onClick={closeMobile}
                            className="text-text-secondary hover:text-text-primary transition-colors p-1.5 rounded-lg hover:bg-background outline-none flex-shrink-0 ml-auto">
                            <X size={20} />
                        </motion.button>
                    ) : (
                        <motion.button
                            animate={{ x: isOpen ? 0 : -168 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 35 }}
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={toggleSidebar}
                            className="hidden md:flex rounded-xl p-1.5 text-text-secondary hover:bg-background hover:text-primary transition-colors outline-none z-10 flex-shrink-0"
                        >
                            {isOpen ? <ChevronLeft size={19} /> : <ChevronRight size={19} />}
                        </motion.button>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-0.5 px-2.5 py-4 overflow-y-auto custom-scrollbar">
                    <motion.div variants={navVariants} initial="hidden" animate="visible" className="space-y-0.5">
                        {filteredMenuItems.map((item) => {
                            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                            return (
                                <motion.div key={item.name} variants={navItemVariants} className="relative">
                                    <NavTooltip label={item.name} show={showTooltip}>
                                        <NavLink
                                            to={item.path}
                                            onClick={isMobile ? closeMobile : undefined}
                                            className={() => `
                                                flex items-center rounded-xl transition-colors duration-150 group relative overflow-hidden outline-none
                                                ${isActive ? 'text-white' : 'text-text-secondary hover:text-text-primary'}
                                                ${!isOpen ? 'w-[52px] h-[52px] justify-center ml-[14px]' : 'w-full px-3 py-2.5'}
                                            `}
                                        >
                                            {/* Active background */}
                                            {isActive && (
                                                <motion.div
                                                    layoutId="sidebar-active-bg"
                                                    className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 rounded-xl shadow-lg shadow-primary/30"
                                                    transition={{ type: 'spring', stiffness: 380, damping: 35 }}
                                                />
                                            )}

                                            {/* Hover background */}
                                            {!isActive && (
                                                <motion.div
                                                    className="absolute inset-0 rounded-xl bg-background opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                                                />
                                            )}

                                            <motion.div
                                                whileHover={{ scale: 1.15, rotate: isActive ? 0 : 6 }}
                                                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                                                className="relative z-10 flex items-center justify-center flex-shrink-0"
                                            >
                                                <item.icon size={22} />
                                            </motion.div>

                                            <AnimatePresence>
                                                {isOpen && (
                                                    <motion.span
                                                        initial={{ opacity: 0, x: -10, width: 0 }}
                                                        animate={{ opacity: 1, x: 0, width: 'auto' }}
                                                        exit={{ opacity: 0, x: -10, width: 0 }}
                                                        transition={{ duration: 0.18 }}
                                                        className="ml-3 text-sm font-semibold relative z-10 whitespace-nowrap overflow-hidden"
                                                    >
                                                        {item.name}
                                                    </motion.span>
                                                )}
                                            </AnimatePresence>

                                            {/* Active dot indicator in collapsed mode */}
                                            {isActive && !isOpen && (
                                                <motion.div
                                                    layoutId="active-dot"
                                                    className="absolute right-1.5 w-1.5 h-1.5 rounded-full bg-white shadow-sm"
                                                />
                                            )}
                                        </NavLink>
                                    </NavTooltip>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </nav>

                {/* Footer Controls */}
                <div className="p-3 space-y-1.5 border-t border-border flex-shrink-0">
                    <ThemeToggle collapse={!isOpen} />

                    {/* User Profile */}
                    <NavTooltip label={user?.name || 'Profile'} show={showTooltip}>
                        <motion.button
                            whileHover={isOpen ? { x: 2 } : { scale: 1.06 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => { navigate('/profile'); if (isMobile) closeMobile?.(); }}
                            className={`flex items-center text-left rounded-xl transition-colors group hover:bg-background outline-none w-full animated-border ${!isOpen ? 'justify-center h-[48px] px-0' : 'px-2 py-2'}`}
                        >
                            <motion.div
                                whileHover={{ scale: 1.08 }}
                                transition={{ duration: 0.2 }}
                                className="h-9 w-9 min-w-[36px] rounded-xl overflow-hidden border-2 border-primary/30 flex items-center justify-center flex-shrink-0 group-hover:border-primary transition-colors shadow-sm"
                            >
                                {user?.avatar_url ? (
                                    <img src={user.avatar_url} alt={user.name} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full bg-gradient-to-br from-primary/20 to-violet-500/20 flex items-center justify-center text-primary font-black text-sm">
                                        {(user?.name || 'A').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                    </div>
                                )}
                            </motion.div>
                            <AnimatePresence>
                                {isOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                                        transition={{ duration: 0.18 }}
                                        className="ml-3 overflow-hidden flex-1"
                                    >
                                        <p className="text-sm font-semibold truncate text-text-primary">{user?.name || 'Admin User'}</p>
                                        <p className="text-[10px] text-text-secondary truncate uppercase tracking-widest font-bold">{user?.role_name || user?.role || 'Administrator'}</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.button>
                    </NavTooltip>

                    {/* Logout */}
                    <NavTooltip label="Logout" show={showTooltip}>
                        <motion.button
                            whileHover={isOpen ? { x: 3 } : { scale: 1.06 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={logout}
                            className={`flex items-center rounded-xl text-text-secondary hover:bg-danger/10 hover:text-danger transition-colors outline-none w-full group ${!isOpen ? 'justify-center h-[48px] px-0' : 'px-3 py-2.5'}`}
                        >
                            <motion.div whileHover={{ rotate: 12 }} transition={{ duration: 0.2 }}>
                                <LogOut size={20} className="min-w-[20px]" />
                            </motion.div>
                            <AnimatePresence>
                                {isOpen && (
                                    <motion.span
                                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                                        transition={{ duration: 0.18 }}
                                        className="ml-3 text-sm font-semibold"
                                    >
                                        Logout
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </motion.button>
                    </NavTooltip>
                </div>
            </div>
        </motion.aside>
    );
};

export default Sidebar;
