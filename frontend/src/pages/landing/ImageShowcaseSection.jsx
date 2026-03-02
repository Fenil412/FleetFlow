import React from 'react';
import { motion } from 'framer-motion';
import { Truck, BarChart2, Shield } from 'lucide-react';

const showcaseItems = [
    {
        icon: Truck,
        iconBg: 'bg-primary/10',
        iconColor: 'text-primary',
        tag: 'Live Tracking',
        title: 'Full Visibility. Every Mile.',
        desc: 'See every vehicle position, status, and cargo load in real time across a unified map interface. DriveGPT overlays AI route suggestions directly onto live routes.',
        image: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=800&h=500&fit=crop&q=80',
        imageAlt: 'Fleet trucks on highway',
        reverse: false,
        accent: 'from-primary/20 to-transparent',
    },
    {
        icon: BarChart2,
        iconBg: 'bg-violet-500/10',
        iconColor: 'text-violet-400',
        tag: 'Deep Analytics',
        title: 'Data That Drives Decisions.',
        desc: 'FleetFlow turns raw telemetry into actionable financial insights. Understand your cost-per-km, driver ROI, and fleet health score with one-click executive reports.',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=500&fit=crop&q=80',
        imageAlt: 'Analytics dashboard on screen',
        reverse: true,
        accent: 'from-violet-500/20 to-transparent',
    },
    {
        icon: Shield,
        iconBg: 'bg-success/10',
        iconColor: 'text-success',
        tag: 'Safety & Compliance',
        title: 'Zero-Gap Compliance Engine.',
        desc: 'Automatically block expired licenses, track service dues, and generate audit-ready compliance reports. Keep your entire fleet legally compliant with zero manual checks.',
        image: 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&h=500&fit=crop&q=80',
        imageAlt: 'Warehouse logistics operations',
        reverse: false,
        accent: 'from-success/20 to-transparent',
    },
];

const ImageShowcaseSection = () => (
    <section className="py-16 lg:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
            {showcaseItems.map((item, i) => {
                const Icon = item.icon;
                return (
                    <div
                        key={i}
                        className={`grid lg:grid-cols-2 gap-12 items-center ${item.reverse ? 'lg:flex lg:flex-row-reverse' : ''}`}
                    >
                        {/* Text */}
                        <motion.div
                            initial={{ opacity: 0, x: item.reverse ? 50 : -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, amount: 0.4 }}
                            transition={{ duration: 0.65 }}
                        >
                            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border ${item.iconBg} text-xs font-black uppercase tracking-widest mb-5 ${item.iconColor}`}>
                                <Icon size={12} />
                                {item.tag}
                            </div>
                            <h3 className="text-2xl sm:text-3xl font-black text-text-primary mb-4 leading-tight">
                                {item.title}
                            </h3>
                            <p className="text-text-secondary leading-relaxed text-base max-w-lg">
                                {item.desc}
                            </p>

                            <div className="flex gap-6 mt-8">
                                {[
                                    { v: i === 0 ? '< 1s' : i === 1 ? '360°' : '100%', l: i === 0 ? 'Update Rate' : i === 1 ? 'Fleet Visibility' : 'Compliance' },
                                    { v: i === 0 ? '24/7' : i === 1 ? '1-click' : 'Zero', l: i === 0 ? 'Monitoring' : i === 1 ? 'PDF Reports' : 'Manual Checks' },
                                ].map((s, j) => (
                                    <div key={j}>
                                        <p className={`text-2xl font-black ${item.iconColor}`}>{s.v}</p>
                                        <p className="text-sm text-text-secondary mt-1">{s.l}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Image */}
                        <motion.div
                            initial={{ opacity: 0, x: item.reverse ? -50 : 50, scale: 0.95 }}
                            whileInView={{ opacity: 1, x: 0, scale: 1 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ duration: 0.7, delay: 0.1 }}
                            className="relative group"
                        >
                            {/* Glow */}
                            <div className={`absolute -inset-4 bg-gradient-to-br ${item.accent} rounded-3xl blur-2xl opacity-60 group-hover:opacity-100 transition-opacity pointer-events-none`} />

                            <div className="relative rounded-2xl overflow-hidden border border-border shadow-2xl shadow-black/30">
                                <img
                                    src={item.image}
                                    alt={item.imageAlt}
                                    className="w-full h-64 lg:h-80 object-cover group-hover:scale-105 transition-transform duration-700"
                                    loading="lazy"
                                />
                                {/* Overlay gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

                                {/* Floating badge */}
                                <motion.div
                                    animate={{ y: [-4, 4, -4] }}
                                    transition={{ duration: 3.5, repeat: Infinity }}
                                    className="absolute bottom-4 left-4 glass-morphism rounded-xl px-3 py-2 flex items-center gap-2 shadow-xl"
                                >
                                    <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                                    <span className="text-xs font-bold text-white">{item.tag} Active</span>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                );
            })}
        </div>
    </section>
);

export default ImageShowcaseSection;
