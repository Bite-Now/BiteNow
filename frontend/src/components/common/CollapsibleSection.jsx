import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CollapsibleSection = ({ 
    title, 
    icon, 
    children, 
    defaultOpen = false,
    className = "" 
}) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className={`bg-surface-container-low dark:bg-surface-container-low backdrop-blur-xl border border-outline-variant/30 rounded-3xl overflow-hidden shadow-sm ${className}`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-5 cursor-pointer hover:bg-surface-container transition-colors active:scale-[0.99]"
            >
                <div className="flex items-center gap-3">
                    {icon && (
                        <span className="material-symbols-outlined text-primary text-[24px]">
                            {icon}
                        </span>
                    )}
                    <h3 className="font-headline-sm text-on-surface font-semibold m-0">{title}</h3>
                </div>
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-surface-container-highest/50">
                    <span 
                        className="material-symbols-outlined text-on-surface-variant transition-transform duration-300"
                        style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    >
                        keyboard_arrow_down
                    </span>
                </div>
            </button>

            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial="collapsed"
                        animate="expanded"
                        exit="collapsed"
                        variants={{
                            expanded: { opacity: 1, height: "auto", marginTop: 0 },
                            collapsed: { opacity: 0, height: 0, marginTop: 0 }
                        }}
                        transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                    >
                        <div className="px-5 pb-5 border-t border-outline-variant/10 pt-4">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CollapsibleSection;
