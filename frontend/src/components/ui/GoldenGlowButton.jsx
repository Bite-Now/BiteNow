import React from 'react';

const GoldenGlowButton = ({ children, onClick, className = '', variant = 'primary', ...props }) => {
  // Base styling for the dark glass button
  const baseClasses = "relative overflow-hidden px-6 py-2.5 rounded-xl bg-black/60 backdrop-blur-md font-semibold tracking-wide flex items-center justify-center gap-2 active:scale-95 transition-all duration-300 ease-out group";
  
  // Primary (Gold) variant
  const primaryClasses = "border border-[#D4AF37]/40 text-[#D4AF37] hover:border-[#D4AF37]/80 hover:-translate-y-0.5";
  
  // Destructive (Crimson) variant
  const destructiveClasses = "border border-red-500/40 text-red-400 hover:border-red-500/80 hover:-translate-y-0.5";

  // Neutral (Subtle) variant
  const neutralClasses = "border border-white/20 text-white/80 hover:border-white/40 hover:text-white";

  const variantMap = {
    primary: primaryClasses,
    destructive: destructiveClasses,
    neutral: neutralClasses
  };

  const selectedClasses = variantMap[variant] || primaryClasses;

  return (
    <button 
      onClick={onClick}
      className={`${baseClasses} ${selectedClasses} ${className}`}
      {...props}
    >
      {/* Optional luxury shimmer effect that sweeps across on hover */}
      {variant === 'primary' && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#D4AF37]/10 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-700 ease-in-out pointer-events-none" />
      )}
      
      {variant === 'destructive' && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/10 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-700 ease-in-out pointer-events-none" />
      )}
      {variant === 'neutral' && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#D4AF37]/10 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-700 ease-in-out pointer-events-none" />
      )}
      

      <span className="relative z-10 flex items-center justify-center gap-1.5 w-full">
        {children}
      </span>
    </button>
  );
};

export default GoldenGlowButton;
