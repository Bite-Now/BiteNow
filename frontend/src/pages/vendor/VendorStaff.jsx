import React, { useState } from 'react';
import { vendorStaff } from '../../data/mockVendorData';

const VendorStaff = () => {
    const [staff, setStaff] = useState(vendorStaff);

    return (
        <div className="flex flex-col gap-6 w-full h-full pb-28 pt-6 px-4 overflow-y-auto no-scrollbar">
            
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="font-display-sm text-on-surface">Role Management</h1>
                    <p className="text-on-surface-variant text-sm">Manage staff access</p>
                </div>
                <button className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-sm hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined">person_add</span>
                </button>
            </div>

            {/* Staff List */}
            <div className="flex flex-col gap-3 mt-2">
                {staff.map(member => (
                    <div key={member.id} className="bg-surface-container rounded-xl p-4 shadow-sm border border-outline-variant/20 flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center text-on-surface-variant font-bold text-lg border border-outline-variant/50">
                                    {member.name.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="text-on-surface font-bold text-lg">{member.name}</h4>
                                    <p className="text-on-surface-variant text-sm">{member.role}</p>
                                </div>
                            </div>
                            
                            <div>
                                {member.status === 'Active' ? (
                                    <span className="bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/20 text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md">
                                        Active
                                    </span>
                                ) : (
                                    <span className="bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/20 text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md">
                                        Pending Reset
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-2 mt-1">
                            {member.status === 'Pending Reset' ? (
                                <button className="flex-1 py-2 rounded-lg bg-surface text-on-surface border border-outline-variant/50 font-medium text-sm hover:bg-surface-variant transition-colors">
                                    Resend Link
                                </button>
                            ) : null}
                            <button className="flex-1 py-2 rounded-lg bg-surface text-error border border-error/20 font-medium text-sm hover:bg-error/10 transition-colors">
                                Revoke Access
                            </button>
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
};

export default VendorStaff;
