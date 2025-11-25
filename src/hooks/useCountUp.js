import { useEffect, useState } from 'react';
import { useMotionValue, useSpring, useTransform } from 'framer-motion';

/**
 * Hook for smooth animated counter using framer-motion
 * @param {number} end - Target value
 * @param {number} duration - Animation duration in ms (default: 600)
 * @param {boolean} enabled - Whether animation is enabled (default: true)
 * @returns {number} - Current animated value
 */
export const useCountUp = (end = 0, duration = 600, enabled = true) => {
  const [displayValue, setDisplayValue] = useState(0);
  const motionValue = useMotionValue(0);
  
  // Optimized spring settings for ultra-smooth animation
  // Lower stiffness and damping = smoother, longer animation
  const spring = useSpring(motionValue, {
    stiffness: 50,
    damping: 20,
    mass: 0.8,
    restDelta: 0.0001,
  });

  // Use transform to round smoothly without jumps
  const roundedValue = useTransform(spring, (latest) => {
    return Math.round(latest);
  });

  useEffect(() => {
    if (!enabled) {
      setDisplayValue(end);
      motionValue.set(end);
      return;
    }

    // Reset to 0 and animate to end smoothly
    motionValue.set(0);
    const timeout = setTimeout(() => {
      motionValue.set(end);
    }, 10);

    return () => clearTimeout(timeout);
  }, [end, enabled, motionValue]);

  useEffect(() => {
    const unsubscribe = roundedValue.on('change', (latest) => {
      setDisplayValue(latest);
    });

    return () => unsubscribe();
  }, [roundedValue]);

  // Suppress unused parameter warning
  if (duration) {
    // Duration is kept for API compatibility but spring physics handle timing
  }

  return displayValue;
};

