import React from 'react';

const GlassInput = ({ label, required, className = '', ...props }) => {
  return (
    <div className={`relative ${className}`}>
      {/* Background layer */}
      <div className="absolute inset-0 bg-white/[0.06] rounded-xl border border-white/10 pointer-events-none transition-colors peer-focus:border-white/30"></div>
      
      <div className="relative flex items-center px-4 py-3">
        <input
          className="peer w-full bg-transparent text-white placeholder-white/40 focus:outline-none focus:ring-0 text-sm"
          placeholder={label}
          required={required}
          {...props}
        />
        
        {required && (
          <span className="text-white/40 text-xs font-medium ml-2 whitespace-nowrap select-none">
            *Required
          </span>
        )}
      </div>
    </div>
  );
};

export default GlassInput;
