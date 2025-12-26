

import React, { useState } from "react";
import { X, Upload, Check, ExternalLink, CreditCard, AlertCircle } from "lucide-react";
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import { useRef, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from "../baseUrl";


const StripeOnboardingPopup = ({ isOpen, onClose, onboardingUrl, accountId }) => {
  if (!isOpen) return null;

  const handleContinue = () => {
    window.location.href = onboardingUrl;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
   
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />
      
    
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 animate-in fade-in zoom-in duration-300">
     
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

       
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <CreditCard className="w-8 h-8 text-blue-600" />
          </div>
        </div>

       
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Complete Your Stripe Setup First
          </h2>
          <p className="text-gray-600 mb-4">
            Before creating listings, you need to complete your Stripe account setup to receive payments. This will only take a few minutes.
          </p>
          
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3 text-left">
              <Check className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-gray-700">
                <p className="font-medium mb-1">What you'll need:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>Bank account details</li>
                  <li>Business or personal information</li>
                  <li>Tax ID (SSN or EIN)</li>
                </ul>
              </div>
            </div>
          </div>

          {accountId && (
            <p className="text-xs text-gray-500 mb-4">
              Account ID: {accountId}
            </p>
          )}
        </div>

       
        <div className="flex flex-col gap-3">
          <button
            onClick={handleContinue}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
          >
            Continue to Stripe
            <ExternalLink className="w-4 h-4" />
          </button>
          
          <button
            onClick={onClose}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors"
          >
            I'll do this later
          </button>
        </div>

     
        <p className="text-xs text-gray-500 text-center mt-6">
          🔒 Secured by Stripe. Your information is safe and encrypted.
        </p>
      </div>
    </div>
  );
};

function ListingCreationFlow() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState([]); 
  const [imagePreviews, setImagePreviews] = useState([]);
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
const [loadingPickupSuggestions, setLoadingPickupSuggestions] = useState(false);
const pickupAddressRef = useRef(null);
const [loadingCurrentLocation, setLoadingCurrentLocation] = useState(false);
  
  // Stripe onboarding state
  const [showStripePopup, setShowStripePopup] = useState(false);
  const [stripeOnboardingData, setStripeOnboardingData] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    brand: '',
    condition: '',
    rentPrice: '',
    buyPrice: '',
    description: '',
    listAsActive: true,
    publishToFeed: false,
    pickUpAddress: '',
    powerType: '', // ADD THIS
    deliveryPrice: '', // ADD THIS
    installationPrice: '', // ADD THIS
    location: {
      city: '',
      state: '',
      zipCode: ''
    }
  });


  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };

  const getCurrentLocation = async () => {
    setLoadingCurrentLocation(true);
    
    try {
      // Check if geolocation is supported
      if (!navigator.geolocation) {
        toast.info('Geolocation is not supported by your browser', { containerId: 'listingPage' });
        setLoadingCurrentLocation(false);
        return;
      }
  
      // Get current position
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            // Reverse geocode to get address
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
              {
                headers: {
                  'User-Agent': 'RentalApp/1.0'
                }
              }
            );
            
            const data = await response.json();
            
            if (data && data.display_name) {
              setFormData(prev => ({ ...prev, pickUpAddress: data.display_name }));
              
            } else {
             
            }
          } catch (error) {
            console.error('Error reverse geocoding:', error);
          
          } finally {
            setLoadingCurrentLocation(false);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          let errorMessage = 'Could not get your location';
          
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location permission denied. Please enable location access.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
          }
          
          toast.error(errorMessage, { containerId: 'listingPage' });
          setLoadingCurrentLocation(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } catch (error) {
      console.error('Error getting location:', error);
      toast.error('Failed to get current location', { containerId: 'listingPage' });
      setLoadingCurrentLocation(false);
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  // Handle image file selection
  // const handleImageChange = (e) => {
  //   const files = Array.from(e.target.files);
    
  //   if (files.length === 0) return;
    
  //   // Only take the first file
  //   const file = files[0];
    
  //   // Validate file size (10MB max)
  //   if (file.size > 10 * 1024 * 1024) {
  //     toast.error(`${file.name} is too large. Max 10MB per image`, { containerId: 'listingPage' });
  //     return;
  //   }
  
  //   // Replace existing image with new one
  //   setImageFiles([file]);
  
  //   // Create preview
  //   const reader = new FileReader();
  //   reader.onloadend = () => {
  //     setImagePreviews([reader.result]);
  //   };
  //   reader.readAsDataURL(file);
  // };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;
    
    // Check if adding these files would exceed 3 images
    if (imageFiles.length + files.length > 3) {
      toast.error('You can only upload up to 3 images', { containerId: 'listingPage' });
      return;
    }
    
    // Validate each file
    const validFiles = [];
    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max 10MB per image`, { containerId: 'listingPage' });
        continue;
      }
      validFiles.push(file);
    }
    
    if (validFiles.length === 0) return;
    
    // Add new files to existing ones
    const newImageFiles = [...imageFiles, ...validFiles];
    setImageFiles(newImageFiles);
  
    // Create previews for new files
    const newPreviews = [];
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result);
        if (newPreviews.length === validFiles.length) {
          setImagePreviews([...imagePreviews, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
  };
  // Remove image

  // Handle click outside to close suggestions
useEffect(() => {
  const handleClickOutside = (event) => {
    if (pickupAddressRef.current && !pickupAddressRef.current.contains(event.target)) {
      setShowPickupSuggestions(false);
    }
  };

  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, []);

// Fetch location suggestions from OpenStreetMap
const fetchPickupSuggestions = async (value) => {
  if (!value || value.length < 2) {
    setPickupSuggestions([]);
    return;
  }

  setLoadingPickupSuggestions(true);
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&limit=5&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'RentalApp/1.0'
        }
      }
    );
    
    const data = await response.json();
    
    const formattedSuggestions = data.map(item => ({
      displayName: item.display_name,
      fullAddress: item.display_name
    }));
    
    // Remove duplicates
    const uniqueSuggestions = formattedSuggestions.filter((item, index, self) =>
      index === self.findIndex((t) => t.displayName === item.displayName)
    );
    
    setPickupSuggestions(uniqueSuggestions);
    setShowPickupSuggestions(true);
  } catch (error) {
    console.error('Error fetching location suggestions:', error);
    setPickupSuggestions([]);
  } finally {
    setLoadingPickupSuggestions(false);
  }
};



// Debounce for pickup address
useEffect(() => {
  const timer = setTimeout(() => {
    if (formData.pickUpAddress) {
      fetchPickupSuggestions(formData.pickUpAddress);
    }
  }, 300);
  return () => clearTimeout(timer);
}, [formData.pickUpAddress]);

const handlePickupAddressChange = (value) => {
  setFormData({ ...formData, pickUpAddress: value });
  setShowPickupSuggestions(true);
};

const handleSelectPickupSuggestion = (suggestion) => {
  setFormData({ ...formData, pickUpAddress: suggestion.fullAddress });
  setShowPickupSuggestions(false);
  setPickupSuggestions([]);
};


  const removeImage = (index) => {
    setImageFiles(imageFiles.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  // Upload images to server/cloud
  const uploadImages = async () => {
    if (imageFiles.length === 0) return [];

    const uploadedImages = [];
    
    for (let file of imageFiles) {
      const formData = new FormData();
      formData.append('image', file);

      try {
        const response = await axios.post(`${BASE_URL}/upload-image`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('vendorToken')}`
          }
        });

        uploadedImages.push({
          url: response.data.url,
          publicId: response.data.publicId,
          isPrimary: uploadedImages.length === 0
        });
      } catch (error) {
        console.error('Image upload error:', error);
        toast.error('Failed to upload image', { containerId: 'listingPage' });
      }
    }

    return uploadedImages;
  };

  // Check Stripe onboarding status
  const checkStripeStatus = async () => {
    try {
      const token = localStorage.getItem('vendorToken');
      
      const response = await axios.get(
        `${BASE_URL}/generateStripeOnboardingLink`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = response.data;

      // If already connected, return true to continue
      if (data.alreadyConnected) {
        return true;
      }

      // If onboarding needed, show popup and return false
      if (data.onboardingUrl) {
        setStripeOnboardingData(data);
        setShowStripePopup(true);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error checking Stripe status:', error);
      
      // If error checking, show warning but allow to continue
      if (error?.response?.status === 404) {
        toast.error('Vendor not found', { containerId: 'listingPage' });
        return false;
      }
      
      // For other errors, show warning but don't block
      toast.warning('Could not verify payment setup. Please ensure Stripe is configured.', {
        containerId: 'listingPage'
      });
      return true;
    }
  };

  // Validate form data
  const validateStep = () => {
    if (step === 1) {
      if (!formData.title.trim()) {
        toast.error('Please enter a listing title', { containerId: 'listingPage' });
        return false;
      }
      if (!formData.category) {
        toast.error('Please select a category', { containerId: 'listingPage' });
        return false;
      }
      if (!formData.brand.trim()) {
        toast.error('Please enter the brand', { containerId: 'listingPage' });
        return false;
      }
      if (!formData.condition) {
        toast.error('Please select the condition', { containerId: 'listingPage' });
        return false;
      }
      if (!formData.powerType) { // ADD THIS
        toast.error('Please select the power type', { containerId: 'listingPage' });
        return false;
      }
      if (!formData.pickUpAddress.trim()) {
        toast.error('Please enter the pickup address', { containerId: 'listingPage' });
        return false;
      }
    }
  
    if (step === 2) {
      if (!formData.rentPrice || formData.rentPrice <= 0) {
        toast.error('Please enter a valid rent price', { containerId: 'listingPage' });
        return false;
      }
      if (!formData.buyPrice || formData.buyPrice <= 0) {
        toast.error('Please enter a valid buy price', { containerId: 'listingPage' });
        return false;
      }
      if (!formData.deliveryPrice || formData.deliveryPrice < 0) {
        toast.error('Please enter a valid delivery price', { containerId: 'listingPage' });
        return false;
      }
      if (!formData.installationPrice || formData.installationPrice < 0) {
        toast.error('Please enter a valid installation price', { containerId: 'listingPage' });
        return false;
      }
      if (imageFiles.length === 0) {
        toast.error('Please upload an image', { containerId: 'listingPage' });
        return false;
      }

      if (imageFiles.length === 0) {
        toast.error('Please upload at least 1 image', { containerId: 'listingPage' });
        return false;
      }
      if (imageFiles.length > 3) {
        toast.error('Maximum 3 images allowed', { containerId: 'listingPage' });
        return false;
      }

    }
  
    if (step === 3) {
      if (!formData.description.trim()) {
        toast.error('Please enter a description', { containerId: 'listingPage' });
        return false;
      }
      if (formData.description.length < 25) {
        toast.error('Description must be at least 25 characters', { containerId: 'listingPage' });
        return false;
      }
    }
  
    return true;
  };



  // Handle next step
  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  // Handle form submission with Stripe check
  const handleSubmit = async () => {
    if (!validateStep()) return;

    setLoading(true);

    try {
      // 🎯 CHECK STRIPE STATUS FIRST
      toast.info('Checking payment setup...', { containerId: 'listingPage' });
      const stripeReady = await checkStripeStatus();
      
      if (!stripeReady) {
        toast.dismiss();
        setLoading(false);
        return; // Stop submission if Stripe not ready
      }

      // Upload images
      toast.info('Uploading images...', { containerId: 'listingPage' });
      const images = await uploadImages();

      // Prepare listing data
      const listingData = {
        title: formData.title,
        category: formData.category,
        brand: formData.brand,
        condition: formData.condition,
        powerType: formData.powerType, // ADD THIS
        rentPrice: parseFloat(formData.rentPrice),
        buyPrice: parseFloat(formData.buyPrice),
        deliveryPrice: parseFloat(formData.deliveryPrice), // Converts to number
        installationPrice: parseFloat(formData.installationPrice), // Converts to number
        description: formData.description,
        images,
        listAsActive: formData.listAsActive,
        publishToFeed: formData.publishToFeed,
        pickUpAddress: formData.pickUpAddress,
        location: formData.location
      };

      // Submit to API
      const response = await axios.post(
        `${BASE_URL}/listings`,
        listingData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('vendorToken')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      toast.dismiss();
      toast.success('Listing submitted! Our team will review and approve it shortly.', {
        containerId: 'listingPage'
      });

      // Redirect after 1.5 seconds
      setTimeout(() => {
        navigate('/vendordashboard');
      }, 1500);

    } catch (error) {
      console.error('Create listing error:', error);
      toast.dismiss();
      
      if (error?.response?.data?.error) {
        toast.error(error.response.data.error, { containerId: 'listingPage' });
      } else {
        toast.error('Failed to create listing. Please try again.', {
          containerId: 'listingPage'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
<>
      <ToastContainer containerId="listingPage" />
      
    
      <StripeOnboardingPopup
        isOpen={showStripePopup}
        onClose={() => setShowStripePopup(false)}
        onboardingUrl={stripeOnboardingData?.onboardingUrl}
        accountId={stripeOnboardingData?.accountId}
      />
      
      <div className="min-h-screen pb-20 bg-[#f3f4e6]">
        <header className="bg-white shadow-sm">
          <div className="max-w-3xl mx-auto px-4 py-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/vendordashboard')}
                className="text-gray-600 hover:text-[#024a47]"
              >
                <X className="w-6 h-6" />
              </button>
              <h1 className="text-2xl font-bold text-[#024a47]">Create New Listing</h1>
            </div>
          </div>
        </header>

        <div className="max-w-3xl mx-auto px-4 py-8">
         
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                    step >= s ? 'bg-[#024a47] text-white' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step > s ? <Check className="w-5 h-5" /> : s}
                </div>
                {s < 3 && (
                  <div
                    className={`flex-1 h-1 mx-2 transition-all ${
                      step > s ? 'bg-[#024a47]' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
         
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-[#024a47] mb-4">
                  Basic Information
                </h2>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Listing Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Samsung 5.0 Cu. Ft. Refrigerator"
                    className="w-full px-4 py-3 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#024a47]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#024a47]"
                    >
                      <option value="">Select category</option>
                      <option value="refrigerator">Refrigerator</option>
                      <option value="washer">Washing Machine</option>
                      <option value="dryer">Dryer</option>
                      <option value="dishwasher">Dishwasher</option>
                      <option value="oven">Oven</option>
                      <option value="microwave">Microwave</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Brand *
                    </label>
                    <input
                      type="text"
                      name="brand"
                      value={formData.brand}
                      onChange={handleInputChange}
                      placeholder="e.g., Samsung"
                      className="w-full px-4 py-3 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#024a47]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Condition *
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {['New', 'Like New', 'Good'].map((cond) => (
                      <button
                        key={cond}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, condition: cond })
                        }
                        className={`py-3 rounded-lg font-semibold transition-all ${
                          formData.condition === cond
                            ? 'bg-[#024a47] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {cond}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      name="location.city"
                      value={formData.location.city}
                      onChange={handleInputChange}
                      placeholder="City"
                      className="w-full px-4 py-3 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#024a47]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      name="location.state"
                      value={formData.location.state}
                      onChange={handleInputChange}
                      placeholder="State"
                      className="w-full px-4 py-3 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#024a47]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      name="location.zipCode"
                      value={formData.location.zipCode}
                      onChange={handleInputChange}
                      placeholder="ZIP"
                      className="w-full px-4 py-3 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#024a47]"
                    />
                  </div>
                </div>
<div>
  <label className="block text-sm font-semibold text-gray-700 mb-2">
    Power Type *
  </label>
  <div className="grid grid-cols-2 gap-3">
    {['Electric', 'Gas','Other','Warranty'].map((type) => (
      <button
        key={type}
        type="button"
        onClick={() =>
          setFormData({ ...formData, powerType: type })
        }
        className={`py-3 rounded-lg font-semibold transition-all ${
          formData.powerType === type
            ? 'bg-[#024a47] text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        {type}
      </button>
    ))}
  </div>
</div>
<div ref={pickupAddressRef} className="relative">
  <label className="block text-sm font-semibold text-gray-700 mb-2">
    Pickup Address *
  </label>
  <div className="relative">
    <input
      type="text"
      name="pickUpAddress"
      value={formData.pickUpAddress}
      onChange={(e) => handlePickupAddressChange(e.target.value)}
      onFocus={() => pickupSuggestions.length > 0 && setShowPickupSuggestions(true)}
      placeholder={loadingCurrentLocation ? "Detecting your location..." : "Start typing pickup address..."}
      className="w-full px-4 py-3 pr-24 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#024a47]"
      autoComplete="off"
      disabled={loadingCurrentLocation}
    />
    
    {/* Current Location Button */}
    <button
      type="button"
      onClick={getCurrentLocation}
      disabled={loadingCurrentLocation}
      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[#024a47] hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
      title="Use current location"
    >
      {loadingCurrentLocation ? (
        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )}
    </button>
  </div>
  
  {/* Loading Spinner for suggestions */}
  {loadingPickupSuggestions && (
    <div className="absolute right-3 top-11 text-gray-400 pointer-events-none">
      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>
  )}

  {/* Suggestions Dropdown */}
  {showPickupSuggestions && pickupSuggestions.length > 0 && (
    <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto mt-1">
      {pickupSuggestions.map((suggestion, index) => (
        <li
          key={index}
          onClick={() => handleSelectPickupSuggestion(suggestion)}
          className="px-4 py-3 hover:bg-[#024a47] hover:bg-opacity-10 cursor-pointer border-b border-gray-100 last:border-b-0"
        >
          <div className="text-sm text-gray-900">{suggestion.displayName}</div>
        </li>
      ))}
    </ul>
  )}

  {/* No Results Message */}
  {showPickupSuggestions && !loadingPickupSuggestions && formData.pickUpAddress && formData.pickUpAddress.length >= 2 && pickupSuggestions.length === 0 && (
    <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 px-4 py-3 text-sm text-gray-500">
      No locations found
    </div>
  )}
  
  <p className="text-xs text-gray-500 mt-1">
    {loadingCurrentLocation 
      ? "📍 Detecting your current location..." 
      : "Current location detected. You can edit or use the location button to refresh"}
  </p>
</div>
              </div>
            )}


            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-[#024a47] mb-4">
                  Pricing & Images
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Monthly Rent Price *
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-3 text-gray-600">$</span>
                      <input
                        type="number"
                        name="rentPrice"
                        value={formData.rentPrice}
                        onChange={handleInputChange}
                        placeholder="49.99"
                        step="0.01"
                        min="0"
                        className="w-full pl-8 pr-4 py-3 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#024a47]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Buy Now Price *
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-3 text-gray-600">$</span>
                      <input
                        type="number"
                        name="buyPrice"
                        value={formData.buyPrice}
                        onChange={handleInputChange}
                        placeholder="599.99"
                        step="0.01"
                        min="0"
                        className="w-full pl-8 pr-4 py-3 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#024a47]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      Delivery Price *
    </label>
    <div className="relative">
      <span className="absolute left-4 top-3 text-gray-600">$</span>
      <input
        type="number"
        name="deliveryPrice"
        value={formData.deliveryPrice}
        onChange={handleInputChange}
        placeholder="30.00"
        step="0.01"
        min="0"
        className="w-full pl-8 pr-4 py-3 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#024a47]"
      />
    </div>
  </div>

  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      Installation Price *
    </label>
    <div className="relative">
      <span className="absolute left-4 top-3 text-gray-600">$</span>
      <input
        type="number"
        name="installationPrice"
        value={formData.installationPrice}
        onChange={handleInputChange}
        placeholder="30.00"
        step="0.01"
        min="0"
        className="w-full pl-8 pr-4 py-3 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#024a47]"
      />
    </div>
  </div>
</div>
                </div>

                <div>
  <label className="block text-sm font-semibold text-gray-700 mb-2">
    Upload Image * (Max 10MB)
  </label>
  <input
    type="file"
    id="image-upload"
    accept="image/png,image/jpeg,image/jpg"
    onChange={handleImageChange}
    multiple
    onClick={(e) => {
      const file = e.target.files[0];
      if (!file) return;
    
      // your existing code...
      // after processing:
    
      e.target.value = ""; // reset safely here
    }}
    className="hidden"
  />
  <label
    htmlFor="image-upload"
    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#024a47] transition-colors cursor-pointer block"
  >
    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
    <p className="text-gray-600 mb-2">
      Click to upload or drag and drop
    </p>
    <p className="text-sm text-gray-500">
      PNG, JPG up to 10MB (3 image only)
    </p>
  </label>


  {imagePreviews.length > 0 && (
  <div className="grid grid-cols-3 gap-4 mt-4">
    {imagePreviews.map((preview, index) => (
      <div key={index} className="relative group">
        <img
          src={preview}
          alt={`Preview ${index + 1}`}
          className="w-full h-48 object-cover rounded-lg"
        />
        <button
          type="button"
          onClick={() => removeImage(index)}
          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
          {index + 3} of {imagePreviews.length}
        </div>
      </div>
    ))}
  </div>
)}
</div>
              </div>
            )}

       
            {step === 3 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-[#024a47] mb-4">
                  Description & Publish
                </h2>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description * (Min 25 characters)
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="6"
                    placeholder="Describe the appliance, its features, and condition..."
                    className="w-full px-4 py-3 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#024a47] resize-none"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.description.length} / 2000 characters
                  </p>
                </div>

           

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Title:</span>
                      <span className="font-semibold">{formData.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Category:</span>
                      <span className="font-semibold capitalize">
                        {formData.category}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rent Price:</span>
                      <span className="font-semibold text-green-600">
                        ${formData.rentPrice}/mo
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Buy Price:</span>
                      <span className="font-semibold text-blue-600">
                        ${formData.buyPrice}
                      </span>
                    </div>
                    <div className="flex justify-between">
  <span className="text-gray-600">Images:</span>
  <span className="font-semibold">
    {imageFiles.length} uploaded
  </span>
</div>

<div className="flex justify-between">
  <span className="text-gray-600">Power Type:</span>
  <span className="font-semibold capitalize">
    {formData.powerType}
  </span>
</div>
<div className="flex justify-between">
  <span className="text-gray-600">Delivery Price:</span>
  <span className="font-semibold">
    ${formData.deliveryPrice}
  </span>
</div>
<div className="flex justify-between">
  <span className="text-gray-600">Installation Price:</span>
  <span className="font-semibold">
    ${formData.installationPrice}
  </span>
</div>
                  </div>
                </div>
              </div>
            )}

           
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              {step > 1 && (
                <button
                  onClick={() => setStep(step - 1)}
                  disabled={loading}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Back
                </button>
              )}
              {step < 3 ? (
                <button
                  onClick={handleNext}
                  className="ml-auto px-6 py-3 bg-[#024a47] text-white rounded-lg font-semibold hover:bg-[#035d59] transition-all"
                >
                  Continue
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="ml-auto px-6 py-3 bg-[#024a47] text-white rounded-lg font-semibold hover:bg-[#035d59] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Publish Listing</span>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ListingCreationFlow;