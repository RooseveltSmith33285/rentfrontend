import React, { useState, useEffect } from "react";
import { ArrowLeft, Save, Eye, EyeOff, User, Mail, Phone, Lock, Edit2, Check, DollarSign, MapPin, Home as HomeIcon } from "lucide-react";
import { BASE_URL } from "../baseUrl";
import LocationSuggestionField from "../components/locationsuggestionfield";
import { toast, ToastContainer } from "react-toastify"
import { loadStripe } from '@stripe/stripe-js';
import { CardNumberElement, CardExpiryElement, CardCvcElement, Elements, useStripe, useElements } from '@stripe/react-stripe-js';
const stripePromise = loadStripe('pk_test_51OwuO4LcfLzcwwOYdssgGfUSfOgWT1LwO6ewi3CEPewY7WEL9ATqH6WJm3oAcLDA3IgUvVYLVEBMIEu0d8fUwhlw009JwzEYmV'); // Replace with your actual key

function UserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showPaymentSection, setShowPaymentSection] = useState(false);
  const [editingPayment, setEditingPayment] = useState(false);
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvc: '',
    cardholderName: ''
  });
  const [savingPayment, setSavingPayment] = useState(false);

  const [requests, setRequests] = useState([]);
const [editingRequestId, setEditingRequestId] = useState(null);
const [editAddressData, setEditAddressData] = useState({});

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: ''
  });
  const [savingAddress, setSavingAddress] = useState(false);
  
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
    fetchUserProfile();
    fetchUserRequests();
  }, []);

  // Payment form component with Stripe access
function PaymentForm({ onSave, onCancel, saving }) {
  const stripe = useStripe();
  const elements = useElements();
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvc: ''
  });

  const elementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#1f2937',
        '::placeholder': {
          color: '#9ca3af',
        },
      },
    },
  };

  const handleSubmit = async () => {
    if (!stripe || !elements) {
      toast.error('Stripe is not loaded yet', {containerId:"userProfile"});
      return;
    }
  
    const cardElement = elements.getElement(CardNumberElement);
  
    if (!cardElement) {
      toast.error('Please enter your card details', {containerId:"userProfile"});
      return;
    }
  
    // Create payment method - Stripe will handle validation
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });
  
    if (error) {
      // This will catch empty fields and validation errors
      toast.error(error.message, {containerId:"userProfile"});
      return;
    }
  
    // Only call save if payment method was successfully created
    if (paymentMethod) {
      onSave(paymentMethod);
    } else {
      toast.error('Please enter valid card details', {containerId:"userProfile"});
    }
  };

  return (
    <div className="space-y-4">
      {/* Card Number */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Card Number
        </label>
        <div className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg focus-within:ring-2 focus-within:ring-[#024a47]">
          <CardNumberElement options={elementOptions} />
        </div>
      </div>

      {/* Expiry Date and CVC */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Expiry Date
          </label>
          <div className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg focus-within:ring-2 focus-within:ring-[#024a47]">
            <CardExpiryElement options={elementOptions} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            CVC
          </label>
          <div className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg focus-within:ring-2 focus-within:ring-[#024a47]">
            <CardCvcElement options={elementOptions} />
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start space-x-2">
          <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <p className="text-xs text-blue-800">
            Your payment information is encrypted and stored securely. We save a secure reference to use your card for future payments.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
        <button
          onClick={handleSubmit}
          disabled={saving || !stripe}
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
              <span>Save Payment Method</span>
            </>
          )}
        </button>
        <button
          onClick={onCancel}
          disabled={saving}
          className="px-4 sm:px-6 py-2.5 sm:py-3 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${BASE_URL}/getUser`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      console.log(data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch profile');
      }
   
      const userData = data.user;
      setUser(userData);
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        mobile: userData.mobile || ''
      });
   
      // Set payment data if exists
      if (data.paymentMethod) {
        setPaymentData({
          cardNumber: `**** **** **** ${data.paymentMethod.last4}`,
          expiryDate: data.paymentMethod.expiryDate || '',
          cvc: '***',
          cardholderName: ''
        });
      }

      
    } catch (err) {
      console.error('Error fetching profile:', err);
      
      if (err.message.includes('401')) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else {
        toast.error('Failed to load profile. Please try again.',{containerId:"userProfile"});
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddressChange = (requestId, field, value) => {
    setEditAddressData(prev => ({
      ...prev,
      [requestId]: {
        ...prev[requestId],
        [field]: value
      }
    }));
  };


  const startEditingAddress = (request) => {
    setEditingRequestId(request._id);
    setEditAddressData({
      [request._id]: {
        street: request.deliveryAddress?.street || '',
        city: request.deliveryAddress?.city || '',
        state: request.deliveryAddress?.state || '',
        zipCode: request.deliveryAddress?.zipCode || '',
        country: request.deliveryAddress?.country || ''
      }
    });
  };


  const handleSaveAddress = async (requestId) => {
    try {
      const addressData = editAddressData[requestId];
      
      if (!addressData.street.trim() || !addressData.city.trim() || 
          !addressData.state.trim() || !addressData.zipCode.trim() || 
          !addressData.country.trim()) {
    toast.info('All address fields are required',{containerId:"userProfile"});
        return;
      }
  
      setSavingAddress(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${BASE_URL}/request/${requestId}/delivery-address`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ deliveryAddress: addressData })
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update address');
      }
      
      // Update local state
      setRequests(prev => prev.map(req => 
        req._id === requestId 
          ? { ...req, deliveryAddress: addressData }
          : req
      ));
      
      setEditingRequestId(null);
      setEditAddressData({});
    toast.success('Delivery address updated successfully!',{containerId:"userProfile"});
     
    } catch (err) {
      console.error('Error updating address:', err);
      toast.error(err.message || 'Failed to update address. Please try again.',{containerId:"userProfile"});
    } finally {
      setSavingAddress(false);
    }
  };
  
 
  
  



// In fetchUserRequests, update to:
const fetchUserRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${BASE_URL}/getRequestsProfileUser`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
  
      const data = await response.json();
      console.log('Requests:', data);
  

        // Filter only delivery requests
        const deliveryRequests = data.requests.filter(req => req.deliveryType === 'delivery');
        console.log('Delivery Requests:', deliveryRequests); // ADD THIS
        console.log('Delivery Requests Length:', deliveryRequests.length); // ADD THIS
        setRequests(deliveryRequests);
   
    } catch (err) {
      console.error('Error fetching requests:', err);
    }
  };


  


  const handleCancelAddressEdit = () => {
    setEditingRequestId(null);
    setEditAddressData({});
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
        toast.info('Name is required',{containerId:"userProfile"});
        return;
      }
      if (!formData.email.trim()) {
        toast.info('Email is required',{containerId:"userProfile"});
        return;
      }
      if (!formData.mobile.trim()) {
      toast.info('Mobile number is required',{containerId:"userProfile"});
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
      toast.info('Please enter a valid email address',{containerId:"userProfile"});
        return;
      }

      // Mobile validation (basic)
      if (formData.mobile.length < 10) {
        toast.info('Please enter a valid mobile number',{containerId:"userProfile"});
        return;
      }

      setSaving(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${BASE_URL}/updateUser`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      console.log('Update response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }
      
      // Update user state with the updated data
      setUser(prev => ({
        ...prev,
        ...formData
      }));
      
      setEditMode(false);
      toast.success('Profile updated successfully!',{containerId:"userProfile"});
     
    } catch (err) {
      console.error('Error updating profile:', err);
      
      if (err.message.includes('401')) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else if (err.message.includes('409')) {
      toast.error('Email or mobile number already exists',{containerId:"userProfile"});
      } else {
        toast.error(err.message || 'Failed to update profile. Please try again.',{containerId:"userProfile"});
      }
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      // Validation
      if (!passwordData.currentPassword) {
        toast.info('Current password is required',{containerId:"userProfile"});
        return;
      }
      if (!passwordData.newPassword) {
        toast.info('New password is required',{containerId:"userProfile"});
        return;
      }
      if (passwordData.newPassword.length < 6) {
        toast.info('New password must be at least 6 characters long',{containerId:"userProfile"});
        return;
      }
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        toast.info('New passwords do not match',{containerId:"userProfile"});
        return;
      }
      if (passwordData.currentPassword === passwordData.newPassword) {
        toast.info('New password must be different from current password',{containerId:"userProfile"});
        return;
      }

      setChangingPassword(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${BASE_URL}/user/changeUserPassword`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const data = await response.json();

if (!response.ok) {
  if (data.error === 'Current password is incorrect') {
    toast.error('Current password is incorrect',{containerId:"userProfile"});
  } else if (response.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
  } else {
    throw new Error(data.error || 'Failed to change password');
  }
  return; // Important: stop execution here
}

// Only execute this if response is ok
toast.success('Password changed successfully!',{containerId:"userProfile"});
setPasswordData({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});
setShowPasswordSection(false);
    } catch (err) {
      console.error('Error changing password:', err);
      toast.error(err.message || 'Failed to change password. Please try again.',{containerId:"userProfile"});
    } finally {
      setChangingPassword(false);
    }
  };

  const handleCancelEdit = () => {
    setFormData({
      name: user.name || '',
      email: user.email || '',
      mobile: user.mobile || ''
    });
    // Set payment data if exists
s
    setEditMode(false);
  };

  const goBack = () => {
    window.location.href = '/renterdashboard';
  };

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'cardNumber') {
      // Format card number with spaces
      const formatted = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
      if (formatted.replace(/\s/g, '').length <= 16) {
        setPaymentData(prev => ({ ...prev, [name]: formatted }));
      }
    } else if (name === 'expiryDate') {
      // Format expiry date as MM/YY
      const formatted = value.replace(/\D/g, '').replace(/(\d{2})(\d{0,2})/, '$1/$2').substr(0, 5);
      setPaymentData(prev => ({ ...prev, [name]: formatted }));
    } else if (name === 'cvc') {
      // Only allow 3-4 digits
      if (value.length <= 4 && /^\d*$/.test(value)) {
        setPaymentData(prev => ({ ...prev, [name]: value }));
      }
    } else {
      setPaymentData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleSavePayment = async (paymentMethod) => {
    try {
      setSavingPayment(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${BASE_URL}/update-payment`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          paymentMethodId: paymentMethod.id,
          last4: paymentMethod.card.last4,
          expiryMonth: paymentMethod.card.exp_month,
          expiryYear: paymentMethod.card.exp_year,
        })
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save payment method');
      }
      
      // Update local state with masked card number
      setPaymentData({
        cardNumber: `**** **** **** ${data.lastFourDigits}`,
        expiryDate: paymentData.expiryDate,
        cvc: '***',
        cardholderName: paymentData.cardholderName
      });
      
      setEditingPayment(false);
      toast.success('Payment method saved successfully!', {containerId:"userProfile"});
    } catch (err) {
      console.error('Error saving payment method:', err);
      toast.error(err.message || 'Failed to save payment method. Please try again.', {containerId:"userProfile"});
    } finally {
      setSavingPayment(false);
    }
  };
  
  const handleCancelPaymentEdit = () => {
    // Reset to original data
    if (user?.paymentMethod) {
      setPaymentData({
        cardNumber: `**** **** **** ${user.paymentMethod.lastFourDigits}`,
        expiryDate: user.paymentMethod.expiryDate || '',
        cvc: '***',
        cardholderName: user.paymentMethod.cardholderName || ''
      });
    } else {
      setPaymentData({
        cardNumber: '',
        expiryDate: '',
        cvc: '',
        cardholderName: ''
      });
    }
    setEditingPayment(false);
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
   <ToastContainer containerId={"userProfile"}/>
   


   <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#024a47] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3 sm:py-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button 
                onClick={goBack}
                className="p-2 hover:bg-[#035d59] rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-lg sm:text-xl font-bold">My Profile</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
          {/* Profile Header */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#024a47] rounded-full flex items-center justify-center text-white font-bold text-2xl sm:text-3xl flex-shrink-0">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl sm:text-2xl font-bold text-[#024a47] truncate">
                    {user?.name}
                  </h2>
                  {user?.status === 'active' && (
                    <span className="inline-flex items-center px-2 sm:px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs sm:text-sm font-semibold mt-1">
                      <Check className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      Active
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

          {/* Account Info Banner */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <DollarSign className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-semibold text-blue-900">Account Credit</p>
                  <p className="text-xs text-blue-700">Available balance</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-blue-600">
                ${user?.credit?.toFixed(2) || '0.00'}
              </p>
            </div>
          </div>

          {/* Profile Form */}
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Full Name</span>
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
                  <span>Email Address</span>
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

{/* Delivery Address Section */}
{/* Delivery Addresses Section */}
{/* Request Header */}
{/* Delivery Addresses Section */}
{/* Payment Method Section */}
<div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
  <button
    onClick={() => setShowPaymentSection(!showPaymentSection)}
    className="w-full flex items-center justify-between text-left"
  >
    <div className="flex items-center space-x-2 sm:space-x-3">
      <DollarSign className="w-5 h-5 text-[#024a47]" />
      <h3 className="text-base sm:text-lg font-semibold text-[#024a47]">Payment Method</h3>
    </div>
    <div className={`transform transition-transform ${showPaymentSection ? 'rotate-180' : ''}`}>
      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  </button>

  {showPaymentSection && (
    <div className="mt-6">
      {/* Existing Card Display or Empty State */}
   

      {/* Edit/Add Payment Form */}
      {editingPayment || !user?.paymentMethod ? (
  <Elements stripe={stripePromise}>
    <PaymentForm 
      onSave={handleSavePayment}
      onCancel={() => {
        setEditingPayment(false);
        handleCancelPaymentEdit();
      }}
      saving={savingPayment}
    />
  </Elements>
) : (
        <button
          onClick={() => setEditingPayment(true)}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 border-2 border-[#024a47] text-[#024a47] hover:bg-[#024a47] hover:text-white rounded-lg transition-colors text-sm sm:text-base font-medium"
        >
          <Edit2 className="w-4 h-4" />
          <span>Update Payment Method</span>
        </button>
      )}
    </div>
  )}
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

export default UserProfile;