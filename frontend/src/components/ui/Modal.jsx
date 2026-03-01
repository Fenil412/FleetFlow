import React, { useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Modal = ({ isOpen, onClose, title, children }) => {
    useEffect(() => {
        const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
        document.body.style.overflow = isOpen ? 'hidden' : 'unset';
        window.addEventListener('keydown', handleEsc);
        return () => { window.removeEventListener('keydown', handleEsc); document.body.style.overflow = 'unset'; };
    }, [isOpen, onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Blur Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-navy/70 backdrop-blur-md"
                    />

                    {/* Modal Panel */}
                    <motion.div
                        initial={{ scale: 0.85, opacity: 0, y: 32, rotateX: 8 }}
                        animate={{ scale: 1, opacity: 1, y: 0, rotateX: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: 'spring', stiffness: 340, damping: 28 }}
                        style={{ perspective: 1000, transformStyle: 'preserve-3d' }}
                        className="relative w-full max-w-lg rounded-3xl bg-card shadow-2xl border border-border overflow-hidden"
                    >
                        {/* Animated gradient top bar */}
                        <div className="h-1 w-full bg-gradient-to-r from-primary via-purple-500 to-cyan-400 animate-shimmer bg-[length:200%_100%]" />

                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-border px-8 py-5">
                            <div className="flex items-center gap-3">
                                <motion.div
                                    animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
                                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                                >
                                    <Sparkles size={18} className="text-primary" />
                                </motion.div>
                                <h3 className="text-xl font-bold text-text-primary">{title}</h3>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.15, rotate: 90, backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444' }}
                                whileTap={{ scale: 0.9 }}
                                transition={{ duration: 0.2 }}
                                onClick={onClose}
                                className="rounded-xl p-2 text-text-secondary transition-all"
                            >
                                <X size={20} />
                            </motion.button>
                        </div>

                        {/* Body */}
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15, duration: 0.3 }}
                            className="p-8"
                        >
                            {children}
                        </motion.div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default Modal;
