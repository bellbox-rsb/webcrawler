import React from 'react';
import { cn } from '../../lib/utils';

export const Slider = React.forwardRef(({ 
  className, 
  min = 0, 
  max = 100, 
  step = 1, 
  value, 
  onChange, 
  disabled, 
  ...props 
}, ref) => {
  return (
    <div className={cn("relative w-full flex items-center select-none", className)}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        disabled={disabled}
        ref={ref}
        className={cn(
          "w-full h-1.5 rounded-lg appearance-none outline-none transition-all duration-300",
          "bg-white/10 accent-accent-secondary disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
          // custom slider styling via inline Tailwind rules or webkit triggers
          "slider-range-input",
          disabled ? "opacity-50 pointer-events-none" : "hover:bg-white/15"
        )}
        style={{
          background: `linear-gradient(to right, var(--color-accent-secondary) 0%, var(--color-accent-secondary) ${((value - min) / (max - min)) * 100}%, rgba(255, 255, 255, 0.1) ${((value - min) / (max - min)) * 100}%, rgba(255, 255, 255, 0.1) 100%)`
        }}
        {...props}
      />
    </div>
  );
});

Slider.displayName = 'Slider';
