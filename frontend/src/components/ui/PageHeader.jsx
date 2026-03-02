import React from 'react';
import { motion } from 'framer-motion';

/**
 * PageHeader — reusable animated page header with icon, title, subtitle, right-side actions
 * Usage:
 *   <PageHeader icon={Truck} title="Vehicle Registry" subtitle="Manage fleet assets" animate>
 *     <button className="btn-primary">Add Vehicle</button>
 *   </PageHeader>
 */
const PageHeader = ({
    icon: Icon,
    title,
    subtitle,
    children,         // right-side action slot
    animate = true,
    iconClassName = 'text-primary',
    iconSpin = false,
}) => (
    <motion.div
        initial={animate ? { opacity: 0, y: -20 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
    >
        <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2.5">
                {Icon && (
                    <motion.div
                        animate={iconSpin ? { rotate: [0, 360] } : undefined}
                        transition={iconSpin ? { duration: 10, repeat: Infinity, ease: 'linear' } : undefined}
                        className={`flex-shrink-0 ${iconClassName}`}
                    >
                        <Icon size={22} />
                    </motion.div>
                )}
                <h1 className="text-2xl font-bold gradient-text leading-none">{title}</h1>
            </div>
            {subtitle && (
                <p className="text-sm text-text-secondary font-medium uppercase tracking-wide mt-1 ml-0.5 sm:ml-8">
                    {subtitle}
                </p>
            )}
        </div>

        {children && (
            <div className="flex flex-wrap items-center gap-2 sm:flex-shrink-0">
                {children}
            </div>
        )}
    </motion.div>
);

export default PageHeader;
