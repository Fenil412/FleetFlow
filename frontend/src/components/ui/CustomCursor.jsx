import { useEffect, useRef, useState, useCallback } from 'react';
import { useTheme } from '../../context/ThemeContext';

/**
 * CustomCursor — theme-aware, same large size on ALL screen sizes.
 *
 * Dark  → indigo/violet glow ring + bright center dot
 * Light → deep indigo ring + dark center dot
 */

const SIZE = { ring: 56, dot: 14, border: 3 };

// Theme tokens
const THEME_TOKENS = {
    dark: {
        ringColor: 'rgba(99,102,241,0.75)',    // indigo-500 glow
        ringBorder: 'rgba(129,140,248,0.9)',   // indigo-400
        dotColor: '#a5b4fc',                    // indigo-300
        glowColor: 'rgba(99,102,241,0.35)',
        mixMode: 'screen',
    },
    light: {
        ringColor: 'rgba(79,70,229,0.18)',     // indigo-600 subtle
        ringBorder: 'rgba(79,70,229,0.9)',     // indigo-600
        dotColor: '#4338ca',                    // indigo-700
        glowColor: 'rgba(79,70,229,0.15)',
        mixMode: 'multiply',
    },
};

export default function CustomCursor() {
    const { theme } = useTheme();
    const ringRef = useRef(null);
    const dotRef = useRef(null);

    const [isPointer, setIsPointer] = useState(false);
    const [isPressed, setIsPressed] = useState(false);
    const [isHidden, setIsHidden] = useState(false);

    const mousePos = useRef({ x: -200, y: -200 });
    const ringPos = useRef({ x: -200, y: -200 });
    const rafId = useRef(null);

    // Smooth ring follow via rAF interpolation
    const animate = useCallback(() => {
        const ring = ringRef.current;
        if (!ring) return;

        const LERP = 0.13;
        ringPos.current.x += (mousePos.current.x - ringPos.current.x) * LERP;
        ringPos.current.y += (mousePos.current.y - ringPos.current.y) * LERP;

        ring.style.transform = `translate(${ringPos.current.x}px, ${ringPos.current.y}px) translate(-50%, -50%)`;
        rafId.current = requestAnimationFrame(animate);
    }, []);

    // Resize listener no longer needed for sizing but kept for future use
    useEffect(() => { }, []);

    // ── Inject cursor:none as a <style> tag — highest possible specificity ──
    useEffect(() => {
        const style = document.createElement('style');
        style.id = 'ff-cursor-none';
        style.textContent = `
            html, html *, html *::before, html *::after {
                cursor: none !important;
            }
        `;
        document.head.appendChild(style);
        // Also set directly on root elements for max browser compat
        document.documentElement.style.setProperty('cursor', 'none', 'important');
        document.body.style.setProperty('cursor', 'none', 'important');

        return () => {
            style.remove();
            document.documentElement.style.removeProperty('cursor');
            document.body.style.removeProperty('cursor');
        };
    }, []);

    // Mouse tracking — active on ALL screen sizes
    useEffect(() => {

        const onMove = (e) => {
            mousePos.current = { x: e.clientX, y: e.clientY };
            if (dotRef.current) {
                dotRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
            }
        };

        const onEnterLink = () => setIsPointer(true);
        const onLeaveLink = () => setIsPointer(false);
        const onDown = () => setIsPressed(true);
        const onUp = () => setIsPressed(false);
        const onLeave = () => setIsHidden(true);
        const onEnter = () => setIsHidden(false);

        window.addEventListener('mousemove', onMove, { passive: true });
        window.addEventListener('mousedown', onDown, { passive: true });
        window.addEventListener('mouseup', onUp, { passive: true });
        document.documentElement.addEventListener('mouseleave', onLeave);
        document.documentElement.addEventListener('mouseenter', onEnter);

        // Track hoverable elements for pointer cursor
        const observer = new MutationObserver(() => {
            document.querySelectorAll('a, button, [role="button"], input, select, textarea, label, [tabindex]')
                .forEach(el => {
                    el.addEventListener('mouseenter', onEnterLink);
                    el.addEventListener('mouseleave', onLeaveLink);
                });
        });
        observer.observe(document.body, { childList: true, subtree: true });

        // Initial pass
        document.querySelectorAll('a, button, [role="button"], input, select, textarea, label, [tabindex]')
            .forEach(el => {
                el.addEventListener('mouseenter', onEnterLink);
                el.addEventListener('mouseleave', onLeaveLink);
            });

        rafId.current = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mousedown', onDown);
            window.removeEventListener('mouseup', onUp);
            document.documentElement.removeEventListener('mouseleave', onLeave);
            document.documentElement.removeEventListener('mouseenter', onEnter);
            observer.disconnect();
            if (rafId.current) cancelAnimationFrame(rafId.current);
        };
    }, [animate]);

    const tok = THEME_TOKENS[theme] || THEME_TOKENS.dark;
    const { ring: ringSize, dot: dotSize, border } = SIZE;

    const scaleRing = isPointer ? 1.55 : isPressed ? 0.75 : 1;
    const scaleDot = isPointer ? 0.4 : isPressed ? 1.5 : 1;
    const opacity = isHidden ? 0 : 1;

    return (
        <>
            {/* ── Outer tracking ring ── */}
            <div
                ref={ringRef}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: ringSize,
                    height: ringSize,
                    borderRadius: '50%',
                    border: `${border}px solid ${tok.ringBorder}`,
                    background: tok.ringColor,
                    boxShadow: `0 0 16px 4px ${tok.glowColor}, inset 0 0 8px 2px ${tok.glowColor}`,
                    pointerEvents: 'none',
                    zIndex: 999999,
                    opacity,
                    transform: `translate(-200px, -200px) translate(-50%, -50%)`,
                    scale: scaleRing,
                    transition: 'scale 0.18s ease, opacity 0.2s ease, border-color 0.3s, background 0.3s, box-shadow 0.3s',
                    willChange: 'transform',
                    mixBlendMode: tok.mixMode,
                    backdropFilter: 'blur(1px)',
                }}
            />

            {/* ── Inner precision dot ── */}
            <div
                ref={dotRef}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: dotSize,
                    height: dotSize,
                    borderRadius: '50%',
                    background: tok.dotColor,
                    boxShadow: `0 0 8px 3px ${tok.glowColor}`,
                    pointerEvents: 'none',
                    zIndex: 1000000,
                    opacity,
                    transform: `translate(-200px, -200px) translate(-50%, -50%)`,
                    scale: scaleDot,
                    transition: 'scale 0.12s ease, opacity 0.2s ease, background 0.3s',
                    willChange: 'transform',
                }}
            />
        </>
    );
}
