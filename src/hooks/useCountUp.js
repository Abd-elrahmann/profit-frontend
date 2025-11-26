import { useEffect, useState } from 'react';
import { useMotionValue, useSpring, useTransform } from 'framer-motion';

// eslint-disable-next-line no-unused-vars
export const useCountUp = (end = 0, duration = 400, enabled = true) => {
  const [displayValue, setDisplayValue] = useState(0);
  const motionValue = useMotionValue(0);
  
  // إعدادات سبرنج محسنة للسرعة مع الحفاظ على السلاسة
  const spring = useSpring(motionValue, {
    stiffness: 120, // زيادة الصلابة للسرعة
    damping: 25,    // تقليل التخميد للسرعة
    mass: 0.5,      // تقليل الكتلة للاستجابة الأسرع
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

    // بدء الأنيميشن فوراً بدون تأخير
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