// client/src/features/analytics/hooks/useCountUp.js
/**
 * Smooth count-up hook — easeOutCubic (Apple-like snappy feel).
 * Matches the Figma reference implementation.
 *
 * @param {number} target   - final value
 * @param {number} duration - milliseconds (default 1400)
 * @param {number} decimals - decimal places (default 0)
 */

import { useEffect, useRef, useState } from "react";

export default function useCountUp(target = 0, duration = 1400, decimals = 0) {
  const [value, setValue]  = useState(0);
  const frameRef           = useRef(null);
  const startTimeRef       = useRef(null);

  useEffect(() => {
    // Reset if target is 0
    if (target === 0) {
      setValue(0);
      return;
    }

    if (frameRef.current) cancelAnimationFrame(frameRef.current);

    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;

      const elapsed  = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const next  = parseFloat((eased * target).toFixed(decimals));

      setValue(next);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setValue(target);
      }
    };

    startTimeRef.current = null;
    frameRef.current     = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [target, duration, decimals]);

  return value;
}