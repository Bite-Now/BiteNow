import React, { useState } from 'react';
import { SignUp as ClerkSignUp } from '@clerk/clerk-react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import GlassModal from '../components/ui/GlassModal';
import GlassInput from '../components/ui/GlassInput';
import GlassButton from '../components/ui/GlassButton';

const SignUp = () => {
    const [showVendorModal, setShowVendorModal] = useState(false);
    const [vendorData, setVendorData] = useState({ name: '', email: '', phone: '', canteen: '', location: '' });

    const handleVendorRequest = async (e) => {
        e.preventDefault();
        try {
            await api.post('/vendor/apply', {
                full_name: vendorData.name,
                email: vendorData.email,
                canteen_name: vendorData.canteen,
                location: vendorData.location,
                phone: vendorData.phone
            });
            console.log('Vendor Request Submitted Successfully');
            setShowVendorModal(false);
            setVendorData({ name: '', email: '', phone: '', canteen: '', location: '' });
            alert("Application submitted successfully!");
        } catch (error) {
            console.error('Failed to submit vendor request:', error);
            alert("Failed to submit application. Please try again.");
        }
    };

    return (
        <div className="bg-[#121212] text-white font-sans min-h-screen flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-[400px] relative z-10 flex flex-col items-center">
                <ClerkSignUp 
                    routing="path" 
                    path="/signup" 
                    signInUrl="/login" 
                    fallbackRedirectUrl="/"
                />
                
                {/* Vendor Link preserved outside the Clerk component */}
                <div className="mt-6 flex items-center justify-center">
                    <button 
                        type="button"
                        onClick={() => setShowVendorModal(true)}
                        className="text-[14px] text-[#3B82F6] hover:text-[#60A5FA] font-medium hover:underline transition-colors focus:outline-none"
                    >
                        Request to join as a vendor
                    </button>
                </div>
            </div>

            <GlassModal 
                isOpen={showVendorModal} 
                onClose={() => setShowVendorModal(false)}
                title="Vendor Request"
            >
                <form onSubmit={handleVendorRequest} className="flex flex-col gap-4">
                    <GlassInput 
                        label="Full Name" 
                        required 
                        value={vendorData.name}
                        onChange={(e) => setVendorData({...vendorData, name: e.target.value})}
                    />
                    <GlassInput 
                        label="Email Address" 
                        type="email" 
                        required 
                        value={vendorData.email}
                        onChange={(e) => setVendorData({...vendorData, email: e.target.value})}
                    />
                    <GlassInput 
                        label="Phone Number" 
                        type="tel"
                        value={vendorData.phone}
                        onChange={(e) => setVendorData({...vendorData, phone: e.target.value})}
                    />
                    <GlassInput 
                        label="Canteen Name" 
                        required 
                        value={vendorData.canteen}
                        onChange={(e) => setVendorData({...vendorData, canteen: e.target.value})}
                    />
                    <GlassInput 
                        label="Location" 
                        required 
                        value={vendorData.location}
                        onChange={(e) => setVendorData({...vendorData, location: e.target.value})}
                    />
                    <div className="pt-2">
                        <GlassButton type="submit">
                            Request Access
                        </GlassButton>
                    </div>
                </form>
            </GlassModal>
        </div>
    );
};

export default SignUp;