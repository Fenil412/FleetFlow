import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Truck, MapPin, Zap, Activity } from 'lucide-react';

/* ── Animated particle background ──────────────────────── */
const Particles = () => {
    const dots = Array.from({ length: 28 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        dur: Math.random() * 6 + 6,
        delay: Math.random() * 4,
    }));
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {dots.map(d => (
                <div
                    key={d.id}
                    className="absolute rounded-full bg-primary/30 animate-float"
                    style={{
                        left: `${d.x}%`, top: `${d.y}%`,
                        width: d.size, height: d.size,
                        animationDuration: `${d.dur}s`,
                        animationDelay: `${d.delay}s`,
                    }}
                />
            ))}
        </div>
    );
};

/* ── Animated Fleet SVG ─────────────────────────────────── */
const FleetViz = () => (
    <div className="relative w-full max-w-lg mx-auto">
        {/* Glow backdrop */}
        <div className="absolute inset-0 rounded-3xl bg-primary/10 blur-3xl" />

        <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut', delay: 0.4 }}
            className="relative glass-morphism rounded-3xl p-6 md:p-8 border border-primary/20"
        >
            {/* Map grid lines */}
            <svg viewBox="0 0 420 280" className="w-full rounded-2xl" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgb(var(--color-primary) / 0.08)" strokeWidth="0.5" />
                    </pattern>
                    <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="rgb(var(--color-primary))" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.8" />
                    </linearGradient>
                </defs>

                {/* Background */}
                <rect width="420" height="280" fill="rgb(var(--color-background) / 0.3)" rx="16" />
                <rect width="420" height="280" fill="url(#grid)" rx="16" />

                {/* Road lines */}
                <path d="M30 140 Q 110 100 200 140 Q 290 180 390 130" stroke="url(#routeGrad)" strokeWidth="2.5" fill="none" strokeDasharray="6 3" />
                <path d="M60 200 Q 150 160 240 190 Q 320 210 380 180" stroke="rgb(var(--color-primary) / 0.3)" strokeWidth="1.5" fill="none" strokeDasharray="4 5" />

                {/* Pulse circles at waypoints */}
                {[
                    { cx: 110, cy: 115, delay: 0 },
                    { cx: 200, cy: 140, delay: 0.6 },
                    { cx: 290, cy: 165, delay: 1.2 },
                ].map((pt, i) => (
                    <g key={i}>
                        <circle cx={pt.cx} cy={pt.cy} r="5" fill="rgb(var(--color-primary))" opacity="0.9" />
                        <circle cx={pt.cx} cy={pt.cy} r="5" fill="rgb(var(--color-primary))" opacity="0.4">
                            <animate attributeName="r" values="5;14;5" dur={`${2 + pt.delay}s`} begin={`${pt.delay}s`} repeatCount="indefinite" />
                            <animate attributeName="opacity" values="0.4;0;0.4" dur={`${2 + pt.delay}s`} begin={`${pt.delay}s`} repeatCount="indefinite" />
                        </circle>
                        <circle cx={pt.cx} cy={pt.cy} r="1.5" fill="white" />
                    </g>
                ))}

                {/* Moving truck icon path */}
                <g>
                    <animateMotion dur="5s" repeatCount="indefinite" path="M30 140 Q 110 100 200 140 Q 290 180 390 130">
                        <mpath />
                    </animateMotion>
                    <rect x="-12" y="-8" width="24" height="14" rx="3" fill="rgb(var(--color-primary))" />
                    <rect x="-7" y="-13" width="14" height="8" rx="2" fill="rgb(var(--color-primary) / 0.7)" />
                    <circle cx="-7" cy="6" r="4" fill="rgb(var(--color-card))" stroke="rgb(var(--color-primary))" strokeWidth="1.5" />
                    <circle cx="7" cy="6" r="4" fill="rgb(var(--color-card))" stroke="rgb(var(--color-primary))" strokeWidth="1.5" />
                </g>

                {/* Stats overlay cards */}
                <g>
                    <rect x="10" y="220" width="100" height="48" rx="10" fill="rgb(var(--color-card) / 0.9)" />
                    <text x="20" y="239" fontSize="9" fill="rgb(var(--color-text-secondary))" fontFamily="Inter">ACTIVE VEHICLES</text>
                    <text x="20" y="256" fontSize="16" fontWeight="bold" fill="rgb(var(--color-primary))" fontFamily="Inter">24</text>
                    <circle cx="90" cy="244" r="5" fill="#10b981" />
                    <circle cx="90" cy="244" r="5" fill="#10b981" opacity="0.4">
                        <animate attributeName="r" values="5;10;5" dur="2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite" />
                    </circle>
                </g>

                <g>
                    <rect x="310" y="220" width="100" height="48" rx="10" fill="rgb(var(--color-card) / 0.9)" />
                    <text x="320" y="239" fontSize="9" fill="rgb(var(--color-text-secondary))" fontFamily="Inter">TRIPS TODAY</text>
                    <text x="320" y="256" fontSize="16" fontWeight="bold" fill="#8b5cf6" fontFamily="Inter">142</text>
                </g>

                <g>
                    <rect x="162" y="8" width="96" height="40" rx="10" fill="rgb(var(--color-card) / 0.9)" />
                    <text x="172" y="23" fontSize="8" fill="rgb(var(--color-text-secondary))" fontFamily="Inter">AI EFFICIENCY</text>
                    <text x="172" y="38" fontSize="14" fontWeight="bold" fill="#06b6d4" fontFamily="Inter">98.4%</text>
                </g>
            </svg>
        </motion.div>

        {/* Floating badges */}
        <motion.div
            animate={{ y: [-6, 6, -6] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-4 -right-4 glass-morphism rounded-2xl px-3 py-2 flex items-center gap-2 shadow-xl border border-primary/20"
        >
            <Activity size={14} className="text-success" />
            <span className="text-xs font-bold text-text-primary">Live Tracking</span>
        </motion.div>

        <motion.div
            animate={{ y: [6, -6, 6] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute -bottom-4 -left-4 glass-morphism rounded-2xl px-3 py-2 flex items-center gap-2 shadow-xl border border-primary/20"
        >
            <Zap size={14} className="text-primary" />
            <span className="text-xs font-bold text-text-primary">AI Optimized</span>
        </motion.div>
    </div>
);

/* ── Stats Row ──────────────────────────────────────────── */
const stats = [
    { value: '10K+', label: 'Vehicles Managed' },
    { value: '98.4%', label: 'Uptime SLA' },
    { value: '42%', label: 'Cost Reduction' },
    { value: '5ms', label: 'Real-Time Latency' },
];

const HeroSection = () => {
    const navigate = useNavigate();

    const scrollToFeatures = () => {
        document.querySelector('#features')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <section id="hero" className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-16">
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-navy via-background to-primary/5" />
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/8 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet-500/6 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none" />

            <Particles />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    {/* Left — Copy */}
                    <div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-6"
                        >
                            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                            Cloud-Native Fleet Intelligence
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="text-4xl sm:text-5xl lg:text-6xl font-black text-text-primary leading-[1.1] tracking-tight mb-6"
                        >
                            Smart Fleet
                            <br />
                            <span className="gradient-text">Management</span>
                            <br />
                            Powered by{' '}
                            <span className="gradient-text">Intelligence</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-base md:text-lg text-text-secondary leading-relaxed mb-10 max-w-xl"
                        >
                            FleetFlow unifies real-time vehicle tracking, AI-driven route optimization, predictive
                            maintenance, and enterprise compliance in one cloud-native platform — giving you
                            complete operational intelligence at every mile.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="flex flex-col sm:flex-row gap-4"
                        >
                            <motion.button
                                whileHover={{ scale: 1.04, boxShadow: '0 0 30px rgb(var(--color-primary) / 0.4)' }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => navigate('/signup')}
                                className="group flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white font-bold rounded-xl shadow-xl shadow-primary/30 hover:bg-primary/90 transition-all"
                            >
                                Get Started Free
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={scrollToFeatures}
                                className="flex items-center justify-center gap-2 px-8 py-4 border border-border text-text-primary font-semibold rounded-xl hover:bg-card/80 backdrop-blur-sm transition-all"
                            >
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Play size={12} className="text-primary ml-0.5" />
                                </div>
                                Explore Features
                            </motion.button>
                        </motion.div>

                        {/* Stats */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.5 }}
                            className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12 pt-10 border-t border-border"
                        >
                            {stats.map((s, i) => (
                                <div key={i}>
                                    <p className="text-2xl font-black gradient-text">{s.value}</p>
                                    <p className="text-xs text-text-secondary mt-1">{s.label}</p>
                                </div>
                            ))}
                        </motion.div>
                    </div>

                    {/* Right — Fleet Viz */}
                    <motion.div
                        initial={{ opacity: 0, x: 60 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="lg:flex justify-center hidden"
                    >
                        <FleetViz />
                    </motion.div>
                </div>

                {/* Mobile fleet viz */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="lg:hidden mt-12"
                >
                    <FleetViz />
                </motion.div>
            </div>

            {/* Scroll cue */}
            <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-text-secondary"
            >
                <div className="w-px h-8 bg-gradient-to-b from-transparent to-border" />
                <span className="text-[10px] uppercase tracking-widest">Scroll</span>
            </motion.div>
        </section>
    );
};

export default HeroSection;
