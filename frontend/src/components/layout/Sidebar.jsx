import React from 'react';
import {
    LayoutDashboard, Truck, Users, Navigation, Wrench,
    Fuel, BarChart3, ChevronLeft, ChevronRight, LogOut,
    X, History, Info, UserCircle2, Zap,
} from 'lucide-react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../features/auth/AuthContext';
import ThemeToggle from '../ui/ThemeToggle';

const navVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};
const navItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 28 } },
};

const Sidebar = ({ isOpen, toggleSidebar, isMobile, closeMobile }) => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/', roles: ['FLEET_MANAGER', 'DISPATCHER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST'] },
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

    return (
        <motion.aside
            animate={{ width: isMobile ? (isOpen ? 256 : 0) : isOpen ? 256 : 80, x: isMobile && !isOpen ? -256 : 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 35 }}
            className="fixed inset-y-0 left-0 z-50 bg-card text-text-primary border-r border-border overflow-hidden"
        >
            <div className="flex h-full flex-col w-64">
                {/* Header */}
                <div className="flex h-16 items-center justify-between px-6 bg-card border-b border-border flex-shrink-0">
                    <motion.div
                        animate={{ opacity: isOpen ? 1 : 0, scale: isOpen ? 1 : 0.8 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-2"
                    >
                        <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 3, repeat: Infinity, repeatDelay: 4 }}
                        >
                            <Zap size={20} className="text-primary" />
                        </motion.div>
                        <span className="text-xl font-bold gradient-text">FleetFlow</span>
                    </motion.div>

                    {isMobile ? (
                        <motion.button whileTap={{ scale: 0.85 }} onClick={closeMobile}
                            className="text-text-secondary hover:text-text-primary transition-colors">
                            <X size={20} />
                        </motion.button>
                    ) : (
                        <motion.button
                            whileHover={{ scale: 1.15, rotate: isOpen ? -15 : 15 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={toggleSidebar}
                            className="hidden md:flex rounded-lg p-1.5 text-text-secondary hover:bg-background hover:text-primary transition-colors outline-none"
                        >
                            {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                        </motion.button>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto custom-scrollbar">
                    <motion.div variants={navVariants} initial="hidden" animate="visible" className="space-y-1">
                        {filteredMenuItems.map((item) => {
                            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                            return (
                                <motion.div key={item.name} variants={navItemVariants} className="relative">
                                    <NavLink
                                        to={item.path}
                                        onClick={isMobile ? closeMobile : undefined}
                                        className={() => `
                                            flex items-center rounded-xl px-3 py-3 transition-colors duration-150 group relative overflow-hidden
                                            ${isActive ? 'text-white' : 'text-text-secondary hover:text-text-primary'}
                                        `}
                                    >
                                        {/* Active background with layoutId */}
                                        {isActive && (
                                            <motion.div
                                                layoutId="sidebar-active-bg"
                                                className="absolute inset-0 bg-primary rounded-xl shadow-lg shadow-primary/30"
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
                                            whileHover={{ scale: 1.2, rotate: 8 }}
                                            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                                            className="relative z-10 min-w-[22px]"
                                        >
                                            <item.icon size={22} />
                                        </motion.div>

                                        <AnimatePresence>
                                            {isOpen && (
                                                <motion.span
                                                    initial={{ opacity: 0, x: -10, width: 0 }}
                                                    animate={{ opacity: 1, x: 0, width: 'auto' }}
                                                    exit={{ opacity: 0, x: -10, width: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="ml-4 text-sm font-semibold relative z-10 whitespace-nowrap overflow-hidden"
                                                >
                                                    {item.name}
                                                </motion.span>
                                            )}
                                        </AnimatePresence>
                                    </NavLink>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </nav>

                {/* Footer Controls */}
                <div className="p-4 space-y-3 border-t border-border flex-shrink-0">
                    <div className="px-1">
                        <ThemeToggle collapse={!isOpen} />
                    </div>

                    {/* User Profile */}
                    <motion.button
                        whileHover={{ scale: 1.02, x: 2 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => { navigate('/profile'); if (isMobile) closeMobile?.(); }}
                        className={`flex items-center w-full text-left rounded-xl px-2 py-2 hover:bg-background transition-colors group animated-border ${!isOpen && 'justify-center'}`}
                    >
                        <motion.div
                            whileHover={{ rotate: [0, -5, 5, 0] }}
                            transition={{ duration: 0.4 }}
                            className="h-10 w-10 min-w-[40px] rounded-full overflow-hidden border-2 border-primary/30 flex items-center justify-center flex-shrink-0 group-hover:border-primary transition-colors"
                        >
                            {user?.avatar_url ? (
                                <img src={user.avatar_url} alt={user.name} className="h-full w-full object-cover" />
                            ) : (
                                <div className="h-full w-full bg-primary/10 flex items-center justify-center text-primary font-black text-sm">
                                    {(user?.name || 'A').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                </div>
                            )}
                        </motion.div>
                        <AnimatePresence>
                            {isOpen && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="ml-3 overflow-hidden"
                                >
                                    <p className="text-sm font-semibold truncate text-text-primary">{user?.name || 'Admin User'}</p>
                                    <p className="text-xs text-text-secondary truncate uppercase tracking-widest">{user?.role_name || user?.role || 'Administrator'}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.button>

                    {/* Logout */}
                    <motion.button
                        whileHover={{ x: 4, color: '#ef4444' }}
                        whileTap={{ scale: 0.95 }}
                        onClick={logout}
                        className={`flex w-full items-center rounded-xl px-3 py-3 text-text-secondary hover:bg-red-500/10 hover:text-red-500 transition-colors outline-none ${!isOpen && 'justify-center'}`}
                    >
                        <motion.div whileHover={{ rotate: 15 }} transition={{ duration: 0.2 }}>
                            <LogOut size={22} className="min-w-[22px]" />
                        </motion.div>
                        <AnimatePresence>
                            {isOpen && (
                                <motion.span
                                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="ml-4 text-sm font-medium"
                                >
                                    Logout
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </motion.button>
                </div>
            </div>
        </motion.aside>
    );
};

export default Sidebar;
