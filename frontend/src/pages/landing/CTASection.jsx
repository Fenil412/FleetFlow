import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, LogIn } from 'lucide-react';

const MagneticButton = ({ children, onClick, className }) => {
    const ref = useRef(null);

    const handleMouseMove = (e) => {
        const rect = ref.current.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) * 0.25;
        const y = (e.clientY - rect.top - rect.height / 2) * 0.25;
        ref.current.style.transform = `translate(${x}px, ${y}px)`;
    };
    const handleMouseLeave = () => {
        ref.current.style.transform = 'translate(0, 0)';
    };

    return (
        <motion.button
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            whileTap={{ scale: 0.96 }}
            onClick={onClick}
            style={{ transition: 'transform 0.2s ease' }}
            className={className}
        >
            {children}
        </motion.button>
    );
};

const CTASection = () => {
    const navigate = useNavigate();

    return (
        <section className="py-24 lg:py-32 relative overflow-hidden">
            {/* Gradient bg */}
            <div className="absolute inset-0 bg-gradient-to-br from-navy via-primary/20 to-violet-900/30" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgb(var(--color-primary)/0.12)_0%,_transparent_70%)]" />

            {/* Floating orbs */}
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none animate-float" />
            <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl pointer-events-none animate-float-slow" />

            <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 0.7 }}
                >
                    <p className="text-xs font-black uppercase tracking-[0.25em] text-primary mb-4">Get Started Today</p>
                    <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
                        Transform Your Fleet<br />
                        <span className="gradient-text">Operations Now</span>
                    </h2>
                    <p className="text-lg text-white/60 max-w-xl mx-auto mb-12 leading-relaxed">
                        Join fleet managers who use FleetFlow to reduce costs, improve safety, and gain total operational visibility.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
                        <MagneticButton
                            onClick={() => navigate('/signup')}
                            className="group flex items-center gap-3 px-10 py-4 bg-primary text-white font-bold text-base rounded-2xl shadow-2xl shadow-primary/40 hover:bg-primary/90 transition-colors"
                        >
                            <span>Create Free Account</span>
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </MagneticButton>

                        <MagneticButton
                            onClick={() => navigate('/login')}
                            className="flex items-center gap-3 px-10 py-4 border border-white/20 text-white font-semibold text-base rounded-2xl hover:bg-white/10 backdrop-blur-sm transition-colors"
                        >
                            <LogIn size={18} />
                            <span>Sign In</span>
                        </MagneticButton>
                    </div>

                    <p className="mt-8 text-xs text-white/40">
                        No credit card required  ·  Full access from day one  ·  Cancel anytime
                    </p>
                </motion.div>
            </div>
        </section>
    );
};

export default CTASection;
