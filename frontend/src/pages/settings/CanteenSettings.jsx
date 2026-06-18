import React from 'react';
import GlassInput from '../../components/ui/GlassInput';
import GoldenGlowButton from '../../components/ui/GoldenGlowButton';

const CanteenSettings = () => {
    const handleSave = (e) => {
        e.preventDefault();
        // Mock save
    };

    return (
        <section className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-[#1c1b1b] rounded-[24px] p-5 shadow-lg mx-2 mb-8">
                <h2 className="font-title-md text-primary mb-6">Canteen Information</h2>
                
                <form onSubmit={handleSave} className="flex flex-col gap-5">
                    <GlassInput label="Canteen Name" defaultValue="My Canteen" />
                    <GlassInput label="Canteen Description" defaultValue="Serving the best food." />
                    
                    <div className="flex flex-col gap-2 mt-2">
                        <span className="font-label-sm text-on-surface-variant px-1 uppercase tracking-wider text-[10px]">Canteen Status</span>
                        <div className="flex gap-2">
                            <label className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border border-primary/30 bg-primary/10 cursor-pointer active:scale-95 transition-transform">
                                <input type="radio" name="status" value="open" defaultChecked className="accent-primary" />
                                <span className="font-label-md text-primary font-bold">Open</span>
                            </label>
                            <label className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border border-outline-variant/30 bg-surface cursor-pointer active:scale-95 transition-transform">
                                <input type="radio" name="status" value="closed" className="accent-primary" />
                                <span className="font-label-md text-on-surface-variant font-bold">Closed</span>
                            </label>
                        </div>
                    </div>
                    
                    <div className="pt-6">
                        <GoldenGlowButton type="submit" className="w-full">
                            Save Canteen
                        </GoldenGlowButton>
                    </div>
                </form>
            </div>
        </section>
    );
};

export default CanteenSettings;
