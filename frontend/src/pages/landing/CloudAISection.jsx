import React from 'react';
import { motion } from 'framer-motion';
import { Cloud, BrainCircuit, Cpu } from 'lucide-react';

const cards = [
    {
        icon: Cloud, color: 'text-primary', border: 'border-primary/30',
        from: 'from-primary/10', to: 'to-violet-500/10',
        title: 'Cloud-Native Architecture',
        desc: 'Deployed on globally distributed infrastructure. Auto-scales on demand with 99.9% uptime SLA and zero-downtime deployments.',
        points: ['Docker + Kubernetes ready', 'Multi-region failover', 'Zero-downtime deploys'],
    },
    {
        icon: BrainCircuit, color: 'text-violet-400', border: 'border-violet-400/30',
        from: 'from-violet-500/10', to: 'to-cyan-400/10',
        title: 'AI Optimization Engine',
        desc: 'Seven specialized ML models handle everything from predictive maintenance to eco-scoring — trained on real fleet data.',
        points: ['Predictive breakdown alerts', 'Route + load optimization', 'Driver safety scoring'],
    },
    {
        icon: Cpu, color: 'text-cyan-400', border: 'border-cyan-400/30',
        from: 'from-cyan-400/10', to: 'to-primary/10',
        title: 'Real-Time Decision Engine',
        desc: 'WebSocket-powered live updates deliver sub-5ms event propagation so dispatchers always act on current ground truth.',
        points: ['<5ms event latency', 'Live conflict resolution', 'Concurrent dispatch safety'],
    },
];

const CloudAISection = () => (
    <section id="ai-cloud" className="py-20 lg:py-28 bg-gradient-to-b from-navy/20 to-background relative overflow-hidden">
        {/* Animated orbs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] pointer-events-none">
            <div className="w-full h-full rounded-full border border-primary/5 animate-spin-slow" />
            <div className="absolute inset-10 rounded-full border border-violet-500/5 animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '20s' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-16"
            >
                <p className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-3">Technology Stack</p>
                <h2 className="text-3xl sm:text-4xl font-black text-text-primary mb-4">
                    Built for the Enterprise Edge
                </h2>
                <p className="text-text-secondary max-w-lg mx-auto text-sm leading-relaxed">
                    Three purpose-built engines work together to keep your fleet running at peak efficiency.
                </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
                {cards.map((c, i) => {
                    const Icon = c.icon;
                    return (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ duration: 0.6, delay: i * 0.12 }}
                            whileHover={{ scale: 1.02, y: -4 }}
                            className={`relative bg-gradient-to-br ${c.from} ${c.to} border ${c.border} rounded-3xl p-7 overflow-hidden group`}
                        >
                            {/* Inner glow */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${c.from} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl`} />

                            <div className="relative">
                                <div className={`w-12 h-12 rounded-xl bg-background/40 border ${c.border} flex items-center justify-center mb-5`}>
                                    <Icon size={22} className={c.color} />
                                </div>
                                <h3 className="font-extrabold text-text-primary text-lg mb-3">{c.title}</h3>
                                <p className="text-sm text-text-secondary leading-relaxed mb-5">{c.desc}</p>
                                <ul className="space-y-1.5">
                                    {c.points.map((pt) => (
                                        <li key={pt} className="flex items-center gap-2 text-sm text-text-secondary">
                                            <span className={`${c.color} font-black`}>✓</span>
                                            {pt}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    </section>
);

export default CloudAISection;
