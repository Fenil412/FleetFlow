import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const plans = [
    {
        name: 'Starter',
        price: '₹4,999',
        period: '/month',
        desc: 'For small fleets getting started with digital management.',
        accentColor: 'border-border',
        hoverBorder: 'hover:border-primary/40',
        hoverShadow: 'hover:shadow-primary/10',
        features: ['Up to 25 vehicles', 'Real-time GPS tracking', 'Basic trip management', 'Driver profiles & safety scores', 'Standard reports', 'Email support'],
        badge: null,
        ctaStyle: 'border border-primary text-primary hover:bg-primary/10',
        route: '/signup',
    },
    {
        name: 'Professional',
        price: '₹14,999',
        period: '/month',
        desc: 'The complete fleet intelligence platform for growing operations.',
        accentColor: 'border-primary',
        hoverBorder: 'hover:border-primary',
        hoverShadow: 'hover:shadow-primary/25',
        badge: 'Most Popular',
        badgeStyle: 'bg-primary text-white',
        features: ['Up to 200 vehicles', 'AI-powered route optimization', 'Predictive maintenance alerts', 'Fuel analytics & anomaly detection', 'Driver behavior AI scoring', 'Custom dashboards & exports', 'WebSocket live alerts', 'Priority support'],
        ctaStyle: 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/30',
        route: '/signup',
    },
    {
        name: 'Enterprise',
        price: 'Custom',
        period: '',
        desc: 'Tailored for large logistics networks with custom compliance needs.',
        accentColor: 'border-violet-500/30',
        hoverBorder: 'hover:border-violet-400/60',
        hoverShadow: 'hover:shadow-violet-400/10',
        badge: 'For Large Fleets',
        badgeStyle: 'bg-violet-500/10 text-violet-400 border border-violet-500/30',
        features: ['Unlimited vehicles', 'Full AI intelligence suite', 'White-label options', 'Custom integration APIs', 'Dedicated account manager', 'SLA-backed 99.99% uptime', 'On-premise deployment option', '24/7 phone & chat support'],
        ctaStyle: 'border border-violet-500/40 text-violet-400 hover:bg-violet-500/10',
        route: '/login',
    },
];

const PricingSection = () => {
    const navigate = useNavigate();
    const [hovered, setHovered] = useState(null);

    return (
        <section className="py-20 lg:py-28 bg-gradient-to-b from-background to-card/50" id="pricing">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-14"
                >
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-3">Simple Pricing</p>
                    <h2 className="text-3xl sm:text-4xl font-black text-text-primary mb-4">
                        Plans for Every Fleet Size
                    </h2>
                    <p className="text-text-secondary max-w-lg mx-auto text-sm leading-relaxed">
                        No hidden fees. Cancel anytime. Every plan includes a 14-day free trial.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-6 items-start">
                    {plans.map((plan, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.2 }}
                            transition={{ delay: i * 0.1, duration: 0.55 }}
                            whileHover={{ y: -10, scale: 1.02 }}
                            onMouseEnter={() => setHovered(i)}
                            onMouseLeave={() => setHovered(null)}
                            className={`relative bg-card border ${plan.accentColor} rounded-2xl p-7 flex flex-col gap-5 transition-all duration-300 hover:shadow-2xl ${plan.hoverShadow} ${plan.hoverBorder} shine-card overflow-hidden`}
                        >
                            {/* Animated background shimmer on hover */}
                            <motion.div
                                className="absolute inset-0 pointer-events-none rounded-2xl"
                                animate={{ opacity: hovered === i ? 1 : 0 }}
                                transition={{ duration: 0.3 }}
                                style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.03) 50%, rgba(255,255,255,0) 100%)' }}
                            />

                            {plan.badge && (
                                <span className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider whitespace-nowrap ${plan.badgeStyle}`}>
                                    {plan.badge}
                                </span>
                            )}

                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <Zap size={14} className="text-primary" />
                                    <p className="text-xs font-black uppercase tracking-widest text-primary">{plan.name}</p>
                                </div>
                                <div className="flex items-end gap-1">
                                    <motion.span
                                        className="text-4xl font-black text-text-primary"
                                        animate={{ scale: hovered === i ? 1.05 : 1 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {plan.price}
                                    </motion.span>
                                    <span className="text-sm text-text-secondary mb-1">{plan.period}</span>
                                </div>
                                <p className="text-sm text-text-secondary mt-1">{plan.desc}</p>
                            </div>

                            <ul className="space-y-2.5 flex-1">
                                {plan.features.map((f, j) => (
                                    <motion.li
                                        key={j}
                                        initial={{ opacity: 0, x: -10 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.05 + j * 0.04 }}
                                        className="flex items-start gap-2 text-sm text-text-secondary"
                                    >
                                        <Check size={13} className="text-success mt-0.5 flex-shrink-0" />
                                        {f}
                                    </motion.li>
                                ))}
                            </ul>

                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => navigate(plan.route)}
                                className={`w-full py-3 rounded-xl text-sm font-bold transition-all duration-200 ${plan.ctaStyle}`}
                            >
                                {plan.name === 'Enterprise' ? 'Contact Sales' : 'Start Free Trial'}
                            </motion.button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default PricingSection;
