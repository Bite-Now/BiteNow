import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';
import { Search, X, CheckCircle, XCircle, FileText, Phone, Mail, Building, MapPin } from 'lucide-react';

const VendorRequests = () => {
  const { getToken } = useAuth();
  
  // State
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch applications
  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const token = await getToken();
      const response = await axios.get('http://localhost:8000/admin/vendor-applications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApplications(response.data);
    } catch (error) {
      console.error('Error fetching vendor applications:', error);
      showToast('Failed to load applications', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [getToken]);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Actions
  const handleApprove = async (id) => {
    setIsProcessing(true);
    try {
      const token = await getToken();
      await axios.patch(`http://localhost:8000/admin/vendor-applications/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast('Vendor approved successfully!');
      setSelectedApp(null);
      fetchApplications(); // Refresh list
    } catch (error) {
      console.error('Error approving application:', error);
      showToast(error.response?.data?.detail || 'Failed to approve vendor', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (id) => {
    setIsProcessing(true);
    try {
      const token = await getToken();
      await axios.patch(`http://localhost:8000/admin/vendor-applications/${id}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast('Vendor application rejected.');
      setSelectedApp(null);
      fetchApplications(); // Refresh list
    } catch (error) {
      console.error('Error rejecting application:', error);
      showToast(error.response?.data?.detail || 'Failed to reject vendor', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">Pending</span>;
      case 'APPROVED':
        return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-green-500/10 text-green-500 border border-green-500/20">Approved</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-red-500/10 text-red-500 border border-red-500/20">Rejected</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-500/10 text-gray-400 border border-gray-500/20">{status}</span>;
    }
  };

  return (
    <div className="h-full flex flex-col relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`absolute top-0 right-0 z-50 px-4 py-2 rounded-lg font-medium shadow-lg transition-all duration-200 ${toastMessage.type === 'success' ? 'bg-[#22c55e] text-white' : 'bg-[#ef4444] text-white'}`}>
          {toastMessage.message}
        </div>
      )}

      {/* Main Content */}
      <div className="bg-[#1a1a1a] rounded-lg border border-[#2e2e2e] flex-1 overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="px-6 py-4 border-b border-[#2e2e2e] flex justify-between items-center bg-[#1a1a1a]">
          <h3 className="text-white font-semibold">Pending Applications</h3>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-[#888888]" />
            <input 
              type="text" 
              placeholder="Search applications..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#0f0f0f] border border-[#2e2e2e] text-sm text-white rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-[#ff9f43] transition-colors w-64"
            />
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-8 text-center text-[#888888] animate-pulse">Loading applications...</div>
          ) : (() => {
            const filteredApplications = applications.filter(app => 
              app.canteen_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
              app.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
            );
            
            return filteredApplications.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center justify-center text-[#888888]">
                <FileText className="w-12 h-12 mb-4 opacity-50" />
                <p className="text-lg font-medium text-white mb-1">No Applications Found</p>
                <p className="text-sm">
                  {searchQuery ? 'Try adjusting your search.' : 'There are currently no vendor applications to review.'}
                </p>
              </div>
            ) : (
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-[#1a1a1a] shadow-sm z-10 border-b border-[#2e2e2e]">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold text-[#888888] uppercase tracking-wider">Applicant Name</th>
                  <th className="px-6 py-3 text-xs font-semibold text-[#888888] uppercase tracking-wider">Canteen Name</th>
                  <th className="px-6 py-3 text-xs font-semibold text-[#888888] uppercase tracking-wider">Date Submitted</th>
                  <th className="px-6 py-3 text-xs font-semibold text-[#888888] uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2e2e2e]">
                {filteredApplications.map((app) => (
                  <tr 
                    key={app.id} 
                    onClick={() => setSelectedApp(app)}
                    className="hover:bg-[#242424] cursor-pointer transition-colors duration-200 group"
                  >
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-white group-hover:text-[#ff9f43] transition-colors">{app.full_name}</div>
                      <div className="text-xs text-[#888888]">{app.email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#f5f5f5]">{app.canteen_name}</td>
                    <td className="px-6 py-4 text-sm text-[#888888]">{formatDate(app.submitted_at)}</td>
                    <td className="px-6 py-4">{renderStatusBadge(app.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            );
          })()}
        </div>
      </div>

      {/* Slide-out Drawer overlay */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black/50 z-40 flex justify-end transition-opacity">
          <div className="w-[450px] bg-[#1a1a1a] h-full shadow-2xl border-l border-[#2e2e2e] flex flex-col transform transition-transform duration-300">
            
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#2e2e2e]">
              <h2 className="text-lg font-semibold text-white">Application Details</h2>
              <button 
                onClick={() => setSelectedApp(null)}
                className="text-[#888888] hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedApp.canteen_name}</h3>
                  {renderStatusBadge(selectedApp.status)}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-semibold tracking-wider text-[#888888] uppercase">Applicant Info</h4>
                
                <div className="flex items-center text-sm text-[#f5f5f5]">
                  <div className="w-8 h-8 rounded bg-[#242424] flex items-center justify-center mr-3 text-[#ff9f43]">
                    <UserIcon />
                  </div>
                  <div>
                    <p className="font-medium">{selectedApp.full_name}</p>
                    <p className="text-xs text-[#888888]">Primary Contact</p>
                  </div>
                </div>

                <div className="flex items-center text-sm text-[#f5f5f5]">
                  <div className="w-8 h-8 rounded bg-[#242424] flex items-center justify-center mr-3 text-[#ff9f43]">
                    <Mail className="w-4 h-4" />
                  </div>
                  {selectedApp.email}
                </div>

                <div className="flex items-center text-sm text-[#f5f5f5]">
                  <div className="w-8 h-8 rounded bg-[#242424] flex items-center justify-center mr-3 text-[#ff9f43]">
                    <Phone className="w-4 h-4" />
                  </div>
                  {selectedApp.phone || 'No phone provided'}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-semibold tracking-wider text-[#888888] uppercase">Business Proposal</h4>
                <div className="bg-[#0f0f0f] rounded-lg p-4 border border-[#2e2e2e]">
                  <p className="text-sm text-[#f5f5f5] leading-relaxed">
                    {selectedApp.description || 'No detailed description provided.'}
                  </p>
                </div>
              </div>

              {selectedApp.menu_sample && (
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold tracking-wider text-[#888888] uppercase">Menu Sample</h4>
                  <div className="bg-[#0f0f0f] rounded-lg p-4 border border-[#2e2e2e]">
                    <p className="text-sm text-[#f5f5f5] whitespace-pre-wrap font-mono text-xs">
                      {selectedApp.menu_sample}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2 text-sm text-[#888888]">
                <FileText className="w-4 h-4" />
                <span>Submitted on {formatDate(selectedApp.submitted_at)}</span>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            {selectedApp.status === 'PENDING' && (
              <div className="p-6 border-t border-[#2e2e2e] bg-[#0f0f0f] space-y-3">
                <button 
                  onClick={() => handleApprove(selectedApp.id)}
                  disabled={isProcessing}
                  className="w-full flex items-center justify-center px-4 py-2.5 bg-[#22c55e] hover:bg-green-500 text-white font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? 'Processing...' : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" /> Approve Vendor
                    </>
                  )}
                </button>
                <button 
                  onClick={() => handleReject(selectedApp.id)}
                  disabled={isProcessing}
                  className="w-full flex items-center justify-center px-4 py-2.5 border border-[#ef4444] text-[#ef4444] hover:bg-red-500/10 font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? 'Processing...' : (
                    <>
                      <XCircle className="w-5 h-5 mr-2" /> Reject Application
                    </>
                  )}
                </button>
              </div>
            )}

            {selectedApp.status !== 'PENDING' && (
              <div className="p-6 border-t border-[#2e2e2e] bg-[#0f0f0f] text-center text-sm text-[#888888]">
                This application has already been processed.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Small helper component for User icon to avoid an extra import line above
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
);

export default VendorRequests;
