import React, { useState } from 'react';
import { cn } from '../../lib/utils';

export const TooltipProvider = ({ children }) => <>{children}</>;

export const Tooltip = ({ children }) => {
  const [open, setOpen] = useState(false);
  
  return (
    <div 
      className="relative inline-flex items-center"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { open });
        }
        return child;
      })}
    </div>
  );
};

export const TooltipTrigger = ({ children, className, open, ...props }) => {
  return (
    <div className={cn("inline-flex items-center cursor-help", className)} {...props}>
      {children}
    </div>
  );
};

export const TooltipContent = ({ className, children, open, ...props }) => {
  if (!open) return null;

  return (
    <div
      className={cn(
        "absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 w-60 p-3 rounded-lg z-50 text-left text-xs leading-relaxed text-slate-200",
        "glass-panel border border-white/10 shadow-[0_10px_25px_rgba(0,0,0,0.5)] pointer-events-none transition-all duration-200",
        "animate-in fade-in slide-in-from-bottom-1 duration-200",
        className
      )}
      {...props}
    >
      {children}
      {/* Tooltip Arrow */}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-x-[5px] border-x-transparent border-t-[5px] border-t-white/10" />
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-x-[4px] border-x-transparent border-t-[4px] border-t-bg-deep/95" />
    </div>
  );
};
