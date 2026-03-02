import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
    {
        name: 'Rajesh Kumar',
        role: 'Fleet Director, Mahindra Logistics',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&q=80',
        text: 'FleetFlow cut our operational costs by 38% in just 3 months. The AI maintenance predictions alone saved us ₹12 lakh in unexpected breakdowns.',
        stars: 5,
        tag: '38% Cost Reduction',
        borderHover: 'hover:border-primary/50',
        tagColor: 'bg-primary/10 text-primary',
        glow: 'hover:shadow-primary/10',
    },
    {
        name: 'Priya Sharma',
        role: 'Head of Operations, BlueDart Express',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b82c4a52?w=100&h=100&fit=crop&q=80',
        text: 'The real-time tracking and driver behavior monitoring transformed our safety record. Driver incidents dropped by 67% within the first quarter.',
        stars: 5,
        tag: '67% Fewer Incidents',
        borderHover: 'hover:border-success/50',
        tagColor: 'bg-success/10 text-success',
        glow: 'hover:shadow-success/10',
    },
    {
        name: 'Vikram Mehta',
        role: 'CTO, TCI Freight',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&q=80',
        text: 'We manage 2,400 vehicles across 18 states with FleetFlow. The cloud-native architecture handles our peak load perfectly. Zero downtime in 18 months.',
        stars: 5,
        tag: '2,400 Vehicles',
        borderHover: 'hover:border-violet-400/50',
        tagColor: 'bg-violet-400/10 text-violet-400',
        glow: 'hover:shadow-violet-400/10',
    },
    {
        name: 'Ananya Patel',
        role: 'Safety Officer, GATI Logistics',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&q=80',
        text: 'License expiry tracking and compliance reports used to take my team 2 days every month. Now it takes minutes. FleetFlow is a game changer.',
        stars: 5,
        tag: '95% Time Saved',
        borderHover: 'hover:border-warning/50',
        tagColor: 'bg-warning/10 text-warning',
        glow: 'hover:shadow-warning/10',
    },
    {
        name: 'Suresh Krishnan',
        role: 'CFO, Revelant Transport',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&q=80',
        text: 'Fuel consumption analytics showed us we were overspending ₹8 lakh/month due to route inefficiencies. The system paid for itself in 6 weeks.',
        stars: 5,
        tag: '₹8L / Month Saved',
        borderHover: 'hover:border-cyan-400/50',
        tagColor: 'bg-cyan-400/10 text-cyan-400',
        glow: 'hover:shadow-cyan-400/10',
    },
    {
        name: 'Divya Nair',
        role: 'Fleet Manager, Amazon India',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&q=80',
        text: 'The AI delivery delay predictions gave us a 94% accuracy rate. Our customers now trust our ETAs completely. Customer satisfaction scores are up 28%.',
        stars: 5,
        tag: '94% ETA Accuracy',
        borderHover: 'hover:border-pink-400/50',
        tagColor: 'bg-pink-400/10 text-pink-400',
        glow: 'hover:shadow-pink-400/10',
    },
];

const TestimonialsSection = () => (
    <section className="py-20 lg:py-28 bg-background overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-16"
            >
                <p className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-3">Customer Stories</p>
                <h2 className="text-3xl sm:text-4xl font-black text-text-primary mb-4">
                    Trusted by India's Leading Fleets
                </h2>
                <p className="text-text-secondary max-w-xl mx-auto text-sm leading-relaxed">
                    From 50-vehicle startups to enterprise fleets with thousands of vehicles — FleetFlow delivers measurable results.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {testimonials.map((t, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ delay: i * 0.08, duration: 0.55 }}
                        whileHover={{ y: -8, scale: 1.02 }}
                        className={`relative bg-card border border-border rounded-2xl p-6 flex flex-col gap-4 group transition-all duration-300 hover:shadow-2xl ${t.glow} ${t.borderHover} shine-card overflow-hidden`}
                    >
                        {/* Corner quote icon */}
                        <Quote size={40} className="text-border absolute top-4 right-4 opacity-20 group-hover:opacity-40 transition-opacity duration-300" />

                        {/* Subtle bg glow on hover */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/[0.02] group-hover:to-transparent transition-all duration-500 pointer-events-none rounded-2xl" />

                        <div className="flex gap-0.5">
                            {Array.from({ length: t.stars }).map((_, s) => (
                                <motion.span
                                    key={s}
                                    initial={{ opacity: 0, scale: 0 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.05 + s * 0.06 }}
                                >
                                    <Star size={13} className="text-warning fill-warning" />
                                </motion.span>
                            ))}
                        </div>

                        <p className="text-sm text-text-secondary leading-relaxed flex-1 relative z-10">"{t.text}"</p>

                        <span className={`inline-block text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-full w-fit ${t.tagColor}`}>
                            {t.tag}
                        </span>

                        <div className="flex items-center gap-3 pt-2 border-t border-border">
                            <motion.img
                                whileHover={{ scale: 1.12, rotate: -3 }}
                                src={t.avatar}
                                alt={t.name}
                                className="w-10 h-10 rounded-full object-cover border-2 border-border group-hover:border-primary/50 transition-colors duration-200"
                            />
                            <div>
                                <p className="text-sm font-bold text-text-primary">{t.name}</p>
                                <p className="text-xs text-text-secondary">{t.role}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    </section>
);

export default TestimonialsSection;
