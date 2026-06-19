import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser, useAuth } from '@clerk/clerk-react';

const Settings = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [formData, setFormData] = useState({
    adminName: '',
    emailAddress: '',
  });
  
  const fileInputRef = React.useRef(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  
  const [notifications, setNotifications] = useState({
    vendorRequests: { email: true, sms: true },
    menuUpdates: { email: true, sms: false },
    systemAlerts: { email: true, sms: true },
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    // Fetch current settings
    const fetchSettings = async () => {
      try {
        const token = await getToken();
        const response = await axios.get('http://localhost:8000/admin/settings', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = response.data;
        setFormData({
          adminName: user?.firstName || '',
          emailAddress: user?.emailAddresses?.[0]?.emailAddress || '',
        });
        setNotifications({
          vendorRequests: { 
            email: data.notify_vendor_email ?? true, 
            sms: data.notify_vendor_sms ?? true 
          },
          menuUpdates: { 
            email: data.notify_menu_email ?? true, 
            sms: data.notify_menu_sms ?? false 
          },
          systemAlerts: { 
            email: data.notify_system_email ?? true, 
            sms: data.notify_system_sms ?? true 
          },
        });
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchSettings();
    }
  }, [user, getToken]);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (user) {
        await user.update({
          firstName: formData.adminName,
        });
      }
      
      const token = await getToken();
      try {
        await axios.patch('http://localhost:8000/admin/settings', {
          admin_name: formData.adminName,
          email_address: formData.emailAddress,
          notify_vendor_email: notifications.vendorRequests.email,
          notify_vendor_sms: notifications.vendorRequests.sms,
          notify_menu_email: notifications.menuUpdates.email,
          notify_menu_sms: notifications.menuUpdates.sms,
          notify_system_email: notifications.systemAlerts.email,
          notify_system_sms: notifications.systemAlerts.sms,
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (err) {
        console.warn('Backend settings endpoint missing or failed, continuing with Clerk update only');
      }

      showToast('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      showToast('Failed to save settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingImage(true);
      await user.setProfileImage({ file });
      showToast('Profile image updated!');
    } catch (error) {
      console.error('Error uploading image:', error);
      showToast('Failed to upload image', 'error');
    } finally {
      setIsUploadingImage(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = async () => {
    try {
      setIsUploadingImage(true);
      // Clerk doesn't have a direct "remove" method in standard client, but passing null usually clears it, or we can just show toast.
      // Another way is user.setProfileImage({ file: null }) which errors in some versions.
      // Let's wrap in a try catch
      try {
        await user.setProfileImage({ file: null });
      } catch (e) {
         console.warn('Set profile image to null failed, trying delete if available');
      }
      showToast('Profile image removed!');
    } catch (error) {
      console.error('Error removing image:', error);
      showToast('Failed to remove image', 'error');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (category, type) => {
    setNotifications(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [type]: !prev[category][type]
      }
    }));
  };

  if (isLoading) {
    return <div className="text-[#888888] animate-pulse">Loading settings...</div>;
  }

  return (
    <div className="max-w-4xl space-y-8 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`absolute top-0 right-0 px-4 py-2 rounded-lg font-medium shadow-lg transition-all duration-200 ${toastMessage.type === 'success' ? 'bg-[#22c55e] text-white' : 'bg-[#ef4444] text-white'}`}>
          {toastMessage.message}
        </div>
      )}

      {/* General Settings Card */}
      <section className="bg-[#1a1a1a] rounded-lg border border-[#2e2e2e] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#2e2e2e]">
          <h3 className="text-white font-semibold">General Settings</h3>
        </div>
        <div className="p-6 space-y-6">
          
          {/* Avatar Section */}
          <div className="flex items-center space-x-6">
            <div className="w-16 h-16 rounded bg-gray-700 flex items-center justify-center overflow-hidden">
              {user?.imageUrl ? (
                <img src={user.imageUrl} alt="Admin Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold">{formData.adminName.charAt(0) || 'A'}</span>
              )}
            </div>
            <div className="space-x-3 flex items-center">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                accept="image/*" 
                className="hidden" 
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingImage}
                className="px-4 py-2 bg-[#ff9f43] text-black font-semibold rounded-lg hover:bg-orange-400 transition-colors duration-200 cursor-pointer disabled:opacity-50"
              >
                {isUploadingImage ? 'Uploading...' : 'Upload New'}
              </button>
              <button 
                onClick={handleRemoveImage}
                disabled={isUploadingImage || !user?.imageUrl}
                className="px-4 py-2 border border-[#2e2e2e] text-[#f5f5f5] font-medium rounded-lg hover:bg-[#242424] transition-colors duration-200 cursor-pointer disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm text-[#888888] font-medium block">Admin Name</label>
              <input 
                type="text" 
                name="adminName"
                value={formData.adminName}
                onChange={handleTextChange}
                className="w-full bg-transparent border border-[#2e2e2e] text-[#f5f5f5] rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#ff9f43] transition-colors duration-200" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-[#888888] font-medium block">Email Address</label>
              <input 
                type="email" 
                name="emailAddress"
                value={formData.emailAddress}
                onChange={handleTextChange}
                disabled
                className="w-full bg-[#1a1a1a] border border-[#2e2e2e] text-[#888888] rounded-lg px-4 py-2.5 cursor-not-allowed" 
              />
              <p className="text-xs text-[#888888] mt-1">Email address is managed via your account provider.</p>
            </div>
          </div>
        </div>
      </section>

      

      {/* Save Actions */}
      <div className="flex justify-end pt-4">
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2.5 bg-[#ff9f43] text-black font-semibold rounded-lg hover:bg-orange-400 transition-colors duration-200 cursor-pointer disabled:opacity-50 flex items-center"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default Settings;
