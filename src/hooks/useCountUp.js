import { useEffect, useState } from 'react';
import { useMotionValue, useSpring, useTransform } from 'framer-motion';
export const useCountUp = (end = 0, _duration = 400, enabled = true) => {
  const [displayValue, setDisplayValue] = useState(0);
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, {
    stiffness: 120,
    damping: 25,
    mass: 0.5,
    restDelta: 0.001,
  });
  const roundedValue = useTransform(spring, (latest) => {
    return Math.round(latest);
  });
  useEffect(() => {
    if (!enabled) {
      setDisplayValue(end);
      motionValue.set(end);
      return;
    }
    motionValue.set(0);
    motionValue.set(end);
  }, [end, enabled, motionValue]);
  useEffect(() => {
    const unsubscribe = roundedValue.on('change', (latest) => {
      setDisplayValue(latest);
    });
    return () => unsubscribe();
  }, [roundedValue]);
  return displayValue;
};