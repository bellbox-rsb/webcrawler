import React, { useEffect } from 'react';
import { cn } from '../../lib/utils';
import { X } from 'lucide-react';

export const Dialog = ({ open, onOpenChange, children }) => {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop Overlay */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
        onClick={() => onOpenChange && onOpenChange(false)}
      />
      {/* Dialog Body */}
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { onOpenChange });
        }
        return child;
      })}
    </div>
  );
};

export const DialogContent = ({ className, children, onOpenChange, ...props }) => {
  return (
    <div
      className={cn(
        "relative w-full max-w-2xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto glass-panel border border-white/10 rounded-2xl p-6 sm:p-8 text-slate-100",
        "animate-in zoom-in-95 duration-300 shadow-[0_10px_50px_rgba(0,0,0,0.8)]",
        className
      )}
      {...props}
    >
      {/* Close button */}
      <button
        onClick={() => onOpenChange && onOpenChange(false)}
        className="absolute top-4 right-4 sm:top-5 sm:right-5 text-slate-400 hover:text-white rounded-lg p-1.5 hover:bg-white/5 transition-all duration-200 cursor-pointer"
      >
        <X size={18} />
      </button>
      {children}
    </div>
  );
};

export const DialogHeader = ({ className, ...props }) => (
  <div className={cn("flex flex-col space-y-1.5 text-left mb-5", className)} {...props} />
);

export const DialogTitle = ({ className, ...props }) => (
  <h2 className={cn("text-lg sm:text-xl font-bold tracking-tight text-white", className)} {...props} />
);

export const DialogDescription = ({ className, ...props }) => (
  <p className={cn("text-xs sm:text-sm text-slate-400", className)} {...props} />
);
export const DialogClose = ({ onOpenChange, children, className, ...props }) => {
  return (
    <div onClick={() => onOpenChange && onOpenChange(false)} className={className} {...props}>
      {children}
    </div>
  );
};
export const DialogFooter = ({ className, ...props }) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6", className)} {...props} />
);
