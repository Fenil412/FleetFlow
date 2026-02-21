import React from 'react';
import { Truck, Users, Navigation, Wrench, Fuel, BarChart3, BookOpen, Clock } from 'lucide-react';

const modules = [
    {
        icon: Truck, color: 'text-primary', bg: 'bg-primary/10',
        title: 'Vehicle Fleet Management',
        desc: 'Register every vehicle in your fleet — trucks, vans, bikes. The system tracks each one\'s current status in real time: Available, On Trip, In Shop, or Retired.',
        bullets: [
            'Smart capacity validation prevents overloading',
            'Odometer tracking updates on every trip completion',
            'Auto status changes on maintenance and trip dispatch',
        ]
    },
    {
        icon: Users, color: 'text-success', bg: 'bg-success/10',
        title: 'Driver Profiles & Safety',
        desc: 'Store driver license numbers, expiry dates, and performance scores. The system automatically blocks assignment of drivers with expired licenses.',
        bullets: [
            'License expiry auto-lock — prevents illegal dispatch',
            'Safety score tracking from complaints and incidents',
            'Duty status: On-Duty, On Trip, Off-Duty, Suspended',
        ]
    },
    {
        icon: Navigation, color: 'text-warning', bg: 'bg-warning/10',
        title: 'Trip Dispatch & Logistics',
        desc: 'Create trip orders and dispatch them to vehicles and drivers. The entire workflow — Draft → Dispatched → Completed — is tracked with atomic database transactions.',
        bullets: [
            'Cargo weight validates against vehicle max capacity',
            'Vehicle + Driver lock to ON_TRIP on dispatch',
            'Revenue and odometer recorded on completion',
        ]
    },
    {
        icon: Wrench, color: 'text-danger', bg: 'bg-danger/10',
        title: 'Maintenance Scheduling',
        desc: 'Log every service event — oil changes, brake jobs, inspections. When a maintenance log is created, the vehicle is automatically set to IN_SHOP status and hidden from dispatchers.',
        bullets: [
            'Auto IN_SHOP lock prevents vehicle dispatch during repair',
            'Next service due date tracking',
            'Full cost tracking per service event',
        ]
    },
    {
        icon: Fuel, color: 'text-purple-500', bg: 'bg-purple-500/10',
        title: 'Fuel Logging & Expense',
        desc: 'Every time a driver fills up the tank, record how many liters were bought and total cost. Link fuel receipts to specific trips to calculate trip-level costs.',
        bullets: [
            'Trip-linked fuel logs for accurate cost attribution',
            'Cost-per-km calculated from odometer readings',
            'Bulk fuel expense export for accounting',
        ]
    },
    {
        icon: BarChart3, color: 'text-pink-500', bg: 'bg-pink-500/10',
        title: 'Analytics & Financial Reports',
        desc: 'The analytics engine turns all your data into charts and financial summaries. See which vehicles are most efficient, which cost the most to operate, and your monthly net profit.',
        bullets: [
            'Fuel Efficiency: liters per 100km by vehicle',
            'Vehicle ROI: revenue vs total operational cost',
            'Monthly Payroll & Health Audit PDF downloads',
        ]
    },
];

const workflow = [
    { step: 1, label: 'Vehicle Intake', desc: 'Add "Van-05" (500kg capacity). Status: Available.' },
    { step: 2, label: 'Compliance', desc: 'Add Driver "Alex." System verifies license validity for Van category.' },
    { step: 3, label: 'Dispatching', desc: 'Assign Alex to Van-05 for a 450kg load. 450 < 500 → Pass. Vehicle & Driver → On Trip.' },
    { step: 4, label: 'Completion', desc: 'Driver marks trip "Done," enters final odometer. Vehicle & Driver → Available.' },
    { step: 5, label: 'Maintenance', desc: 'Manager logs "Oil Change." Auto-Logic: Status → In Shop. Vehicle hidden from Dispatcher.' },
    { step: 6, label: 'Analytics', desc: 'System updates "Cost-per-km" based on fuel logs from the last trip. Monthly report downloadable.' },
];

const About = () => {
    return (
        <div className="space-y-10 animate-fade-in">
            {/* Hero */}
            <div className="bg-gradient-to-br from-primary/10 via-card to-card rounded-3xl border border-border p-10 relative overflow-hidden">
                <div className="absolute right-0 top-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center">
                            <Truck className="text-white" size={24} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-text-primary tracking-tight">FleetFlow</h1>
                            <p className="text-sm text-primary font-bold uppercase tracking-widest">Fleet & Logistics Management System</p>
                        </div>
                    </div>
                    <p className="text-text-secondary max-w-2xl leading-relaxed text-sm mt-4">
                        FleetFlow is a production-grade, full-stack logistics management platform built for fleet managers, dispatchers, safety officers, and financial analysts.
                        Every feature enforces real-world business logic — from blocking expired driver licenses to automatically releasing vehicles after trip completion.
                    </p>
                    <div className="flex gap-6 mt-6 text-xs font-bold uppercase text-text-secondary tracking-widest">
                        <span>React + Vite</span>
                        <span>·</span>
                        <span>Node.js + Express</span>
                        <span>·</span>
                        <span>PostgreSQL</span>
                        <span>·</span>
                        <span>WebSockets</span>
                        <span>·</span>
                        <span>Tailwind CSS</span>
                    </div>
                </div>
            </div>

            {/* System Modules */}
            <div>
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-text-secondary mb-5 flex items-center gap-2">
                    <BookOpen size={14} /> System Modules
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {modules.map((mod) => {
                        const Icon = mod.icon;
                        return (
                            <div key={mod.title} className="bg-card border border-border rounded-2xl p-6 hover:shadow-md transition-shadow">
                                <div className={`h-10 w-10 rounded-xl ${mod.bg} flex items-center justify-center mb-4`}>
                                    <Icon className={mod.color} size={20} />
                                </div>
                                <h3 className="font-extrabold text-text-primary text-sm mb-2">{mod.title}</h3>
                                <p className="text-xs text-text-secondary leading-relaxed mb-3">{mod.desc}</p>
                                <ul className="space-y-1">
                                    {mod.bullets.map(b => (
                                        <li key={b} className="flex items-start gap-2 text-xs text-text-secondary">
                                            <span className={`${mod.color} mt-0.5 font-black`}>›</span>
                                            {b}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Logic & Workflow */}
            <div className="bg-card border border-border rounded-3xl p-8">
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-text-secondary mb-6 flex items-center gap-2">
                    <Clock size={14} /> Logic & Workflow Summary
                </h2>
                <p className="text-sm text-text-secondary mb-6 leading-relaxed">
                    Every action in FleetFlow follows a strict real-world workflow. Here's the full lifecycle of a typical delivery from vehicle intake to financial reporting:
                </p>
                <div className="relative">
                    <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-border" />
                    <div className="space-y-6">
                        {workflow.map((w) => (
                            <div key={w.step} className="flex gap-6 relative">
                                <div className="h-10 w-10 min-w-[40px] rounded-full bg-primary flex items-center justify-center text-white text-sm font-black z-10 shadow-lg shadow-primary/20">
                                    {w.step}
                                </div>
                                <div className="bg-background rounded-xl border border-border px-5 py-3 flex-1">
                                    <p className="text-xs font-black uppercase tracking-widest text-primary mb-1">{w.label}</p>
                                    <p className="text-sm text-text-secondary">{w.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* RBAC roles */}
            <div className="bg-card border border-border rounded-3xl p-8">
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-text-secondary mb-5">Role-Based Access Control</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { role: 'Fleet Manager', color: 'text-primary', bg: 'bg-primary/10', perms: 'Full access — all modules' },
                        { role: 'Dispatcher', color: 'text-success', bg: 'bg-success/10', perms: 'Vehicles, Drivers, Trips' },
                        { role: 'Safety Officer', color: 'text-warning', bg: 'bg-warning/10', perms: 'Drivers, Maintenance' },
                        { role: 'Financial Analyst', color: 'text-pink-500', bg: 'bg-pink-500/10', perms: 'Fuel Logs, Analytics' },
                    ].map(r => (
                        <div key={r.role} className={`${r.bg} rounded-xl p-4 border border-border`}>
                            <p className={`text-xs font-black uppercase tracking-wider ${r.color} mb-1`}>{r.role}</p>
                            <p className="text-xs text-text-secondary">{r.perms}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default About;
