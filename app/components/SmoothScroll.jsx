'use client';

import { useEffect, useRef, createContext, useContext } from 'react';
import Lenis from 'lenis';

// Create context to share Lenis instance
const LenisContext = createContext(null);

export const useLenis = () => useContext(LenisContext);

export default function SmoothScroll({ children }) {
  const lenisRef = useRef(null);

  useEffect(() => {
    // Initialize Lenis with enhanced smooth scrolling options
    const lenis = new Lenis({
      duration: 1.2, // Duration of smooth scroll animation (higher = smoother but slower)
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Custom easing for ultra smooth feel
      orientation: 'vertical', // Vertical scrolling
      gestureOrientation: 'vertical', // Gesture orientation
      smoothWheel: true, // Enable smooth scrolling for mouse wheel
      wheelMultiplier: 1, // Mouse wheel scroll speed multiplier
      smoothTouch: true, // Enable smooth scrolling for touch devices (ENABLED!)
      touchMultiplier: 2, // Touch scroll speed multiplier for mobile
      touchInertiaMultiplier: 35, // Touch inertia for buttery smooth mobile scrolling
      infinite: false, // Disable infinite scrolling
      autoResize: true, // Automatically resize on window resize
      syncTouch: true, // Sync touch events for even smoother touch experience
    });

    lenisRef.current = lenis;

    // Request animation frame loop for smooth scrolling
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Add Lenis class to html element for styling hooks
    document.documentElement.classList.add('lenis');

    // Cleanup on unmount
    return () => {
      lenis.destroy();
      document.documentElement.classList.remove('lenis');
    };
  }, []);

  return (
    <LenisContext.Provider value={lenisRef.current}>
      {children}
    </LenisContext.Provider>
  );
}
