import React from 'react';
import { motion } from 'framer-motion';
import { Truck, Navigation, BarChart3, Zap } from 'lucide-react';

const steps = [
    {
        step: 1, icon: Truck, color: 'text-primary', bg: 'bg-primary', ring: 'ring-primary/30',
        glow: 'hover:shadow-primary/20 hover:border-primary/40',
        title: 'Register Your Fleet',
        desc: 'Add vehicles with capacity, fuel type, and registration details. Onboard drivers with license tracking and safety profiles.',
        stat: { v: '< 5 min', l: 'Setup Time' },
    },
    {
        step: 2, icon: Navigation, color: 'text-violet-400', bg: 'bg-violet-500', ring: 'ring-violet-500/30',
        glow: 'hover:shadow-violet-400/20 hover:border-violet-400/40',
        title: 'Track Vehicles Live',
        desc: 'Dispatch trips with one click. Real-time GPS, status updates, and geofencing alerts keep you in full control from anywhere.',
        stat: { v: '< 1s', l: 'Update Latency' },
    },
    {
        step: 3, icon: BarChart3, color: 'text-success', bg: 'bg-success', ring: 'ring-success/30',
        glow: 'hover:shadow-success/20 hover:border-success/40',
        title: 'Analyze Performance',
        desc: 'Auto-generated cost reports, driver safety scores, and fuel efficiency trends. See exactly where money is made or lost.',
        stat: { v: '1-click', l: 'PDF Export' },
    },
    {
        step: 4, icon: Zap, color: 'text-warning', bg: 'bg-warning', ring: 'ring-warning/30',
        glow: 'hover:shadow-warning/20 hover:border-warning/40',
        title: 'Optimize Operations',
        desc: 'AI recommends route changes, flags maintenance risks, and surfaces opportunities to cut operational costs by up to 42%.',
        stat: { v: '42%', l: 'Avg Cost Cut' },
    },
];

const HowItWorksSection = () => (
    <section id="how-it-works" className="py-20 lg:py-28 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-16"
            >
                <p className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-3">Step by Step</p>
                <h2 className="text-3xl sm:text-4xl font-black text-text-primary mb-4">
                    Up and Running in Minutes
                </h2>
                <p className="text-text-secondary max-w-lg mx-auto text-sm leading-relaxed">
                    FleetFlow is built for operations teams. No technical setup, no complex configurations.
                </p>
            </motion.div>

            <div className="relative">
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-violet-500 to-warning hidden sm:block" />

                <div className="space-y-8">
                    {steps.map((s, i) => {
                        const Icon = s.icon;
                        return (
                            <motion.div
                                key={s.step}
                                initial={{ opacity: 0, x: -40 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, amount: 0.5 }}
                                transition={{ duration: 0.55, delay: i * 0.1 }}
                                className="flex gap-6 relative group"
                            >
                                {/* Step bubble */}
                                <motion.div
                                    whileHover={{ scale: 1.15, rotate: 10 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                                    className={`relative h-16 w-16 min-w-[64px] rounded-2xl ${s.bg} flex items-center justify-center z-10 shadow-lg ring-4 ${s.ring} cursor-pointer`}
                                >
                                    <Icon size={26} className="text-white" />
                                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-background border border-border text-[10px] font-black text-text-primary flex items-center justify-center">
                                        {s.step}
                                    </span>
                                </motion.div>

                                {/* Content card */}
                                <motion.div
                                    whileHover={{ x: 6, boxShadow: '0 10px 40px -10px rgba(0,0,0,0.3)' }}
                                    transition={{ duration: 0.2 }}
                                    className={`flex-1 bg-card border border-border rounded-2xl px-6 py-5 transition-all duration-200 ${s.glow} shine-card`}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h3 className="font-extrabold text-text-primary text-lg mb-1">{s.title}</h3>
                                            <p className="text-sm text-text-secondary leading-relaxed">{s.desc}</p>
                                        </div>
                                        <div className="text-right flex-shrink-0 mt-1">
                                            <p className={`text-xl font-black ${s.color}`}>{s.stat.v}</p>
                                            <p className="text-[10px] text-text-secondary">{s.stat.l}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    </section>
);

export default HowItWorksSection;
