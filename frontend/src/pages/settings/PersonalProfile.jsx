import React from 'react';
import { useUser } from '@clerk/clerk-react';
import GlassInput from '../../components/ui/GlassInput';
import GoldenGlowButton from '../../components/ui/GoldenGlowButton';

const PersonalProfile = () => {
    const { user } = useUser();

    const handleSave = (e) => {
        e.preventDefault();
        // Mock save
    };

    return (
        <section className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-[#1c1b1b] rounded-[24px] p-5 shadow-lg mx-2 mb-8">
                <h2 className="font-title-md text-primary mb-6">Personal Information</h2>
                
                <form onSubmit={handleSave} className="flex flex-col gap-5">
                    <GlassInput 
                        label="Full Name" 
                        defaultValue={user?.firstName ? `${user.firstName} ${user.lastName}` : ''}
                    />

                    <GlassInput 
                        label="Phone Number" 
                        type="tel" 
                        defaultValue="" 
                    />
                    
                    <div className="pt-6">
                        <GoldenGlowButton type="submit" className="w-full">
                            Save Changes
                        </GoldenGlowButton>
                    </div>
                </form>
            </div>
        </section>
    );
};

export default PersonalProfile;
