import React from 'react';
import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

const LandingFooter = () => (
    <footer className="bg-navy border-t border-border/30 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Brand */}
                <div className="flex items-center gap-2">
                    <Zap size={18} className="text-primary" />
                    <span className="text-lg font-black gradient-text">FleetFlow</span>
                    <span className="text-xs text-white/30 ml-2 font-mono">v1.0</span>
                </div>

                {/* Links */}
                <div className="flex items-center gap-6 text-xs text-white/40 font-medium">
                    <Link to="/login" className="hover:text-white/70 transition-colors">Sign In</Link>
                    <Link to="/signup" className="hover:text-white/70 transition-colors">Sign Up</Link>
                    <span>React + Vite</span>
                    <span>•</span>
                    <span>Node.js + FastAPI</span>
                </div>

                {/* Copyright */}
                <p className="text-xs text-white/30">
                    © 2026 FleetFlow. Cloud-Native Fleet Intelligence.
                </p>
            </div>
        </div>
    </footer>
);

export default LandingFooter;
