import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import GlassModal from '../../components/ui/GlassModal';
import GlassInput from '../../components/ui/GlassInput';
import GoldenGlowButton from '../../components/ui/GoldenGlowButton';

const VendorStaff = () => {
    const [staff, setStaff] = useState([]);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteData, setInviteData] = useState({
        full_name: '',
        email: '',
    });
    const [isLoading, setIsLoading] = useState(true);
    const [toastMessage, setToastMessage] = useState(null);

    const showToast = (message, type = 'success') => {
        setToastMessage({ message, type });
        setTimeout(() => setToastMessage(null), 3000);
    };

    const fetchStaff = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/owner/staff');
            setStaff(response.data);
        } catch (error) {
            console.error("Failed to fetch staff:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStaff();
    }, []);

    const handleSendInvite = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/owner/staff/invite', inviteData);
            setStaff([...staff, response.data]);
            setShowInviteModal(false);
            setInviteData({
                full_name: '',
                email: '',
            });
            showToast('Invitation sent successfully!');
        } catch (error) {
            console.error('Failed to invite staff:', error);
            showToast('Failed to send invitation', 'error');
        }
    };

    const handleRevoke = async (id) => {
        try {
            await api.delete(`/owner/staff/${id}`);
            setStaff(staff.filter(member => member.id !== id));
            showToast('Staff access revoked!');
        } catch (error) {
            console.error('Failed to revoke access:', error);
            showToast('Failed to revoke access', 'error');
        }
    };

    return (
        <div className="flex flex-col gap-6 w-full pb-32 pt-6 px-4 relative">
            {/* Toast Notification */}
            {toastMessage && (
                <div className={`absolute top-0 right-4 z-50 px-4 py-2 mt-4 rounded-lg font-medium shadow-lg transition-all duration-200 ${toastMessage.type === 'success' ? 'bg-[#22c55e] text-white' : 'bg-[#ef4444] text-white'}`}>
                    {toastMessage.message}
                </div>
            )}

            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="font-display-sm text-on-surface">
                        Role Management
                    </h1>
                    <p className="text-on-surface-variant text-sm">
                        Manage staff access
                    </p>
                </div>

                <div className="flex-shrink-0">
                    <GoldenGlowButton
                        onClick={() => setShowInviteModal(true)}
                        className="py-2 px-4 h-auto text-sm"
                    >
                        <span className="material-symbols-outlined text-[18px]">
                            person_add
                        </span>
                        <span className="hidden sm:inline">Add Staff</span>
                    </GoldenGlowButton>
                </div>
            </div>

            {/* Staff List */}
            <div className="flex flex-col gap-3 mt-2">
                {isLoading ? (
                    [1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="bg-surface-container rounded-xl p-4 shadow-sm border border-outline-variant/20 flex flex-col gap-3 animate-pulse"
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-surface-variant"></div>

                                    <div className="flex flex-col gap-2">
                                        <div className="h-4 w-32 bg-surface-variant rounded"></div>
                                        <div className="h-3 w-20 bg-surface-variant rounded"></div>
                                    </div>
                                </div>

                                <div className="h-5 w-16 bg-surface-variant rounded"></div>
                            </div>

                            <div className="flex gap-2 mt-1">
                                <div className="h-9 flex-1 bg-surface-variant rounded-lg"></div>
                                <div className="h-9 flex-1 bg-surface-variant rounded-lg"></div>
                            </div>
                        </div>
                    ))
                ) : (
                    staff.map((member) => (
                        <div
                            key={member.id}
                            className="bg-surface-container rounded-xl p-4 shadow-sm border border-outline-variant/20 flex flex-col gap-3"
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center text-on-surface-variant font-bold text-lg border border-outline-variant/50">
                                        {member.full_name?.charAt(0) || '?'}
                                    </div>

                                    <div>
                                        <h4 className="text-on-surface font-bold text-lg">
                                            {member.full_name}
                                        </h4>
                                        <p className="text-on-surface-variant text-sm">
                                            {member.role}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    {member.is_active ? (
                                        <span className="bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/20 text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md">
                                            Active
                                        </span>
                                    ) : (
                                        <span className="bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/20 text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md">
                                            Invited
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-2 mt-1">
                                {!member.is_active && (
                                    <GoldenGlowButton
                                        variant="neutral"
                                        className="flex-1 py-2 text-sm h-10"
                                    >
                                        Resend Link
                                    </GoldenGlowButton>
                                )}

                                <GoldenGlowButton
                                    variant="destructive"
                                    className="flex-1 py-2 text-sm h-10"
                                    onClick={() => handleRevoke(member.id)}
                                >
                                    Revoke Access
                                </GoldenGlowButton>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Staff Invitation Modal */}
            <GlassModal
                isOpen={showInviteModal}
                onClose={() => setShowInviteModal(false)}
                title="Invite Staff Member"
            >
                <form
                    onSubmit={handleSendInvite}
                    className="flex flex-col gap-4"
                >
                    <GlassInput
                        label="Full Name"
                        required
                        value={inviteData.full_name}
                        onChange={(e) =>
                            setInviteData({
                                ...inviteData,
                                full_name: e.target.value,
                            })
                        }
                    />

                    <GlassInput
                        label="Email Address"
                        type="email"
                        required
                        value={inviteData.email}
                        onChange={(e) =>
                            setInviteData({
                                ...inviteData,
                                email: e.target.value,
                            })
                        }
                    />



                    <div className="pt-2">
                        <GoldenGlowButton
                            type="submit"
                            className="w-full"
                        >
                            Send Invitation
                        </GoldenGlowButton>
                    </div>
                </form>
            </GlassModal>
        </div>
    );
};

export default VendorStaff;