import React, { useState } from 'react';
import {
    LayoutDashboard,
    Truck,
    Users,
    Navigation,
    Wrench,
    Fuel,
    BarChart3,
    Settings,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Menu,
    X
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import ThemeToggle from '../ui/ThemeToggle';

const Sidebar = ({ isOpen, toggleSidebar, isMobile, closeMobile }) => {
    const { logout, user } = useAuth();

    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
        { name: 'Vehicles', icon: Truck, path: '/vehicles' },
        { name: 'Drivers', icon: Users, path: '/drivers' },
        { name: 'Trips', icon: Navigation, path: '/trips' },
        { name: 'Maintenance', icon: Wrench, path: '/maintenance' },
        { name: 'Fuel Logs', icon: Fuel, path: '/fuel' },
        { name: 'Analytics', icon: BarChart3, path: '/analytics' },
    ];

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
                    {menuItems.map((item) => (
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

                    {/* User Profile */}
                    <div className={`flex items-center px-2 ${!isOpen && 'justify-center border-b border-border pb-4'}`}>
                        <div className="h-10 w-10 min-w-[40px] rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">
                            {user?.name?.charAt(0) || 'A'}
                        </div>
                        {isOpen && (
                            <div className="ml-3 overflow-hidden">
                                <p className="text-sm font-semibold truncate text-text-primary">{user?.name || 'Admin User'}</p>
                                <p className="text-xs text-text-secondary truncate uppercase tracking-widest">{user?.role_name || user?.role || 'Administrator'}</p>
                            </div>
                        )}
                    </div>

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
