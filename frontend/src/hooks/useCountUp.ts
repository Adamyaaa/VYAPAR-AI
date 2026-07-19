import { useEffect, useState } from 'react';
import { animate } from 'framer-motion';

/**
 * Animates a number counting up to `target` on mount / whenever target changes.
 * Respects prefers-reduced-motion by jumping straight to the final value.
 */
export function useCountUp(target: number, duration = 1): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      setValue(target);
      return;
    }
    const controls = animate(0, target, {
      duration,
      ease: 'easeOut',
      onUpdate: (v) => setValue(Math.round(v)),
    });
    return () => controls.stop();
  }, [target, duration]);

  return value;
}
