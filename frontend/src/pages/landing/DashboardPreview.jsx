import React from 'react';
import { motion } from 'framer-motion';

/* ── SVG Line Chart ───────────────────────────────────────── */
const LineChart = () => {
    const data = [30, 55, 40, 70, 58, 85, 72, 95, 80, 110, 98, 128];
    const max = 130; const w = 400; const h = 120;
    const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * h}`).join(' ');
    const areaPoints = `0,${h} ${points} ${w},${h}`;

    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none">
            <defs>
                <linearGradient id="lineArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgb(var(--color-primary))" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="rgb(var(--color-primary))" stopOpacity="0" />
                </linearGradient>
            </defs>
            <polygon points={areaPoints} fill="url(#lineArea)" />
            <polyline points={points} fill="none" stroke="rgb(var(--color-primary))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <animate attributeName="stroke-dasharray" from={`0 ${w * 3}`} to={`${w * 3} 0`} dur="2s" fill="freeze" />
            </polyline>
            {data.map((v, i) => (
                <circle key={i} cx={(i / (data.length - 1)) * w} cy={h - (v / max) * h} r="3" fill="rgb(var(--color-primary))">
                    <animate attributeName="opacity" from="0" to="1" begin={`${0.15 * i}s`} dur="0.3s" fill="freeze" />
                </circle>
            ))}
        </svg>
    );
};

/* ── SVG Donut Chart ─────────────────────────────────────── */
const DonutChart = ({ segments }) => {
    const r = 40; const cx = 60; const cy = 60;
    const total = segments.reduce((s, g) => s + g.value, 0);
    let offset = 0;
    const paths = segments.map((seg, i) => {
        const pct = seg.value / total;
        const angle = pct * 360;
        const startAngle = (offset / total) * 360 - 90;
        const endAngle = ((offset + seg.value) / total) * 360 - 90;
        const toRad = deg => (deg * Math.PI) / 180;
        const x1 = cx + r * Math.cos(toRad(startAngle));
        const y1 = cy + r * Math.sin(toRad(startAngle));
        const x2 = cx + r * Math.cos(toRad(endAngle));
        const y2 = cy + r * Math.sin(toRad(endAngle));
        const largeArc = angle > 180 ? 1 : 0;
        const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
        offset += seg.value;
        return <path key={i} d={d} fill={seg.color} opacity="0.85" />;
    });
    return (
        <svg viewBox="0 0 120 120" className="w-24 h-24">
            {paths}
            <circle cx={cx} cy={cy} r="22" fill="rgb(var(--color-card))" />
        </svg>
    );
};

const donutData = [
    { value: 65, color: '#10b981' },
    { value: 20, color: '#3b82f6' },
    { value: 10, color: '#f59e0b' },
    { value: 5, color: '#ef4444' },
];

/* ── Futuristic Dashboard Preview ───────────────────────── */
const DashboardPreview = () => (
    <section className="py-20 lg:py-28 bg-gradient-to-b from-background to-navy/30 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-14"
            >
                <p className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-3">Live Dashboard</p>
                <h2 className="text-3xl sm:text-4xl font-black text-text-primary mb-4">
                    Your Fleet at a Glance
                </h2>
                <p className="text-text-secondary max-w-lg mx-auto text-sm leading-relaxed">
                    A unified command center with real-time analytics, live maps, and AI-driven recommendations.
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 60, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="relative max-w-6xl mx-auto"
            >
                <div className="absolute inset-0 bg-primary/10 rounded-3xl blur-3xl scale-95" />

                <div className="relative glass-morphism rounded-3xl border border-border overflow-hidden shadow-2xl shadow-black/30">
                    {/* Browser titlebar */}
                    <div className="flex items-center gap-2 px-5 py-3 border-b border-border bg-background/50">
                        <div className="w-3 h-3 rounded-full bg-danger" />
                        <div className="w-3 h-3 rounded-full bg-warning" />
                        <div className="w-3 h-3 rounded-full bg-success" />
                        <div className="flex-1 mx-4">
                            <div className="max-w-xs mx-auto bg-background/60 border border-border rounded-md px-3 py-1 text-center">
                                <span className="text-[10px] text-text-secondary font-mono">app.fleetflow.io/dashboard</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-5 md:p-6 space-y-5">
                        {/* Top stat cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                                { label: 'Active Vehicles', value: '24 / 32', sub: '+3 dispatched today', dot: 'bg-primary', color: 'text-primary' },
                                { label: 'Revenue Today', value: '₹1.84L', sub: '↑ 12% vs yesterday', dot: 'bg-success', color: 'text-success' },
                                { label: 'Fuel Spent', value: '₹38,200', sub: '840L consumed', dot: 'bg-warning', color: 'text-warning' },
                                { label: 'AI Alerts', value: '3 Active', sub: '1 critical, 2 warnings', dot: 'bg-danger', color: 'text-danger' },
                            ].map((s, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.1 * i + 0.3, duration: 0.4 }}
                                    className="bg-background/70 border border-border rounded-xl p-3.5"
                                >
                                    <div className="flex items-center gap-1.5 mb-2">
                                        <div className={`w-1.5 h-1.5 rounded-full ${s.dot} animate-pulse`} />
                                        <span className="text-[9px] text-text-secondary font-bold uppercase tracking-wider">{s.label}</span>
                                    </div>
                                    <p className={`text-lg font-black ${s.color}`}>{s.value}</p>
                                    <p className="text-[9px] text-text-secondary mt-0.5">{s.sub}</p>
                                </motion.div>
                            ))}
                        </div>

                        {/* Charts row */}
                        <div className="grid md:grid-cols-3 gap-4">
                            {/* Line chart */}
                            <div className="md:col-span-2 bg-background/70 border border-border rounded-xl p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">Monthly Revenue (₹)</p>
                                    <span className="text-[10px] bg-success/10 text-success px-2 py-0.5 rounded-full font-bold">↑ 28% YoY</span>
                                </div>
                                <div className="h-28">
                                    <LineChart />
                                </div>
                                <div className="flex justify-between mt-1">
                                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => (
                                        <span key={m} className="text-[8px] text-text-secondary">{m}</span>
                                    ))}
                                </div>
                            </div>

                            {/* Donut + bar mix */}
                            <div className="bg-background/70 border border-border rounded-xl p-4 space-y-3">
                                <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">Fleet Status</p>
                                <div className="flex items-center gap-4">
                                    <DonutChart segments={donutData} />
                                    <div className="space-y-2 text-[10px]">
                                        {[
                                            { label: 'Available', pct: '65%', color: 'bg-success' },
                                            { label: 'On Trip', pct: '20%', color: 'bg-primary' },
                                            { label: 'In Shop', pct: '10%', color: 'bg-warning' },
                                            { label: 'Retired', pct: '5%', color: 'bg-danger' },
                                        ].map((f, i) => (
                                            <div key={i} className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-sm ${f.color} flex-shrink-0`} />
                                                <span className="text-text-secondary">{f.label}</span>
                                                <span className="font-bold text-text-primary ml-auto">{f.pct}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bar chart row */}
                        <div className="grid md:grid-cols-2 gap-4">
                            {/* Weekly trips bar */}
                            <div className="bg-background/70 border border-border rounded-xl p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">Weekly Trips</p>
                                    <span className="text-[10px] text-text-secondary">142 this week</span>
                                </div>
                                <div className="flex items-end gap-2 h-16">
                                    {[70, 85, 60, 92, 78, 88, 95].map((h, i) => (
                                        <motion.div
                                            key={i}
                                            className="flex-1 rounded-t-sm bg-gradient-to-t from-primary to-violet-500"
                                            initial={{ height: 0 }}
                                            whileInView={{ height: `${h}%` }}
                                            viewport={{ once: true }}
                                            transition={{ delay: 0.05 * i + 0.5, duration: 0.5 }}
                                        />
                                    ))}
                                </div>
                                <div className="flex justify-between mt-1">
                                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                                        <span key={i} className="text-[9px] text-text-secondary flex-1 text-center">{d}</span>
                                    ))}
                                </div>
                            </div>

                            {/* Fuel efficiency bar */}
                            <div className="bg-background/70 border border-border rounded-xl p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">Fuel Efficiency (km/L)</p>
                                    <span className="text-[10px] text-success font-bold">Avg 14.2</span>
                                </div>
                                <div className="space-y-2">
                                    {[
                                        { label: 'VN-0042', value: 82, km: '16.4' },
                                        { label: 'VN-0017', value: 65, km: '13.0' },
                                        { label: 'VN-0031', value: 75, km: '15.0' },
                                        { label: 'VN-0009', value: 56, km: '11.2' },
                                    ].map((v, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <span className="text-[9px] text-text-secondary w-14 shrink-0">{v.label}</span>
                                            <div className="flex-1 h-3 bg-border rounded-full overflow-hidden">
                                                <motion.div
                                                    className="h-full rounded-full bg-gradient-to-r from-success to-cyan-400"
                                                    initial={{ width: 0 }}
                                                    whileInView={{ width: `${v.value}%` }}
                                                    viewport={{ once: true }}
                                                    transition={{ delay: 0.1 * i + 0.5, duration: 0.7 }}
                                                />
                                            </div>
                                            <span className="text-[9px] font-bold text-text-primary w-8 text-right">{v.km}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    </section>
);

export default DashboardPreview;
