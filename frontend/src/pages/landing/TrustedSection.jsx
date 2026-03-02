import React from 'react';
import { motion } from 'framer-motion';

// Free tech company logos via simple SVG text — looks clean and professional
const partners = [
    { name: 'Amazon Logistics', color: '#FF9900' },
    { name: 'BlueDart', color: '#E30613' },
    { name: 'Mahindra Logistics', color: '#C8102E' },
    { name: 'TCI Freight', color: '#0066CC' },
    { name: 'GATI Ltd', color: '#E8541B' },
    { name: 'DHL India', color: '#FFCC00' },
    { name: 'FedEx India', color: '#4D148C' },
    { name: 'Rivigo', color: '#0055A5' },
];

const TrustedSection = () => (
    <section className="py-14 border-y border-border bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-center text-xs font-black uppercase tracking-[0.25em] text-text-secondary mb-10"
            >
                Trusted by 500+ enterprises across India
            </motion.p>

            <div className="relative overflow-hidden">
                {/* Gradient fade edges */}
                <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-card/50 to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-card/50 to-transparent z-10 pointer-events-none" />

                <motion.div
                    animate={{ x: ['0%', '-50%'] }}
                    transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
                    className="flex gap-10 w-max"
                >
                    {[...partners, ...partners].map((p, i) => (
                        <div
                            key={i}
                            className="flex items-center justify-center px-7 py-4 rounded-xl border border-border bg-background/60 hover:border-primary/40 transition-colors flex-shrink-0"
                        >
                            <span className="text-sm font-black whitespace-nowrap" style={{ color: p.color }}>
                                {p.name}
                            </span>
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    </section>
);

export default TrustedSection;
