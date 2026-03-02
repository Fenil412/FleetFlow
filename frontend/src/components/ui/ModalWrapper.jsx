import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

/**
 * ModalWrapper — AnimatePresence modal with backdrop blur, scale-in animation, close button
 *
 * Usage:
 *   <ModalWrapper isOpen={showModal} onClose={() => setShowModal(false)} title="Edit Vehicle" maxWidth="max-w-lg">
 *     {children}
 *   </ModalWrapper>
 */
const ModalWrapper = ({
    isOpen,
    onClose,
    title,
    subtitle,
    children,
    maxWidth = 'max-w-lg',
    footer,
}) => (
    <AnimatePresence>
        {isOpen && (
            <>
                {/* Backdrop */}
                <motion.div
                    key="backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-50 bg-navy/60 backdrop-blur-sm"
                    onClick={onClose}
                />

                {/* Modal panel */}
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                    <motion.div
                        key="modal"
                        initial={{ opacity: 0, scale: 0.92, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.94, y: 10 }}
                        transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className={`bg-card border border-border w-full ${maxWidth} rounded-3xl shadow-2xl pointer-events-auto overflow-hidden`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between p-6 pb-0">
                            <div>
                                <h3 className="text-xl font-bold text-text-primary">{title}</h3>
                                {subtitle && <p className="text-sm text-text-secondary mt-0.5">{subtitle}</p>}
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.1, rotate: 90 }}
                                whileTap={{ scale: 0.9 }}
                                transition={{ duration: 0.2 }}
                                onClick={onClose}
                                className="p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-background transition-colors outline-none flex-shrink-0 ml-4"
                            >
                                <X size={18} />
                            </motion.button>
                        </div>

                        {/* Body */}
                        <div className="p-6">{children}</div>

                        {/* Optional footer */}
                        {footer && (
                            <div className="px-6 pb-6 pt-0 border-t border-border mt-2 pt-4">
                                {footer}
                            </div>
                        )}
                    </motion.div>
                </div>
            </>
        )}
    </AnimatePresence>
);

export default ModalWrapper;
