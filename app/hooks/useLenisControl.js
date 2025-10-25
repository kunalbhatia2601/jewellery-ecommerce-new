import { useEffect } from 'react';
import { useLenis } from '../components/SmoothScroll';

/**
 * Custom hook to control Lenis smooth scroll
 * Automatically stops Lenis when a condition is true (e.g., modal is open)
 * and restarts it when the condition becomes false
 * 
 * @param {boolean} shouldStop - Condition to stop Lenis (e.g., isModalOpen)
 * 
 * @example
 * // In a modal component
 * useLenisControl(isModalOpen);
 */
export function useLenisControl(shouldStop) {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;

    if (shouldStop) {
      lenis.stop();
    } else {
      lenis.start();
    }

    // Cleanup: always restart on unmount
    return () => {
      if (lenis) {
        lenis.start();
      }
    };
  }, [shouldStop, lenis]);
}
