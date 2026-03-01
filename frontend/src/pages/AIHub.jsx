import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BrainCircuit, Sparkles, Activity, Map, Wrench, Leaf,
    Gauge, Target, Zap, CheckCircle2, AlertTriangle,
    Info, Play, Database, Edit3
} from 'lucide-react';
import { aiAPI } from '../api/ai.api';
import toast from 'react-hot-toast';

// ── Dummy Data Payloads ──────────────────────────────────────────────────────
const DUMMY_PAYLOADS = {
    maintenance: {
        "Vehicle_ID": "V-1042", "Usage_Hours": 5300.0, "Actual_Load": 7.5,
        "Engine_Temperature": 95.0, "Tire_Pressure": 32.0, "Fuel_Consumption": 12.5,
        "Battery_Status": 75.0, "Vibration_Levels": 1.8, "Oil_Quality": 65.0,
        "Failure_History": 2, "Anomalies_Detected": 0, "Predictive_Score": 0.42,
        "Downtime_Maintenance": 1.5, "Impact_on_Efficiency": 0.15,
        "Brake_Condition": "Good", "Weather_Conditions": "Clear", "Road_Conditions": "Highway"
    },
    driver: {
        "Driver_ID": "D-201", "overspeed_events": 3, "harsh_brake_events": 5,
        "harsh_accel_events": 2, "idle_minutes": 45.0, "late_deliveries": 1,
        "on_time_deliveries": 12
    },
    carbon: {
        "Vehicle_ID": "V-1042", "Trip_ID": "T-5021", "fuel_type": "diesel",
        "fuel_litres": 48.5, "distance_km": 320.0
    },
    fuel: {
        "Vehicle_ID": "V-1042", "Make": "FORD", "Model": "F-150",
        "Vehicle_Class": "SUV - SMALL", "Engine Size(L)": 3.5, "Cylinders": 6,
        "Transmission": "AS6", "Fuel Type": "X",
        "Fuel Consumption City (L/100 km)": 13.2,
        "Fuel Consumption Hwy (L/100 km)": 9.4,
        "Fuel Consumption Comb (mpg)": 26.0
    },
    delay: {
        "Trip_ID": "T-5021", "Usage_Hours": 4500.0, "Actual_Load": 6.8,
        "Load_Capacity": 8.0, "Downtime_Maintenance": 2.0,
        "Impact_on_Efficiency": 0.20, "Fuel_Consumption": 11.5,
        "Vibration_Levels": 2.1, "Route_Info": "Rural",
        "Weather_Conditions": "Rain", "Road_Conditions": "Rural"
    },
    route: {
        "Trip_ID": "T-5021", "distance_km": 280.0, "road_type": "highway",
        "traffic_level": "medium", "weather": "clear",
        "current_load_kg": 4500.0, "max_load_kg": 8000.0,
        "base_fuel_consumption_l100km": 12.0
    },
    ecoScore: {
        "Vehicle_ID": "EPA-26587", "Year": 2022, "Make": "FORD",
        "Model": "F-150 FFV", "Class": "Standard Pickup Trucks", "Drive": "4WD",
        "Transmission": "Automatic 6-Speed", "Fuel Type": "Regular",
        "Engine_Cylinders": 8, "Engine_Displacement": 5.0,
        "City MPG (FT1)": 14.0, "Highway MPG (FT1)": 18.0,
        "Combined MPG (FT1)": 15.0, "Tailpipe CO2 (FT1)": 593.0,
        "Annual Fuel Cost (FT1)": 3300.0
    }
};

const AI_SERVICES = [
    {
        id: 'maintenance', title: 'Predictive Maintenance', icon: Wrench, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20',
        desc: 'RandomForest ML model to predict breakdown risk. Identifies abnormal sensors and outputs a confident health score.',
        defaultPayload: DUMMY_PAYLOADS.maintenance, action: aiAPI.predictMaintenance
    },
    {
        id: 'delay', title: 'Delivery Delay', icon: Activity, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20',
        desc: 'RandomForest Regressor predicting exact delivery delays based on weather, downtime matrices, and live transit disruptions.',
        defaultPayload: DUMMY_PAYLOADS.delay, action: aiAPI.predictDelay
    },
    {
        id: 'ecoScore', title: 'Vehicle Eco Score', icon: Sparkles, color: 'text-teal-500', bg: 'bg-teal-500/10', border: 'border-teal-500/20',
        desc: 'Grades fleet vehicles (A-F) on EPA fuel economy standards against your entire fleet to discover underperforming assets rapidly.',
        defaultPayload: DUMMY_PAYLOADS.ecoScore, action: aiAPI.predictEcoScore
    },
    {
        id: 'fuel', title: 'Fuel & CO2 Anomaly', icon: Gauge, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20',
        desc: 'GradientBoosting + IsolationForest to detect fuel theft and predict baseline CO2 based on historical vehicle characteristics.',
        defaultPayload: DUMMY_PAYLOADS.fuel, action: aiAPI.predictFuelAnomaly
    },
    {
        id: 'driver', title: 'Driver Behaviour Score', icon: Target, color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20',
        desc: 'Deep logic engine analyzing harsh braking, speeding tendencies, idle ratios to grade driver risk levels dynamically.',
        defaultPayload: DUMMY_PAYLOADS.driver, action: aiAPI.predictDriverScore
    },
    {
        id: 'carbon', title: 'Carbon Tracking', icon: Leaf, color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20',
        desc: 'Calculates true scope 1 carbon emissions (in kg) and actionable offset equivalents based on exact, real-time fuel burn metrics.',
        defaultPayload: DUMMY_PAYLOADS.carbon, action: aiAPI.predictCarbon
    },
    {
        id: 'route', title: 'Route Optimization', icon: Map, color: 'text-indigo-500', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20',
        desc: 'Physics and Traffic combined model to estimate precise travel ETAs, dynamic weather-adjusted speeds, and fuel-optimal pathing.',
        defaultPayload: DUMMY_PAYLOADS.route, action: aiAPI.predictRoute
    }
];

const AIHub = () => {
    const [activeServiceId, setActiveServiceId] = useState('maintenance');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState({});

    // Editable payload state for the currently active service
    const [payloads, setPayloads] = useState(() => {
        const initial = {};
        AI_SERVICES.forEach(s => initial[s.id] = { ...s.defaultPayload });
        return initial;
    });

    const activeService = AI_SERVICES.find(s => s.id === activeServiceId);
    const currentPayload = payloads[activeServiceId];
    const activeResult = results[activeServiceId];

    const handlePayloadChange = (key, value, originalType) => {
        let parsedValue = value;
        // Keep types strict based on dummy data to avoid 422 errors
        if (originalType === 'number') {
            parsedValue = value === '' ? '' : Number(value);
        }

        setPayloads(prev => ({
            ...prev,
            [activeServiceId]: {
                ...prev[activeServiceId],
                [key]: parsedValue
            }
        }));
    };

    const runModel = async () => {
        setLoading(true);
        try {
            const res = await activeService.action(currentPayload);
            setResults(prev => ({ ...prev, [activeService.id]: res }));
            toast.success(`${activeService.title} analysis complete`);
        } catch (error) {
            toast.error(error?.response?.data?.error || `Failed to run ${activeService.title}`);
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full min-h-[calc(100vh-6rem)] bg-background relative overflow-hidden rounded-2xl border border-border mt-4 mx-4 shadow-xl">
            {/* Background ambient glow based on active color */}
            <div className={`absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[150px] opacity-10 pointer-events-none transition-colors duration-700 ${activeService.color.replace('text-', 'bg-')}`} />

            {/* ── Top Navigation Bar (Horizontal Scroll) ── */}
            <div className="w-full border-b border-border bg-card/50 backdrop-blur-md z-20 flex flex-col">
                <div className="p-4 md:px-8 border-b border-border/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-primary/10 text-primary rounded-xl shrink-0">
                            <BrainCircuit size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-text-primary tracking-tight">AI Intelligence Hub</h2>
                            <p className="text-xs text-text-secondary">Run real-time predictions against scalable machine learning models</p>
                        </div>
                    </div>
                </div>

                {/* Horizontal Service Selector */}
                <div className="flex overflow-x-auto custom-scrollbar px-4 md:px-8 py-3 gap-3 items-center">
                    {AI_SERVICES.map((service) => {
                        const isActive = activeServiceId === service.id;
                        return (
                            <button
                                key={service.id}
                                onClick={() => setActiveServiceId(service.id)}
                                className={`px-4 py-2 rounded-xl transition-all duration-300 flex items-center gap-2 whitespace-nowrap shrink-0 border
                                    ${isActive ? `bg-card shadow-sm ${service.border}` : 'bg-transparent border-transparent hover:bg-card/50 text-text-secondary hover:text-text-primary'}
                                `}
                            >
                                <service.icon size={16} className={`${isActive ? service.color : ''} transition-colors`} />
                                <span className={`font-semibold text-sm ${isActive ? 'text-text-primary' : ''}`}>{service.title}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Main Content Area ── */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden relative z-10 flex flex-col">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeService.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="flex-1 flex flex-col p-4 md:p-8 max-w-7xl mx-auto w-full"
                    >
                        {/* Service Header & Action */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                            <div className="flex items-start gap-4 max-w-2xl">
                                <div className={`p-4 rounded-2xl ${activeService.bg} ${activeService.color} shrink-0`}>
                                    <activeService.icon size={32} />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-black text-text-primary tracking-tight">{activeService.title}</h1>
                                    <p className="text-text-secondary mt-1 text-sm leading-relaxed">{activeService.desc}</p>
                                </div>
                            </div>
                            <button
                                onClick={runModel}
                                disabled={loading}
                                className={`px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-md shrink-0 transition-transform active:scale-95
                                    ${loading ? 'bg-background border border-border text-text-secondary cursor-wait shadow-none' : 'bg-primary text-white hover:bg-primary/90'}
                                `}
                            >
                                {loading ? (
                                    <><div className="w-4 h-4 border-2 border-text-secondary border-t-transparent rounded-full animate-spin"></div> Computing...</>
                                ) : (
                                    <><Play fill="currentColor" size={16} /> Run Prediction</>
                                )}
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

                            {/* ── Editable Input Form ── */}
                            <div className="space-y-4 flex flex-col h-full max-h-[600px]">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xs uppercase tracking-widest font-bold text-text-secondary flex items-center gap-2">
                                        <Edit3 size={14} /> Editable Telemetry Variables
                                    </h3>
                                    <button
                                        onClick={() => setPayloads(prev => ({ ...prev, [activeService.id]: { ...activeService.defaultPayload } }))}
                                        className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                                    >
                                        Reset to Default
                                    </button>
                                </div>

                                <div className="bg-card border border-border rounded-2xl shadow-sm flex-1 overflow-hidden flex flex-col">
                                    <div className="p-1 bg-background/50 border-b border-border/50 text-[10px] font-bold text-text-secondary/70 uppercase tracking-wider flex justify-between px-5 py-2">
                                        <span>Variable</span>
                                        <span>Value</span>
                                    </div>
                                    <div className="overflow-y-auto custom-scrollbar p-2 flex-1">
                                        {Object.entries(currentPayload).map(([key, value]) => {
                                            const originalType = typeof activeService.defaultPayload[key];
                                            return (
                                                <div key={key} className="flex flex-col sm:flex-row sm:items-center justify-between py-2.5 px-3 hover:bg-background/40 rounded-lg transition-colors group">
                                                    <label className="text-sm text-text-secondary font-medium w-1/2 break-words pr-4 select-none cursor-pointer" htmlFor={`input-${key}`}>
                                                        {key}
                                                    </label>
                                                    <input
                                                        id={`input-${key}`}
                                                        type={originalType === 'number' ? 'number' : 'text'}
                                                        value={value}
                                                        onChange={(e) => handlePayloadChange(key, e.target.value, originalType)}
                                                        className="w-full sm:w-1/2 bg-background border border-border/50 rounded-lg px-3 py-1.5 text-sm font-semibold text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all text-right !appearance-none"
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* ── AI Output Result ── */}
                            <div className="space-y-4 flex flex-col h-full max-h-[600px]">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xs uppercase tracking-widest font-bold text-text-secondary flex items-center gap-2">
                                        <Sparkles size={14} className="text-primary" /> Active Inference Result
                                    </h3>
                                    {activeResult && <span className="text-[10px] uppercase px-2 py-0.5 bg-green-500/10 text-green-500 rounded-md font-bold shrink-0">Completed</span>}
                                </div>
                                <div className={`flex-1 relative bg-card border border-border rounded-2xl shadow-sm transition-all duration-500 overflow-hidden flex flex-col
                                    ${activeResult ? 'ring-1 ring-primary/20' : ''}
                                `}>
                                    {!activeResult ? (
                                        <div className="flex-1 flex flex-col items-center justify-center text-text-secondary p-8 text-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-background/80 to-card">
                                            <div className="w-16 h-16 mb-4 rounded-2xl bg-background border border-border flex items-center justify-center shadow-inner">
                                                <Database size={24} className="opacity-20" />
                                            </div>
                                            <p className="font-bold text-text-primary text-lg">Awaiting Execution</p>
                                            <p className="text-sm mt-2 max-w-sm leading-relaxed">Adjust the parameters on the left and click "Run Prediction" to execute the neural engine against the live JSON payload.</p>
                                        </div>
                                    ) : (
                                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">

                                            {/* Primary AI Verdict Pill */}
                                            {(activeResult.recommendation || activeResult.risk_level || activeResult.emission_rating || activeResult.delay_risk || activeResult.eco_grade) && (
                                                <div className="bg-background rounded-xl p-5 border border-border/60 shadow-inner">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <span className="text-xs font-bold text-text-secondary uppercase tracking-widest">System Verdict</span>
                                                        <span className={`inline-flex px-3 py-1.5 rounded-lg text-xs font-black tracking-widest uppercase shadow-sm
                                                            ${activeResult.risk_level === 'HIGH' || activeResult.emission_rating === 'POOR' || activeResult.delay_risk === 'HIGH' || activeResult.eco_grade === 'F' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                                                                activeResult.risk_level === 'MEDIUM' || activeResult.emission_rating === 'AVERAGE' || activeResult.delay_risk === 'MEDIUM' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                                                                    'bg-green-500/10 text-green-500 border border-green-500/20'}`
                                                        }>
                                                            {activeResult.risk_level || activeResult.emission_rating || activeResult.delay_risk || activeResult.eco_grade || activeResult.grade || "INFO"}
                                                        </span>
                                                    </div>
                                                    {activeResult.recommendation && (
                                                        <p className="text-text-primary font-medium leading-relaxed flex items-start gap-3">
                                                            <Info size={18} className="text-primary shrink-0 mt-0.5" />
                                                            {activeResult.recommendation}
                                                        </p>
                                                    )}
                                                </div>
                                            )}

                                            {/* Technical Breakdown */}
                                            <div>
                                                <h4 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-3 border-b border-border/50 pb-2">Analysis Breakdown</h4>
                                                <div className="space-y-1">
                                                    {Object.entries(activeResult)
                                                        .filter(([k]) => k !== 'recommendation' && typeof activeResult[k] !== 'object')
                                                        .map(([k, v]) => (
                                                            <div key={k} className="flex justify-between items-center py-2.5 px-3 rounded-lg hover:bg-background/40 transition-colors">
                                                                <span className="text-sm text-text-secondary font-medium capitalize">{k.replace(/_/g, ' ')}</span>
                                                                <span className="text-sm font-bold text-text-primary text-right pl-4">
                                                                    {typeof v === 'boolean' ? (
                                                                        v ? <span className="text-red-500 flex items-center gap-1.5"><AlertTriangle size={14} /> True</span> : <span className="text-green-500 flex items-center gap-1.5"><CheckCircle2 size={14} /> False</span>
                                                                    ) : (
                                                                        typeof v === 'number' ?
                                                                            (Number.isInteger(v) ? v : v.toLocaleString(undefined, { maximumFractionDigits: 2 }))
                                                                            : v
                                                                    )}
                                                                </span>
                                                            </div>
                                                        ))}
                                                </div>
                                            </div>

                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AIHub;
