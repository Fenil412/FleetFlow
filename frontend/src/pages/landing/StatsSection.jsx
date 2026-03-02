import React, { useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef as useRefAlias, useState } from 'react';

const stats = [
    { value: 10000, suffix: '+', label: 'Vehicles Managed', color: 'text-primary', glow: 'hover:shadow-primary/20', border: 'hover:border-primary/40', icon: '🚛' },
    { value: 98.4, suffix: '%', decimals: 1, label: 'Platform Uptime', color: 'text-success', glow: 'hover:shadow-success/20', border: 'hover:border-success/40', icon: '⚡' },
    { value: 42, suffix: '%', label: 'Average Cost Reduction', color: 'text-violet-400', glow: 'hover:shadow-violet-400/20', border: 'hover:border-violet-400/40', icon: '📉' },
    { value: 5, suffix: 'ms', label: 'Real-Time Latency', color: 'text-cyan-400', glow: 'hover:shadow-cyan-400/20', border: 'hover:border-cyan-400/40', icon: '🔴' },
    { value: 500, suffix: '+', label: 'Enterprise Clients', color: 'text-warning', glow: 'hover:shadow-warning/20', border: 'hover:border-warning/40', icon: '🏢' },
    { value: 3.2, suffix: 'M', decimals: 1, label: 'Trips Completed', color: 'text-pink-400', glow: 'hover:shadow-pink-400/20', border: 'hover:border-pink-400/40', icon: '✅' },
];

const Counter = ({ value, suffix, decimals = 0, color }) => {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const inView = useInView(ref, { once: true });

    useEffect(() => {
        if (!inView) return;
        let start = 0;
        const duration = 1800;
        const step = 16;
        const increment = value / (duration / step);
        const timer = setInterval(() => {
            start += increment;
            if (start >= value) { setCount(value); clearInterval(timer); }
            else setCount(start);
        }, step);
        return () => clearInterval(timer);
    }, [inView, value]);

    const display = decimals > 0 ? count.toFixed(decimals) : Math.floor(count).toLocaleString();
    return (
        <span ref={ref} className={`text-4xl sm:text-5xl font-black ${color} transition-all duration-300`}>
            {display}{suffix}
        </span>
    );
};

const StatsSection = () => (
    <section className="py-16 bg-card border-y border-border relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: 'linear-gradient(rgb(var(--color-primary)) 1px, transparent 1px), linear-gradient(90deg, rgb(var(--color-primary)) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5 text-center">
                {stats.map((s, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.08, duration: 0.5 }}
                        whileHover={{ y: -6, scale: 1.04 }}
                        className={`group bg-background/60 border border-border rounded-2xl p-5 cursor-default transition-all duration-300 hover:shadow-xl ${s.glow} ${s.border} shine-card`}
                    >
                        <span className="text-2xl mb-2 block">{s.icon}</span>
                        <Counter value={s.value} suffix={s.suffix} decimals={s.decimals} color={s.color} />
                        <p className="text-sm text-text-secondary mt-2 font-medium leading-snug">{s.label}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    </section>
);

export default StatsSection;
