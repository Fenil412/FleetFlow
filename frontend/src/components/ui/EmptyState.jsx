import React from 'react';
import { motion } from 'framer-motion';

/**
 * EmptyState — illustrated empty state with icon, title, message, optional CTA
 *
 * Usage:
 *   <EmptyState icon={<Truck size={48} />} title="No Vehicles" message="Add your first vehicle to get started." action={<button className="btn-primary">Add Vehicle</button>} />
 */
const EmptyState = ({ icon, title, message, action }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center justify-center py-20 px-6 text-center"
    >
        {icon && (
            <motion.div
                animate={{ y: [-4, 4, -4] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="text-text-secondary/25 mb-5"
            >
                {icon}
            </motion.div>
        )}
        <h3 className="text-base font-bold text-text-primary mb-2">{title}</h3>
        {message && <p className="text-sm text-text-secondary max-w-xs">{message}</p>}
        {action && <div className="mt-6">{action}</div>}
    </motion.div>
);

export default EmptyState;
