import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';

const DashboardLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (mobile) setSidebarOpen(false);
            else setSidebarOpen(true);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="min-h-screen bg-background text-text-primary">
            {/* Mobile Top Nav */}
            <div className="flex h-16 items-center justify-between border-b border-border bg-card px-4 md:hidden sticky top-0 z-40">
                <span className="text-xl font-bold text-primary">FleetFlow</span>
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="rounded-lg p-2 text-text-secondary hover:bg-background transition-colors outline-none"
                >
                    <Menu size={24} />
                </button>
            </div>

            <Sidebar
                isOpen={sidebarOpen}
                toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                isMobile={isMobile}
                closeMobile={() => setSidebarOpen(false)}
            />

            <main className={`
        min-h-screen transition-all duration-300
        ${isMobile ? 'pt-0' : sidebarOpen ? 'pl-64' : 'pl-20'}
      `}>
                <div className="p-4 md:p-8 max-w-[1600px] mx-auto animate-fade-in">
                    {children}
                </div>
            </main>

            {/* Mobile Overlay */}
            {isMobile && sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-navy/60 backdrop-blur-sm transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
};

export default DashboardLayout;
