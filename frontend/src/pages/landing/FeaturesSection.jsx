import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
    MapPin, Route, UserCheck, Fuel, Wrench, BrainCircuit,
    Bell, Cloud
} from 'lucide-react';

const features = [
    {
        icon: MapPin, color: 'text-primary', bg: 'bg-primary/10',
        title: 'Real-Time Vehicle Tracking',
        desc: 'Live GPS telemetry for every vehicle. Sub-second location updates with geofencing and custom alerts.',
        glowColor: 'rgba(59,130,246,0.15)',
    },
    {
        icon: Route, color: 'text-violet-400', bg: 'bg-violet-400/10',
        title: 'Route Optimization',
        desc: 'AI-powered routing that factors traffic, load weight, and delivery windows to cut fuel costs by up to 30%.',
        glowColor: 'rgba(167,139,250,0.15)',
    },
    {
        icon: UserCheck, color: 'text-success', bg: 'bg-success/10',
        title: 'Driver Behavior Monitoring',
        desc: 'Score drivers on speeding, harsh braking, and idling. Prevent incidents before they happen.',
        glowColor: 'rgba(16,185,129,0.15)',
    },
    {
        icon: Fuel, color: 'text-warning', bg: 'bg-warning/10',
        title: 'Fuel Consumption Analytics',
        desc: 'Track cost-per-km, detect fuel anomalies and theft, and generate monthly consumption reports.',
        glowColor: 'rgba(245,158,11,0.15)',
    },
    {
        icon: Wrench, color: 'text-danger', bg: 'bg-danger/10',
        title: 'Maintenance Prediction',
        desc: 'ML-based breakdown predictions. Auto-lock vehicles heading for maintenance to prevent illegal dispatch.',
        glowColor: 'rgba(239,68,68,0.15)',
    },
    {
        icon: BrainCircuit, color: 'text-cyan-400', bg: 'bg-cyan-400/10',
        title: 'AI Fleet Insights Dashboard',
        desc: 'Natural language queries, anomaly detection, and predictive analytics across your entire fleet.',
        glowColor: 'rgba(34,211,238,0.15)',
    },
    {
        icon: Bell, color: 'text-pink-400', bg: 'bg-pink-400/10',
        title: 'Live Alerts & Notifications',
        desc: 'Real-time WebSocket alerts for violations, delays, and maintenance events. Zero latency.',
        glowColor: 'rgba(244,114,182,0.15)',
    },
    {
        icon: Cloud, color: 'text-indigo-400', bg: 'bg-indigo-400/10',
        title: 'Cloud-Based Fleet Monitoring',
        desc: 'Fully cloud-native SaaS. Access from any device with 99.9% uptime SLA and auto-scaling.',
        glowColor: 'rgba(129,140,248,0.15)',
    },
];

const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
};

const TiltCard = ({ feature }) => {
    const Icon = feature.icon;
    const ref = useRef(null);
    const [tilt, setTilt] = useState({ x: 0, y: 0 });
    const [glowPos, setGlowPos] = useState({ x: 50, y: 50 });
    const [hovered, setHovered] = useState(false);

    const handleMouseMove = (e) => {
        const rect = ref.current.getBoundingClientRect();
        const px = ((e.clientX - rect.left) / rect.width) * 100;
        const py = ((e.clientY - rect.top) / rect.height) * 100;
        const x = ((e.clientY - rect.top) / rect.height - 0.5) * 14;
        const y = -((e.clientX - rect.left) / rect.width - 0.5) * 14;
        setTilt({ x, y });
        setGlowPos({ x: px, y: py });
    };
    const handleMouseLeave = () => { setTilt({ x: 0, y: 0 }); setHovered(false); };
    const handleMouseEnter = () => setHovered(true);

    return (
        <motion.div
            ref={ref}
            variants={cardVariants}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onMouseEnter={handleMouseEnter}
            style={{
                transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                transition: 'transform 0.15s ease',
            }}
            className="relative group bg-card border border-border rounded-2xl p-6 cursor-default overflow-hidden will-change-transform"
        >
            {/* Cursor-tracking glow inside card */}
            <div
                className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300"
                style={{
                    opacity: hovered ? 1 : 0,
                    background: `radial-gradient(circle 120px at ${glowPos.x}% ${glowPos.y}%, ${feature.glowColor}, transparent)`,
                }}
            />

            {/* Shine sweep on hover */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                    style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0) 40%, rgba(255,255,255,0.04) 50%, rgba(255,255,255,0) 60%)' }} />
            </div>

            {/* Animated border on hover */}
            <div className="absolute inset-0 rounded-2xl border border-transparent group-hover:border-primary/20 transition-colors duration-300 pointer-events-none" />

            <div className="relative z-10">
                <motion.div
                    whileHover={{ scale: 1.2, rotate: 8 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4`}
                >
                    <Icon size={22} className={feature.color} />
                </motion.div>
                <h3 className="font-extrabold text-text-primary text-base mb-2 group-hover:text-white transition-colors duration-200">{feature.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{feature.desc}</p>
            </div>
        </motion.div>
    );
};

const FeaturesSection = () => (
    <section id="features" className="py-20 lg:py-28 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-16"
            >
                <p className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-3">Platform Capabilities</p>
                <h2 className="text-3xl sm:text-4xl font-black text-text-primary mb-4">
                    Everything Your Fleet Needs
                </h2>
                <p className="text-text-secondary max-w-xl mx-auto text-sm leading-relaxed">
                    From live GPS tracking to AI-powered predictions — every tool built for real-world fleet operations.
                </p>
            </motion.div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5"
            >
                {features.map((f) => (
                    <TiltCard key={f.title} feature={f} />
                ))}
            </motion.div>
        </div>
    </section>
);

export default FeaturesSection;
