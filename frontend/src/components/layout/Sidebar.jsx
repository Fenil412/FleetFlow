import React, { useState } from 'react';
import {
    LayoutDashboard,
    Truck,
    Users,
    Navigation,
    Wrench,
    Fuel,
    BarChart3,
    ChevronLeft,
    ChevronRight,
    LogOut,
    X,
    History,
    Info,
    UserCircle2,
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import ThemeToggle from '../ui/ThemeToggle';

const Sidebar = ({ isOpen, toggleSidebar, isMobile, closeMobile }) => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

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

    const sidebarClasses = `
    fixed inset-y-0 left-0 z-50 bg-card text-text-primary border-r border-border transition-all duration-300 ease-in-out
    ${isOpen ? 'w-64' : 'w-20'}
    ${isMobile ? (isOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
  `;

    return (
        <aside className={sidebarClasses}>
            <div className="flex h-full flex-col">
                {/* Header */}
                <div className="flex h-16 items-center justify-between px-6 bg-card border-b border-border">
                    <span className={`text-xl font-bold tracking-tight text-primary transition-opacity ${!isOpen && 'opacity-0 md:hidden'}`}>
                        FleetFlow
                    </span>
                    {isMobile ? (
                        <button onClick={closeMobile} className="text-text-secondary hover:text-text-primary">
                            <X size={20} />
                        </button>
                    ) : (
                        <button
                            onClick={toggleSidebar}
                            className="hidden md:flex rounded-lg p-1 text-text-secondary hover:bg-background hover:text-text-primary transition-colors outline-none"
                        >
                            {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                        </button>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-2 px-3 py-4 overflow-y-auto custom-scrollbar">
                    {filteredMenuItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            onClick={isMobile ? closeMobile : undefined}
                            className={({ isActive }) => `
                flex items-center rounded-xl px-3 py-3 transition-all duration-200 group
                ${isActive ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-text-secondary hover:bg-background hover:text-text-primary'}
              `}
                        >
                            <item.icon size={22} className={`min-w-[22px] transition-transform group-hover:scale-110`} />
                            <span className={`ml-4 text-sm font-medium transition-opacity ${!isOpen && 'opacity-0 md:hidden'}`}>
                                {item.name}
                            </span>
                        </NavLink>
                    ))}
                </nav>

                {/* Footer Controls */}
                <div className="p-4 space-y-4 border-t border-border">
                    {/* Theme Toggle */}
                    <div className="px-1">
                        <ThemeToggle collapse={!isOpen} />
                    </div>

                    {/* User Profile — clickable, goes to /profile */}
                    <button
                        onClick={() => { navigate('/profile'); if (isMobile) closeMobile?.(); }}
                        className={`flex items-center w-full text-left rounded-xl px-2 py-2 hover:bg-background transition-colors group ${!isOpen && 'justify-center'}`}
                    >
                        <div className="h-10 w-10 min-w-[40px] rounded-full overflow-hidden border-2 border-primary/30 flex items-center justify-center flex-shrink-0 group-hover:border-primary transition-colors">
                            {user?.avatar_url ? (
                                <img src={user.avatar_url} alt={user.name} className="h-full w-full object-cover" />
                            ) : (
                                <div className="h-full w-full bg-primary/10 flex items-center justify-center text-primary font-black text-sm">
                                    {(user?.name || 'A').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                </div>
                            )}
                        </div>
                        {isOpen && (
                            <div className="ml-3 overflow-hidden">
                                <p className="text-sm font-semibold truncate text-text-primary">{user?.name || 'Admin User'}</p>
                                <p className="text-xs text-text-secondary truncate uppercase tracking-widest">{user?.role_name || user?.role || 'Administrator'}</p>
                            </div>
                        )}
                    </button>

                    {/* Logout */}
                    <button
                        onClick={logout}
                        className={`
              flex w-full items-center rounded-xl px-3 py-3 text-text-secondary hover:bg-red-500/10 hover:text-red-500 transition-colors outline-none
              ${!isOpen && 'justify-center'}
            `}
                    >
                        <LogOut size={22} className="min-w-[22px]" />
                        <span className={`ml-4 text-sm font-medium ${!isOpen && 'opacity-0 md:hidden'}`}>Logout</span>
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
