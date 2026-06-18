import React from 'react';

const GlassModal = ({ title, children, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      {/* Background click to close */}
      <div className="absolute inset-0" onClick={onClose}></div>
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md rounded-3xl bg-neutral-900/60 backdrop-blur-xl border border-white/10 p-6 md:p-8 shadow-2xl overflow-hidden">
        {/* Subtle top glare effect */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        
        {title && (
          <h2 className="text-xl font-medium text-white mb-6 text-center">
            {title}
          </h2>
        )}
        
        <div className="space-y-4">
          {children}
        </div>
        
        {/* Close button (optional, if we want an X in top right) */}
        {onClose && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default GlassModal;
