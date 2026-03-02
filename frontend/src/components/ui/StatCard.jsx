import React, { useRef, useState, useEffect } from 'react';
import { motion, useInView, useMotionValue, useSpring, useTransform } from 'framer-motion';

/**
 * AnimatedCount — smooth animated number counter
 */
const AnimatedCount = ({ value, prefix = '', suffix = '' }) => {
    const [display, setDisplay] = useState(0);
    useEffect(() => {
        const n = parseFloat(String(value).replace(/[^0-9.]/g, '')) || 0;
        let start = 0;
        const step = n / 40;
        const timer = setInterval(() => {
            start += step;
            if (start >= n) { setDisplay(n); clearInterval(timer); }
            else setDisplay(Math.floor(start));
        }, 20);
        return () => clearInterval(timer);
    }, [value]);

    const isRupee = typeof value === 'string' && value.includes('₹');
    return <>{prefix}{isRupee ? `₹${display.toLocaleString('en-IN')}` : display}{suffix}</>;
};

/**
 * StatCard — 3D perspective tilt KPI card with animated counter
 *
 * Usage:
 *   <StatCard title="Total Vehicles" value={32} sub="8 available" icon={Truck} iconColor="text-primary" iconBg="bg-primary/10" />
 */
const StatCard = ({ title, value, sub, icon: Icon, iconColor = 'text-primary', iconBg = 'bg-primary/10', delay = 0 }) => {
    const ref = useRef(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 300, damping: 30 });
    const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 300, damping: 30 });

    const handleMouse = (e) => {
        const rect = ref.current.getBoundingClientRect();
        x.set((e.clientX - rect.left) / rect.width - 0.5);
        y.set((e.clientY - rect.top) / rect.height - 0.5);
    };
    const handleLeave = () => { x.set(0); y.set(0); };
    const isInView = useInView(ref, { once: true, margin: '-40px' });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ rotateX, rotateY, transformStyle: 'preserve-3d', perspective: 800 }}
            onMouseMove={handleMouse}
            onMouseLeave={handleLeave}
            whileHover={{ z: 20 }}
            className="card p-5 hover:shadow-xl hover:border-primary/30 shine-card cursor-default"
        >
            <div className="flex items-start justify-between" style={{ transform: 'translateZ(20px)' }}>
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-black uppercase tracking-[0.15em] text-text-secondary mb-1">{title}</p>
                    <h3 className="text-2xl font-extrabold text-text-primary">
                        <AnimatedCount value={value} />
                    </h3>
                    {sub && <p className="text-sm text-text-secondary font-medium mt-1">{sub}</p>}
                </div>
                {Icon && (
                    <motion.div
                        whileHover={{ rotate: 20, scale: 1.2 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                        className={`h-11 w-11 min-w-[44px] rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}
                        style={{ transform: 'translateZ(30px)' }}
                    >
                        <Icon className={iconColor} size={20} />
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};

export default StatCard;
