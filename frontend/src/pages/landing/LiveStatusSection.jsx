import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck, Navigation, AlertTriangle, CheckCircle2 } from 'lucide-react';

const events = [
    { icon: Truck, color: 'text-primary', bg: 'bg-primary/10', dot: 'bg-primary', label: 'Vehicle Started', detail: 'VN-0042 • Route 17 engaged', time: 'Just now' },
    { icon: Navigation, color: 'text-violet-400', bg: 'bg-violet-400/10', dot: 'bg-violet-400', label: 'Route Updated', detail: 'Traffic detected — rerouting via NH-8', time: '2m ago' },
    { icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/10', dot: 'bg-warning', label: 'Alert Triggered', detail: 'Engine temp high on VN-0017', time: '5m ago' },
    { icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10', dot: 'bg-success', label: 'Delivery Completed', detail: 'Order #4821 — Delivered on time', time: '8m ago' },
    { icon: Truck, color: 'text-cyan-400', bg: 'bg-cyan-400/10', dot: 'bg-cyan-400', label: 'Vehicle Dispatched', detail: 'VN-0031 → Depot B via Route 9', time: '12m ago' },
    { icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10', dot: 'bg-success', label: 'Maintenance Done', detail: 'VN-0009 cleared for service', time: '18m ago' },
];

const LiveStatusSection = () => {
    const [visible, setVisible] = useState(3);
    const [highlight, setHighlight] = useState(0);

    // Cycle highlight to simulate live feed
    useEffect(() => {
        const id = setInterval(() => {
            setHighlight(prev => (prev + 1) % events.length);
        }, 2500);
        return () => clearInterval(id);
    }, []);

    return (
        <section id="live-status" className="py-20 lg:py-28 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    {/* Left — Copy */}
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <span className="relative flex h-3 w-3">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                                <span className="relative inline-flex h-3 w-3 rounded-full bg-success" />
                            </span>
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-success">Live Activity Feed</span>
                        </div>

                        <h2 className="text-3xl sm:text-4xl font-black text-text-primary mb-5">
                            Zero-Latency Event<br />
                            <span className="gradient-text">Intelligence</span>
                        </h2>
                        <p className="text-text-secondary leading-relaxed mb-6 text-sm">
                            Every fleet event — dispatches, alerts, route changes, and completions — surfaces in real time
                            via our WebSocket engine. Dispatchers always act on current ground truth.
                        </p>

                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { v: '<5ms', l: 'Event Latency' },
                                { v: '99.9%', l: 'Uptime SLA' },
                                { v: '∞', l: 'Events / min' },
                            ].map((s, i) => (
                                <div key={i} className="bg-card border border-border rounded-xl p-3 text-center">
                                    <p className="text-2xl font-black gradient-text">{s.v}</p>
                                    <p className="text-sm text-text-secondary mt-1">{s.l}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Right — Live Feed */}
                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.6 }}
                        className="relative"
                    >
                        <div className="glass-morphism border border-border rounded-2xl overflow-hidden shadow-2xl shadow-black/20">
                            {/* Header */}
                            <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-background/40">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                                    <span className="text-xs font-bold text-text-secondary uppercase tracking-widest">Live Events</span>
                                </div>
                                <span className="text-xs text-text-secondary font-mono">24 events / min</span>
                            </div>

                            <div className="p-4 space-y-2">
                                <AnimatePresence initial={false}>
                                    {events.slice(0, visible).map((ev, i) => {
                                        const Icon = ev.icon;
                                        const isHighlighted = i === highlight % Math.min(visible, events.length);
                                        return (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-500 ${isHighlighted
                                                    ? 'border-primary/40 bg-primary/5'
                                                    : 'border-border bg-background/50'
                                                    }`}
                                            >
                                                <div className={`w-9 h-9 rounded-xl ${ev.bg} flex items-center justify-center flex-shrink-0`}>
                                                    <Icon size={16} className={ev.color} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-text-primary">{ev.label}</p>
                                                    <p className="text-xs text-text-secondary truncate">{ev.detail}</p>
                                                </div>
                                                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                                    <span className={`w-1.5 h-1.5 rounded-full ${ev.dot}`} />
                                                    <span className="text-[9px] text-text-secondary whitespace-nowrap">{ev.time}</span>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>

                            {visible < events.length && (
                                <div className="px-5 pb-4">
                                    <button
                                        onClick={() => setVisible(events.length)}
                                        className="w-full py-2.5 text-xs font-bold text-primary border border-primary/30 rounded-xl hover:bg-primary/5 transition-colors"
                                    >
                                        View All Events
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default LiveStatusSection;
