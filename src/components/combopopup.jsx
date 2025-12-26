import { useState, useEffect, useRef } from "react";
import React from "react";
import axios from 'axios'
import {BASE_URL} from '../baseUrl'
import {ToastContainer,toast} from 'react-toastify'
import { ArrowBigLeft ,User} from "lucide-react";
import { useNavigate } from "react-router-dom";
import LocationSuggestionField from "./locationsuggestionfield";
import LocationSuggestionFieldPickup from "./locationsuggestionpickup";
const FIXED_WARRANTY_FEE = 15;
const ComboPopup = ({open,onClose,newMessagesLength,setOpen,menuRef,user,selectedComboAppliance, handlePlugTypeSelect,setShowComboPopup }) => {
  const [selectedDeliveryOption, setSelectedDeliveryOption] = useState('');
  const [selectedInstallOption, setSelectedInstallOption] = useState('');
  const [isEditingPickupAddress, setIsEditingPickupAddress] = useState(false);
const [pickupAddressAccepted, setPickupAddressAccepted] = useState(false);
const [newPickupAddress, setNewPickupAddress] = useState({
  city: '',
  state: '',
  zipCode: ''
});
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNoInstallPopup, setShowNoInstallPopup] = useState(false);

  
  const [suggestions, setSuggestions] = useState({
    street: [],
    city: [],
    state: [],
    country: []
  });
  
  const [showSuggestions, setShowSuggestions] = useState({
    street: false,
    city: false,
    state: false,
    country: false
  });
  
  const [loading, setLoading] = useState({
    street: false,
    city: false,
    state: false,
    country: false
  });
  
  const navigate=useNavigate();


  const wrapperRefs = {
    street: useRef(null),
    city: useRef(null),
    state: useRef(null),
    country: useRef(null)
  };

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      Object.keys(wrapperRefs).forEach(field => {
        if (wrapperRefs[field].current && !wrapperRefs[field].current.contains(event.target)) {
          setShowSuggestions(prev => ({ ...prev, [field]: false }));
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  

  // Fetch location suggestions from OpenStreetMap
  const fetchSuggestions = async (value, field) => {
    if (!value || value.length < 2) {
      setSuggestions(prev => ({ ...prev, [field]: [] }));
      return;
    }

    setLoading(prev => ({ ...prev, [field]: true }));
    try {
      let searchQuery = value;
      
      // Build search query based on field and existing data
      if (field === 'city' && deliveryAddress.country) {
        searchQuery = `${value}, ${deliveryAddress.country}`;
      } else if (field === 'state' && deliveryAddress.country) {
        searchQuery = `${value}, ${deliveryAddress.country}`;
      } else if (field === 'street' && deliveryAddress.city && deliveryAddress.country) {
        searchQuery = `${value}, ${deliveryAddress.city}, ${deliveryAddress.country}`;
      }
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'RentalApp/1.0'
          }
        }
      );
      
      const data = await response.json();
      
      let formattedSuggestions = [];
      
      if (field === 'street') {
        formattedSuggestions = data.map(item => ({
          displayName: item.display_name,
          street: item.address?.road || item.address?.street || '',
          houseNumber: item.address?.house_number || '',
          city: item.address?.city || item.address?.town || item.address?.village || '',
          state: item.address?.state || '',
          zipCode: item.address?.postcode || '',
          country: item.address?.country || ''
        }));
      } else if (field === 'city') {
        formattedSuggestions = data
          .filter(item => item.address?.city || item.address?.town || item.address?.village)
          .map(item => ({
            displayName: item.address?.city || item.address?.town || item.address?.village || '',
            city: item.address?.city || item.address?.town || item.address?.village || '',
            state: item.address?.state || '',
            country: item.address?.country || ''
          }));
      } else if (field === 'state') {
        formattedSuggestions = data
          .filter(item => item.address?.state)
          .map(item => ({
            displayName: item.address?.state || '',
            state: item.address?.state || '',
            country: item.address?.country || ''
          }));
      } else if (field === 'country') {
        formattedSuggestions = data
          .filter(item => item.address?.country)
          .map(item => ({
            displayName: item.address?.country || '',
            country: item.address?.country || ''
          }));
      }
      
      // Remove duplicates
      const uniqueSuggestions = formattedSuggestions.filter((item, index, self) =>
        index === self.findIndex((t) => t.displayName === item.displayName)
      );
      
      setSuggestions(prev => ({ ...prev, [field]: uniqueSuggestions }));
      setShowSuggestions(prev => ({ ...prev, [field]: true }));
    } catch (error) {
      console.error('Error fetching location suggestions:', error);
      setSuggestions(prev => ({ ...prev, [field]: [] }));
    } finally {
      setLoading(prev => ({ ...prev, [field]: false }));
    }
  };

  // Debounce for each field
  useEffect(() => {
    const timer = setTimeout(() => {
      if (deliveryAddress.street) fetchSuggestions(deliveryAddress.street, 'street');
    }, 300);
    return () => clearTimeout(timer);
  }, [deliveryAddress.street]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (deliveryAddress.city) fetchSuggestions(deliveryAddress.city, 'city');
    }, 300);
    return () => clearTimeout(timer);
  }, [deliveryAddress.city]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (deliveryAddress.state) fetchSuggestions(deliveryAddress.state, 'state');
    }, 300);
    return () => clearTimeout(timer);
  }, [deliveryAddress.state]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (deliveryAddress.country) fetchSuggestions(deliveryAddress.country, 'country');
    }, 300);
    return () => clearTimeout(timer);
  }, [deliveryAddress.country]);


// Add this useEffect after your other useEffects
useEffect(() => {
  const fetchUserLocation = async () => {
    if (selectedDeliveryOption === 'pickup' && !newPickupAddress.city && !newPickupAddress.state && !newPickupAddress.zipCode) {
      try {
        // Get user's coordinates
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              
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
              const addr = data.address || {};
              
              // Set the pickup address with user location
              setNewPickupAddress({
                city: addr.city || addr.town || addr.village || '',
                state: addr.state || '',
                zipCode: addr.postcode || ''
              });
            },
            (error) => {
              console.error('Error getting location:', error);
              toast.info('Unable to get your location. Please enter manually.', {containerId:"combopopup"});
            }
          );
        }
      } catch (error) {
        console.error('Error fetching user location:', error);
      }
    }
  };

  fetchUserLocation();
}, [selectedDeliveryOption]);

  const handleInputChange = (field, value) => {
    setDeliveryAddress(prev => ({ ...prev, [field]: value }));
    setShowSuggestions(prev => ({ ...prev, [field]: true }));
  };

  const handleSelectSuggestion = (suggestion, field) => {
    if (field === 'street') {
      const fullStreet = suggestion.houseNumber 
        ? `${suggestion.houseNumber} ${suggestion.street}`.trim()
        : suggestion.street || suggestion.displayName.split(',')[0];

      setDeliveryAddress({
        street: fullStreet,
        city: suggestion.city || deliveryAddress.city,
        state: suggestion.state || deliveryAddress.state,
        zipCode: suggestion.zipCode || deliveryAddress.zipCode,
        country: suggestion.country || deliveryAddress.country
      });
    } else if (field === 'city') {
      setDeliveryAddress(prev => ({
        ...prev,
        city: suggestion.city,
        state: suggestion.state || prev.state,
        country: suggestion.country || prev.country
      }));
    } else if (field === 'state') {
      setDeliveryAddress(prev => ({
        ...prev,
        state: suggestion.state,
        country: suggestion.country || prev.country
      }));
    } else if (field === 'country') {
      setDeliveryAddress(prev => ({
        ...prev,
        country: suggestion.country
      }));
    }
    
    setShowSuggestions(prev => ({ ...prev, [field]: false }));
    setSuggestions(prev => ({ ...prev, [field]: [] }));
  };

  const handleFinalSubmit = async() => {
    setIsSubmitting(true);
    try{
      let token=localStorage.getItem('token')
      
      // Prepare request body
      const requestBody = {
        listing: selectedComboAppliance._id,
        vendor: selectedComboAppliance.vendor._id,
        deliveryType: selectedDeliveryOption,
        installationType: selectedInstallOption
      };
      
      // Add delivery address only if delivery is selected
      if (selectedDeliveryOption === 'delivery') {
        requestBody.deliveryAddress = deliveryAddress;
      }

      
      if (selectedDeliveryOption === 'pickup' && newPickupAddress) {
        const pickupAddressString = `${newPickupAddress.city}, ${newPickupAddress.state} ${newPickupAddress.zipCode}`.trim();
        requestBody.pickUpAddress = pickupAddressString;
      }
      if (selectedDeliveryOption === 'pickup' && !pickupAddressAccepted) {
        toast.info('Please confirm the pickup address to proceed',{containerId:"combopopup"});
        setIsSubmitting(false);
        return;
      }
      
      
      let response = await axios.post(`${BASE_URL}/sendRequestUser`, requestBody, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      toast.success('Request submitted successfully!');
      
      // Small delay to show success message
      setTimeout(() => {
        onClose();
        window.location.reload(true);
      }, 1000);
    } catch(e) {
      console.log(e.message);
      toast.error(e?.response?.data?.error || 'Error submitting request');
      setIsSubmitting(false);
    }
  };



  const renderSuggestionDropdown = (field) => {
    return (
      <>
        {loading[field] && (
          <div className="absolute right-3 top-3 text-gray-400 pointer-events-none">
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}

        {showSuggestions[field] && suggestions[field].length > 0 && (
          <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto mt-1">
            {suggestions[field].map((suggestion, index) => (
              <li
                key={index}
                onClick={() => handleSelectSuggestion(suggestion, field)}
                className="px-4 py-3 hover:bg-[#024a47] hover:bg-opacity-10 cursor-pointer border-b border-gray-100 last:border-b-0"
              >
                <div className="text-sm text-gray-900">{suggestion.displayName}</div>
              </li>
            ))}
          </ul>
        )}

        {showSuggestions[field] && !loading[field] && deliveryAddress[field] && deliveryAddress[field].length >= 2 && suggestions[field].length === 0 && (
          <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 px-4 py-3 text-sm text-gray-500">
            No locations found
          </div>
        )}
      </>
    );
  };

  return (
    <>
    <ToastContainer containerId={"combopopup"}/>
    
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
    
      <div className="p-4 sm:p-6 md:p-8">
      <h1 style={{paddingLeft:'5rem'}} className="text-center text-3xl sm:text-4xl font-bold text-gray-900">
   MARKETPLACE
  </h1>
        <div className="max-w-4xl mx-auto">
        
          <div className="mb-6 flex py-[3rem] justify-between items-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Hi, {user?.name?user?.name:"Renter"} 👋
            </h1>

            <div className="relative" ref={menuRef}>
            <div
      className="relative cursor-pointer"
      onClick={() => setOpen(!open)}
    >
    
      <User className="w-8 h-8 text-gray-700" />

     
      {newMessagesLength > 0 && (
        <span className="absolute top-0 right-0 h-3 w-3 rounded-full bg-red-600"></span>
      )}
    </div>
              {open && (
                <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-md border p-2 z-50">
                  <div 
                    onClick={() => navigate("/renterdashboard")}
                    className="px-3 py-2 hover:bg-gray-100 rounded cursor-pointer"
                  >
                    Dashboard
                  </div>
                  <div
  onClick={() => navigate("/userchat")}
  className="px-3 py-2 hover:bg-gray-100 rounded cursor-pointer flex items-center gap-2"
>
  {newMessagesLength > 0 && (
    <span className="h-2 w-2 rounded-full bg-red-600 inline-block"></span>
  )}
  Chat
</div>
                  <div 
          onClick={() => navigate("/profile")}
          className="px-3 py-2 hover:bg-gray-100 rounded cursor-pointer"
        >
          Profile
        </div>
                  <div 
                    onClick={() => {
                      localStorage.removeItem('token')
                      window.location.href='/'
                    }}
                    className="px-3 py-2 hover:bg-gray-100 rounded cursor-pointer"
                  >
                    Logout
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      

      <div className="flex-1 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl border border-gray-200 p-8 shadow-lg">
          {/* Back Button */}
          <button 
  onClick={(e) => {
    e.stopPropagation();
    onClose();  // Use the passed function instead
  }}
  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors group"
> 
            <svg 
              className="w-6 h-6 transform group-hover:-translate-x-1 transition-transform" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15 19l-7-7 7-7" 
              />
            </svg>
            <span className="font-medium">Back to Appliances</span>
          </button>

          {/* Product Summary */}
          <div className="mb-8 text-center">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              {selectedComboAppliance?.vendor?.name || "Vendor"}
            </h3>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {selectedComboAppliance?.title}
            </h2>
            <p className="text-3xl font-bold text-gray-900">${selectedComboAppliance?.pricing?.rentPrice}/mo</p>
           
          </div>

          {/* Product Image */}
          <div className="flex justify-center mb-8">
            <img 
              src={selectedComboAppliance?.images?.find(img => img.isPrimary)?.url || selectedComboAppliance?.images?.[0]?.url || 'https://via.placeholder.com/200'} 
              alt={selectedComboAppliance?.title}
              className="w-48 h-48 object-contain"
            />
          </div>

          {selectedDeliveryOption === 'pickup' && selectedComboAppliance?.pickUpAddress && (
  <div className="mb-8 text-center p-4 bg-gray-50 rounded-lg">
    <div className="flex justify-between items-start mb-4">
      <h3 className="text-lg font-bold text-gray-900">PICKUP ADDRESS</h3>
      <button
        type="button"
        onClick={() => setIsEditingPickupAddress(!isEditingPickupAddress)}
        className="text-[#024a47] hover:text-[#036661] text-sm font-medium"
      >
        {isEditingPickupAddress ? 'Cancel' : 'Change Address'}
      </button>
    </div>
    
    {!isEditingPickupAddress ? (
      <>
    <p className="text-gray-700 mb-4">
  {selectedComboAppliance.pickUpAddress}
</p>
        <label className="flex items-start space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={pickupAddressAccepted}
            onChange={(e) => setPickupAddressAccepted(e.target.checked)}
            className="mt-1 h-4 w-4 text-[#024a47] border-gray-300 rounded focus:ring-[#024a47]"
            required
          />
          <span className="text-sm text-gray-700">
            I confirm this pickup address is correct and I accept the terms for pickup
          </span>
        </label>
      </>
    ) : (
      <div className="space-y-4">
        <LocationSuggestionFieldPickup
          value={newPickupAddress}
          onChange={setNewPickupAddress}
          name="pickup-location"
          required={true}
        />
       <div className="space-y-4">
  <input
    type="text"
    placeholder="City"
    value={newPickupAddress.city}
    onChange={(e) => setNewPickupAddress({...newPickupAddress, city: e.target.value})}
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#024a47]"
    required
  />
  <input
    type="text"
    placeholder="State"
    value={newPickupAddress.state}
    onChange={(e) => setNewPickupAddress({...newPickupAddress, state: e.target.value})}
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#024a47]"
    required
  />
  <input
    type="text"
    placeholder="Zip Code"
    value={newPickupAddress.zipCode}
    onChange={(e) => setNewPickupAddress({...newPickupAddress, zipCode: e.target.value})}
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#024a47]"
    required
  />
  <button
    type="button"
    onClick={() => {
      if (newPickupAddress.city && newPickupAddress.state && newPickupAddress.zipCode) {
        setIsEditingPickupAddress(false);
        setPickupAddressAccepted(false);
      } else {
        toast.info('Please fill in all address fields', {containerId:"combopopup"});
      }
    }}
    className="px-4 py-2 bg-[#024a47] text-white rounded-lg hover:bg-[#036661] text-sm font-medium"
  >
    Save Address
  </button>
</div>
      </div>
    )}
  </div>
)}
          {/* Pickup or Delivery Section */}
          <div className="mb-8 text-center justify-center items-center flex flex-col">
            <h3 className="text-lg font-bold text-gray-900 mb-4">PICKUP OR DELIVERY</h3>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input 
                  type="radio" 
                  name="delivery" 
                  value="pickup"
                  checked={selectedDeliveryOption === 'pickup'}
                  onChange={(e) => setSelectedDeliveryOption(e.target.value)}
                  className="w-5 h-5 text-[#024a47]"
                />
                <span className="text-lg font-semibold text-gray-900">PICKUP</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input 
                  type="radio" 
                  name="delivery" 
                  value="delivery"
                  checked={selectedDeliveryOption === 'delivery'}
                  onChange={(e) => setSelectedDeliveryOption(e.target.value)}
                  className="w-5 h-5 text-[#024a47]"
                />
                <span className="text-lg font-semibold text-gray-900">DELIVERY</span>
              </label>
            </div>
          </div>

          {/* Delivery Address - Show only when delivery is selected */}
          {selectedDeliveryOption === 'delivery' && (
            <div className="mb-8 text-center flex flex-col justify-center items-center p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-4">DELIVERY ADDRESS</h3>
              <div className="space-y-3">
                {/* Street Address */}
                <div ref={wrapperRefs.street} className="relative">
                  <input
                    type="text"
                    placeholder="Start typing street address..."
                    value={deliveryAddress.street}
                    onChange={(e) => handleInputChange('street', e.target.value)}
                    onFocus={() => suggestions.street.length > 0 && setShowSuggestions(prev => ({ ...prev, street: true }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#024a47]"
                    autoComplete="off"
                    required
                  />
                  {renderSuggestionDropdown('street')}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* City */}
                  <div ref={wrapperRefs.city} className="relative">
                    <input
                      type="text"
                      placeholder="City"
                      value={deliveryAddress.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      onFocus={() => suggestions.city.length > 0 && setShowSuggestions(prev => ({ ...prev, city: true }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#024a47]"
                      autoComplete="off"
                      required
                    />
                    {renderSuggestionDropdown('city')}
                  </div>
                  
                  {/* State */}
                  <div ref={wrapperRefs.state} className="relative">
                    <input
                      type="text"
                      placeholder="State"
                      value={deliveryAddress.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      onFocus={() => suggestions.state.length > 0 && setShowSuggestions(prev => ({ ...prev, state: true }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#024a47]"
                      autoComplete="off"
                      required
                    />
                    {renderSuggestionDropdown('state')}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {/* Zip Code */}
                  <input
                    type="text"
                    placeholder="Zip Code"
                    value={deliveryAddress.zipCode}
                    onChange={(e) => setDeliveryAddress({...deliveryAddress, zipCode: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#024a47]"
                    required
                  />
                  
                  {/* Country */}
                  <div ref={wrapperRefs.country} className="relative">
                    <input
                      type="text"
                      placeholder="Country"
                      value={deliveryAddress.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      onFocus={() => suggestions.country.length > 0 && setShowSuggestions(prev => ({ ...prev, country: true }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#024a47]"
                      autoComplete="off"
                      required
                    />
                    {renderSuggestionDropdown('country')}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Estimated Payment */}
          <div className="mb-8 pb-8 text-center border-b border-gray-200">
            <p className="text-lg text-gray-900">
              Estimated monthly payment: <span className="font-bold">${selectedComboAppliance?.pricing?.rentPrice} + fees</span>
            </p>
            {selectedComboAppliance?.powerType == "Warranty" && (
      <p className="text-lg font-semibold text-green-600">
        + ${FIXED_WARRANTY_FEE}/mo Warranty Protection
      </p>
    )}
          </div>

          {/* Installation Options */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <button
             onClick={() => setShowNoInstallPopup(true)}
              className={`py-4 px-6 rounded-lg font-semibold text-lg transition-colors border-2 ${
                selectedInstallOption === 'no-install'
                  ? 'bg-[#024a47] text-white border-[#024a47]'
                  : 'bg-white border-[#024a47] text-[#024a47] hover:bg-gray-50'
              }`}
            >
              NO INSTALL
            </button>
            <button
  onClick={() => setSelectedInstallOption('installation')}
  className={`min-w-[180px] sm:min-w-[220px] py-4 px-6 rounded-lg font-semibold text-lg transition-colors border-2 ${
    selectedInstallOption === 'installation'
      ? 'bg-[#024a47] text-white border-[#024a47]'
      : 'bg-white border-[#024a47] text-[#024a47] hover:bg-gray-50'
  }`}
>
  INSTALLATION
</button>

          </div>

          {/* Connect to Vendor Button */}
          <button
  onClick={handleFinalSubmit}
  disabled={
    isSubmitting ||
    !selectedDeliveryOption || 
    !selectedInstallOption || 
    (selectedDeliveryOption === 'delivery' && (!deliveryAddress.street || !deliveryAddress.city || !deliveryAddress.state || !deliveryAddress.zipCode || !deliveryAddress.country))
  }
  className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-colors relative ${
    !isSubmitting && selectedDeliveryOption && selectedInstallOption && 
    (selectedDeliveryOption === 'pickup' || (selectedDeliveryOption === 'delivery' && deliveryAddress.street && deliveryAddress.city && deliveryAddress.state && deliveryAddress.zipCode && deliveryAddress.country))
      ? 'bg-[#024a47] text-white hover:bg-[#035d59]'
      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
  }`}
>
  {isSubmitting ? (
    <div className="flex items-center justify-center gap-2">
      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span>Submitting...</span>
    </div>
  ) : (
    'Send Request'
  )}
</button>

          {/* Terms */}
          <p className="text-center text-sm text-gray-600 mt-4">
            By continuing, you agree to rental terms and <a href="#" className="underline">privacy</a>.
          </p>
        </div>
      </div>
    </div>

    {showNoInstallPopup && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-6 relative shadow-2xl">
          {/* Close button */}
          <button
            onClick={() => setShowNoInstallPopup(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Content */}
          <div className="mt-2">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Self-Install Acknowledgment</h3>
            <p className="text-gray-700 text-sm leading-relaxed mb-6">
              By selecting the "Self-Install" option, you acknowledge that you are assuming full responsibility for the installation of this unit. Please note that any self-installation will void all vendor-provided warranty or service obligations, if offered. RentSimple and the vendor will not be liable for damages, improper installation, or future service requests resulting from self-installation.
            </p>

          
            <button
              onClick={() => {
                setSelectedInstallOption('no-install');
                setShowNoInstallPopup(false);
              }}
              className="w-full py-3 px-6 bg-[#024a47] text-white rounded-lg font-semibold hover:bg-[#035d59] transition-colors"
            >
              I Acknowledge
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default ComboPopup;