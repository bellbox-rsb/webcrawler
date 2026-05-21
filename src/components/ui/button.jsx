import React from 'react';
import { cn } from '../../lib/utils';

export const Button = React.forwardRef(({ 
  className, 
  variant = 'default', 
  size = 'default', 
  ...props 
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/50 disabled:opacity-50 disabled:pointer-events-none cursor-pointer';
  
  const variants = {
    default: 'bg-gradient-to-r from-accent-primary to-purple-600 text-white shadow-[0_4px_15px_rgba(138,43,226,0.3)] hover:shadow-[0_6px_20px_rgba(138,43,226,0.5)] hover:-translate-y-0.5 active:translate-y-0 relative overflow-hidden group',
    secondary: 'bg-gradient-to-r from-emerald-500 to-accent-secondary text-slate-950 font-bold shadow-[0_4px_15px_rgba(0,255,127,0.3)] hover:shadow-[0_6px_20px_rgba(0,255,127,0.5)] hover:-translate-y-0.5 active:translate-y-0',
    glass: 'bg-white/5 border border-white/8 text-slate-200 hover:bg-white/10 hover:text-white hover:border-white/15',
    outline: 'border border-accent-primary/30 bg-transparent text-purple-400 hover:bg-accent-primary/10 hover:text-purple-300 hover:border-accent-primary/60',
    ghost: 'text-slate-400 hover:bg-white/5 hover:text-white',
    danger: 'bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/60'
  };

  const sizes = {
    default: 'h-10 px-5 py-2 text-sm',
    sm: 'h-8 rounded-md px-3 py-1.5 text-xs',
    lg: 'h-12 rounded-xl px-8 py-3 text-base',
    icon: 'h-10 w-10 rounded-lg',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      ref={ref}
      {...props}
    >
      {props.children}
      {variant === 'default' && (
        <div className="absolute top-0 -left-full w-1/2 h-full bg-gradient-to-r from-white/0 to-white/20 skew-x-[-25deg] transition-all duration-700 group-hover:left-[125%]" />
      )}
    </button>
  );
});

Button.displayName = 'Button';
