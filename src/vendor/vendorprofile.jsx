import React, { useState, useEffect } from "react";
import { ArrowLeft, Save, Eye, EyeOff, User, Mail, Phone, Lock, Edit2, Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { BASE_URL } from "../baseUrl";
import { toast, ToastContainer } from "react-toastify";

function VendorProfile() {
  const navigate = useNavigate();
  
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    businessName:''
  });
  
  // Password change states
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    fetchVendorProfile();
  }, []);

  const fetchVendorProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('vendorToken');
      
      const response = await axios.get(`${BASE_URL}/vendor/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log(response.data)
   
        const vendorData = response.data.vendor;
        setVendor(vendorData);
        setFormData({
          name: vendorData.name || '',
          email: vendorData.email || '',
          mobile: vendorData.mobile || '',
          businessName:vendorData.businessName || ''
        });
        setPasswordData({
            ...passwordData,
            currentPassword:vendorData.password
        })
      
    } catch (err) {
      console.error('Error fetching profile:', err);
      
      if (err.response?.status === 401) {
        localStorage.removeItem('vendorToken');
        navigate('/vendorlogin');
      } else {
        toast.error('Failed to load profile. Please try again.',{containerId:"vendorProfile"});
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      // Validation
      if (!formData.name.trim()) {
        toast.info('Name is required',{containerId:"vendorProfile"});
        return;
      }
      if (!formData.email.trim()) {
        toast.info('Email is required',{containerId:"vendorProfile"});
        return;
      }
      if (!formData.mobile.trim()) {
        toast.info('Mobile number is required',{containerId:"vendorProfile"});
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.info('Please enter a valid email address',{containerId:"vendorProfile"});
        return;
      }

      // Mobile validation (basic)
      if (formData.mobile.length < 10) {
        toast.info('Please enter a valid mobile number',{containerId:"vendorProfile"});
        return;
      }

      setSaving(true);
      const token = localStorage.getItem('vendorToken');
      
      const response = await axios.put(
        `${BASE_URL}/updateVendorProfile`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      console.log('Update response:', response.data);
      
      // Update vendor state with the updated data
      // Keep existing vendor data and merge with updated fields
      setVendor(prev => ({
        ...prev,
        ...formData
      }));
      
      setEditMode(false);
      toast.success('Profile updated successfully!',{containerId:"vendorProfile"});
     
    } catch (err) {
      console.error('Error updating profile:', err);
      
      if (err.response?.status === 401) {
        localStorage.removeItem('vendorToken');
        navigate('/vendorlogin');
      } else if (err.response?.status === 400) {
        toast.error(err.response.data.error || 'Invalid data provided',{containerId:"vendorProfile"});
      } else if (err.response?.status === 409) {
        toast.error('Email or mobile number already exists',{containerId:"vendorProfile"});
      } else {
        toast.error('Failed to update profile. Please try again.',{containerId:"vendorProfile"});
      }
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      // Validation
      if (!passwordData.currentPassword) {
        toast.info('Current password is required',{containerId:"vendorProfile"});
        return;
      }
      if (!passwordData.newPassword) {
        toast.info('New password is required',{containerId:"vendorProfile"});
        return;
      }
      if (passwordData.newPassword.length < 6) {
        toast.info('New password must be at least 6 characters long',{containerId:"vendorProfile"});
        return;
      }
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        toast.info('New passwords do not match',{containerId:"vendorProfile"});
        return;
      }
      if (passwordData.currentPassword === passwordData.newPassword) {
        toast.info('New password must be different from current password',{containerId:"vendorProfile"});
        return;
      }

      setChangingPassword(true);
      const token = localStorage.getItem('vendorToken');
      
      const response = await axios.put(
        `${BASE_URL}/changeVendorPassword`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        toast.success('Password changed successfully!',{containerId:"vendorProfile"});
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setShowPasswordSection(false);
      }
    } catch (err) {
      console.error('Error changing password:', err);
      
      if (err.response?.status === 401) {
        if (err.response.data.error === 'Current password is incorrect') {
          toast.error('Current password is incorrect',{containerId:"vendorProfile"});
        } else {
          localStorage.removeItem('vendorToken');
          navigate('/vendorlogin');
        }
      } else {
        toast.error('Failed to change password. Please try again.',{containerId:"vendorProfile"});
      }
    } finally {
      setChangingPassword(false);
    }
  };

  const handleCancelEdit = () => {
    setFormData({
      name: vendor.name || '',
      email: vendor.email || '',
      mobile: vendor.mobile || ''
    });
    setEditMode(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#024a47] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
   <>
   <ToastContainer containerId={"vendorProfile"}/>
   

   <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#024a47] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3 sm:py-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button 
                onClick={() => navigate('/vendordashboard')} 
                className="p-2 hover:bg-[#035d59] rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-lg sm:text-xl font-bold">Vendor Profile</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
          {/* Profile Header - Responsive Layout */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#024a47] rounded-full flex items-center justify-center text-white font-bold text-2xl sm:text-3xl flex-shrink-0">
                  {vendor?.name?.charAt(0).toUpperCase() || 'V'}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl sm:text-2xl font-bold text-[#024a47] truncate">
                    {vendor?.businessName || vendor?.name}
                  </h2>
                  {vendor?.isVerified && (
                    <span className="inline-flex items-center px-2 sm:px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs sm:text-sm font-semibold mt-1">
                      <Check className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      Verified
                    </span>
                  )}
                </div>
              </div>
              
              {!editMode && (
                <button
                  onClick={() => setEditMode(true)}
                  className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-[#024a47] hover:bg-[#035d59] text-white rounded-lg transition-colors text-sm sm:text-base w-full sm:w-auto"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>
          </div>

          {/* Profile Form */}
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Name</span>
                </div>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={!editMode}
                className={`w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#024a47] ${
                  editMode ? 'bg-white' : 'bg-gray-100 cursor-not-allowed'
                }`}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>Email</span>
                </div>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={!editMode}
                className={`w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#024a47] ${
                  editMode ? 'bg-white' : 'bg-gray-100 cursor-not-allowed'
                }`}
              />
            </div>

            {/* Mobile */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>Mobile Number</span>
                </div>
              </label>
              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleInputChange}
                disabled={!editMode}
                className={`w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#024a47] ${
                  editMode ? 'bg-white' : 'bg-gray-100 cursor-not-allowed'
                }`}
              />
            </div>



              {/* Business */}
              <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>Business Name</span>
                </div>
              </label>
              <input
                type="tel"
                name="businessName"
                value={formData.businessName}
                onChange={handleInputChange}
                disabled={!editMode}
                className={`w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#024a47] ${
                  editMode ? 'bg-white' : 'bg-gray-100 cursor-not-allowed'
                }`}
              />
            </div>

            {/* Action Buttons */}
            {editMode && (
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-[#024a47] hover:bg-[#035d59] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={saving}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Change Password Section */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <button
            onClick={() => setShowPasswordSection(!showPasswordSection)}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Lock className="w-5 h-5 text-[#024a47]" />
              <h3 className="text-base sm:text-lg font-semibold text-[#024a47]">Change Password</h3>
            </div>
            <div className={`transform transition-transform ${showPasswordSection ? 'rotate-180' : ''}`}>
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>

          {showPasswordSection && (
            <div className="mt-6 space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#024a47] pr-10"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#024a47] pr-10"
                    placeholder="Enter new password (min 6 characters)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#024a47] pr-10"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Change Password Button */}
              <button
                onClick={handleChangePassword}
                disabled={changingPassword}
                className="w-full flex items-center justify-center space-x-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-[#024a47] hover:bg-[#035d59] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {changingPassword ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                    <span>Changing Password...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Change Password</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
   </>
  );
}

export default VendorProfile;