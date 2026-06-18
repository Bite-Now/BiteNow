import React, { useState } from 'react';
import { SignUp as ClerkSignUp } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import GlassModal from '../components/ui/GlassModal';
import GlassInput from '../components/ui/GlassInput';
import GlassButton from '../components/ui/GlassButton';

const SignUp = () => {
    const [showVendorModal, setShowVendorModal] = useState(false);
    const [vendorData, setVendorData] = useState({ name: '', email: '', phone: '', canteen: '' });

    const handleVendorRequest = (e) => {
        e.preventDefault();
        console.log('Vendor Request Submitted:', vendorData);
        setShowVendorModal(false);
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