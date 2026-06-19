import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import GlassInput from '../../components/ui/GlassInput';
import GoldenGlowButton from '../../components/ui/GoldenGlowButton';

const PersonalProfile = () => {
    const { currentUser, refreshUser } = useContext(AuthContext);
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (currentUser) {
            setFullName(currentUser.full_name || '');
            setPhone(currentUser.phone || '');
        }
    }, [currentUser]);

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await api.patch('/auth/me', {
                full_name: fullName,
                phone: phone
            });
            await refreshUser(); // refresh user context
            alert('Profile updated successfully!');
        } catch (err) {
            console.error('Failed to update profile:', err);
            alert('Failed to update profile.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <section className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-[#1c1b1b] rounded-[24px] p-5 shadow-lg mx-2 mb-8">
                <h2 className="font-title-md text-primary mb-6">Personal Information</h2>
                
                <form onSubmit={handleSave} className="flex flex-col gap-5">
                    <GlassInput 
                        label="Full Name" 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                    />

                    <GlassInput 
                        label="Phone Number" 
                        type="tel" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                    />
                    
                    <div className="pt-6">
                        <GoldenGlowButton type="submit" className="w-full" disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </GoldenGlowButton>
                    </div>
                </form>
            </div>
        </section>
    );
};

export default PersonalProfile;
