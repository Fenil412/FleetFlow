import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import LandingNavbar from './landing/LandingNavbar';
import HeroSection from './landing/HeroSection';
import StatsSection from './landing/StatsSection';
import TrustedSection from './landing/TrustedSection';
import FeaturesSection from './landing/FeaturesSection';
import ImageShowcaseSection from './landing/ImageShowcaseSection';
import DashboardPreview from './landing/DashboardPreview';
import HowItWorksSection from './landing/HowItWorksSection';
import CloudAISection from './landing/CloudAISection';
import LiveStatusSection from './landing/LiveStatusSection';
import TestimonialsSection from './landing/TestimonialsSection';
import PricingSection from './landing/PricingSection';
import CTASection from './landing/CTASection';
import LandingFooter from './landing/LandingFooter';

/* ── Cursor Spotlight ──────────────────────────────────────── */
const CursorSpotlight = () => {
    const ref = useRef(null);

    useEffect(() => {
        const move = (e) => {
            if (ref.current) {
                ref.current.style.left = `${e.clientX}px`;
                ref.current.style.top = `${e.clientY}px`;
            }
        };
        window.addEventListener('mousemove', move);
        return () => window.removeEventListener('mousemove', move);
    }, []);

    return (
        <div
            ref={ref}
            className="fixed pointer-events-none z-0 -translate-x-1/2 -translate-y-1/2 transition-[left,top] duration-100 ease-out"
            style={{
                width: 500,
                height: 500,
                background: 'radial-gradient(circle, rgb(var(--color-primary) / 0.055) 0%, transparent 70%)',
                borderRadius: '50%',
            }}
        />
    );
};

const LandingPage = () => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="min-h-screen bg-background overflow-x-hidden relative"
    >
        <CursorSpotlight />
        <LandingNavbar />
        <main>
            <HeroSection />
            <StatsSection />
            <TrustedSection />
            <FeaturesSection />
            <ImageShowcaseSection />
            <DashboardPreview />
            <HowItWorksSection />
            <CloudAISection />
            <LiveStatusSection />
            <TestimonialsSection />
            <PricingSection />
            <CTASection />
        </main>
        <LandingFooter />
    </motion.div>
);

export default LandingPage;
