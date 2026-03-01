import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const pageVariants = {
    initial: { opacity: 0, y: 16, scale: 0.99 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } },
    exit: { opacity: 0, y: -8, scale: 0.98, transition: { duration: 0.2 } },
};

const DashboardLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const location = useLocation();

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
            <motion.div
                initial={{ y: -60 }} animate={{ y: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="flex h-16 items-center justify-between border-b border-border bg-card px-4 md:hidden sticky top-0 z-40 shadow-sm"
            >
                <span className="text-xl font-bold gradient-text">FleetFlow</span>
                <motion.button
                    whileTap={{ scale: 0.9 }} whileHover={{ rotate: 90 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => setSidebarOpen(true)}
                    className="rounded-lg p-2 text-text-secondary hover:bg-background transition-colors outline-none"
                >
                    <Menu size={24} />
                </motion.button>
            </motion.div>

            <Sidebar
                isOpen={sidebarOpen}
                toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                isMobile={isMobile}
                closeMobile={() => setSidebarOpen(false)}
            />

            <motion.main
                animate={{ paddingLeft: isMobile ? 0 : sidebarOpen ? 256 : 80 }}
                transition={{ type: 'spring', stiffness: 300, damping: 35 }}
                className="min-h-screen"
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        variants={pageVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="p-4 md:p-8 max-w-[1600px] mx-auto"
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </motion.main>

            {/* Mobile Overlay */}
            <AnimatePresence>
                {isMobile && sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="fixed inset-0 z-40 bg-navy/60 backdrop-blur-sm"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default DashboardLayout;
