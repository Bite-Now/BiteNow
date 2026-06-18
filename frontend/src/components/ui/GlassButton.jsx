import React from 'react';

const GlassButton = ({ children, className = '', ...props }) => {
  return (
    <button
      className={`relative w-full group overflow-hidden rounded-xl p-[1px] transition-all hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-[0.98] ${className}`}
      {...props}
    >
      {/* Outer gradient border (optional subtle glow) */}
      <span className="absolute inset-0 bg-gradient-to-b from-white/30 to-white/5 opacity-50"></span>
      
      {/* Button background */}
      <div className="relative flex items-center justify-center h-12 w-full bg-gradient-to-b from-neutral-200 to-neutral-400 rounded-xl px-6 py-2 transition-all group-hover:from-white group-hover:to-neutral-300">
        <span className="text-black font-semibold tracking-wide shadow-sm">
          {children}
        </span>
      </div>
    </button>
  );
};

export default GlassButton;
