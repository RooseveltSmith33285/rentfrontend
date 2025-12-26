import { useEffect, useRef, useState } from 'react';
import React from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import { BASE_URL } from '../baseUrl';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ComboPopup from '../components/combopopup';
import {User} from 'lucide-react'
import SupportChatWidget from './useradminchat';

const priceRanges = [
  { label: '$20-$60', min: 20, max: 60 },
  { label: '$60-$100', min: 60, max: 100 },
  { label: '$100-$140', min: 100, max: 140 },
  { label: '$140-$180', min: 140, max: 180 },
  { label: '$180-$220', min: 180, max: 220 },
  { label: '$220-$250', min: 220, max: 250 }
];
export default function ApplianceRentalPage() {
    const [searchParams, setSearchParams] = useSearchParams();
  const [appliances, setAppliances] = useState([]);
  const [filteredAppliances, setFilteredAppliances] = useState([]);
  const [viewedListings, setViewedListings] = useState(new Set());
  const [selectedRejectionReason, setSelectedRejectionReason] = useState('');
const [customRejectionReason, setCustomRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
const [rejectionReason, setRejectionReason] = useState('');
const [isRejecting, setIsRejecting] = useState(false);
const [applianceToReject, setApplianceToReject] = useState(null);
  const [hoveredListing, setHoveredListing] = useState(null);
  const [open,setOpen]=useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState({});
  const [showComboPopup, setShowComboPopup] = useState(false);
  const [newMessagesLength,setNewMessagesLength]=useState(0)
  useEffect(() => {
    const applianceId = searchParams.get('appliance');
    if (applianceId && appliances.length > 0) {
      const appliance = appliances.find(a => a._id === applianceId);
      if (appliance) {
        setSelectedComboAppliance(appliance);
        setShowComboPopup(true);
      }
    }
  }, [appliances, searchParams]);
  const [selectedComboAppliance, setSelectedComboAppliance] = useState(null);
  const [selectedPlugType, setSelectedPlugType] = useState('');
  const [requests, setRequests] = useState([]);
  const [showPlugpopup, setshowPlugpopup] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(() => {
    const categoryParam = searchParams.get('category');
    return categoryParam || '';
  });
  const [selectedPriceRange, setSelectedPriceRange] = useState(() => {
    const priceParam = searchParams.get('price');
    if (priceParam) {
      return priceRanges.find(range => range.label === priceParam) || null;
    }
    return null;
  });
  
  
  const [showPriceDropdown, setShowPriceDropdown] = useState(false);
  const navigate = useNavigate();
  const [user,setUser]=useState({})
  const menuRef=useRef();

 

  const rejectionReasons = [
    {
      value: 'budget',
      label: 'Budget Limitations',
      description: "The renter can't proceed due to current financial constraints."
    },
    {
      value: 'scheduling',
      label: 'Scheduling Conflict',
      description: "The proposed delivery or rental window doesn't fit their availability."
    },
    {
      value: 'not-fit',
      label: 'Unit Not a Good Fit',
      description: "The appliance doesn't match the renter's needs in size, features, or brand."
    },
    {
      value: 'condition',
      label: 'Condition Concerns',
      description: "The renter isn't comfortable with the condition shown in the photos or video."
    },
    {
      value: 'change-plans',
      label: 'Change in Plans',
      description: 'The renter no longer needs the appliance or has chosen an alternative.'
    },
    {
      value: 'other',
      label: 'Other',
      description: 'Please specify your reason below.'
    }
  ];


  useEffect(() => {
    getProducts();
    getUserRequests();
    getNewMessages();
  }, []);


  const getNewMessages=async()=>{
    try{
      let token=localStorage.getItem('token')
let response=await axios.get(`${BASE_URL}/unSeenMessagesLength`,{
  headers:{
    Authorization:`Bearer ${token}`
  }
})

setNewMessagesLength(response.data.messagesLength)
    }catch(e){
      
    }
  }
  // Apply filters whenever appliances, category, or price range changes
  useEffect(() => {
    applyFilters();
  }, [appliances, selectedCategory, selectedPriceRange]);

  // 🚀 NEW: Sort appliances by boost status and amount
  const sortByBoost = (appliancesList) => {
    return [...appliancesList].sort((a, b) => {
      // Check if boost is active (not expired)
      const now = new Date();
      const aBoostActive = a.visibility?.isBoosted && 
                          a.visibility?.boostEndDate && 
                          new Date(a.visibility.boostEndDate) > now;
      const bBoostActive = b.visibility?.isBoosted && 
                          b.visibility?.boostEndDate && 
                          new Date(b.visibility.boostEndDate) > now;
      
      // Get boost amounts (default to 0 if not boosted or expired)
      const aBoostAmount = aBoostActive ? (a.visibility?.boostAmount || 0) : 0;
      const bBoostAmount = bBoostActive ? (b.visibility?.boostAmount || 0) : 0;
      
      // Sort by boost amount (highest first)
      if (bBoostAmount !== aBoostAmount) {
        return bBoostAmount - aBoostAmount;
      }
      
      // If boost amounts are equal, sort by creation date (newest first)
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  };

  const applyFilters = () => {
    let filtered = [...appliances];

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(appliance => {
        const category = appliance.category.toLowerCase();
        const title = appliance.title.toLowerCase();
        const searchTerm = selectedCategory.toLowerCase();
        
        // Handle "Washer & Dryer" specially
        if (searchTerm === 'washer & dryer') {
          return (category.includes('washer') && category.includes('dryer')) ||
                 (title.includes('washer') && title.includes('dryer'));
        }
        
        return category.includes(searchTerm) || title.includes(searchTerm);
      });
    }

    // Apply price filter
    if (selectedPriceRange) {
      filtered = filtered.filter(appliance => {
        const price = appliance.pricing.rentPrice;
        return price >= selectedPriceRange.min && price <= selectedPriceRange.max;
      });
    }

    // 🚀 Sort by boost amount after filtering
    filtered = sortByBoost(filtered);

    setFilteredAppliances(filtered);
  };

  const handleCategoryFilter = (category) => {
    if (selectedCategory === category) {
      setSelectedCategory('');
      searchParams.delete('category');
    } else {
      setSelectedCategory(category);
      searchParams.set('category', category);
    }
    setSearchParams(searchParams);
  };

  const handlePriceFilter = (range) => {
    if (selectedPriceRange?.label === range.label) {
      setSelectedPriceRange(null);
      searchParams.delete('price');
    } else {
      setSelectedPriceRange(range);
      searchParams.set('price', range.label);
    }
    setSearchParams(searchParams);
    setShowPriceDropdown(false);
  };

  const handleSelect = (appliance) => {
    try {
      // Add appliance ID to URL
      searchParams.set('appliance', appliance._id);
      setSearchParams(searchParams);
      
      // Check if it's a TV appliance
      if (appliance.title.toLowerCase().includes('tv')) {
        setSelectedComboAppliance(appliance);
        setshowPlugpopup(true);
        setShowComboPopup(true);
        return;
      }
      
      // Check if it's a combo appliance (dryer with plug options)
      if (appliance.combo === true) {
        setSelectedComboAppliance(appliance);
        setShowComboPopup(true);
        setshowPlugpopup(true);
        return;
      }
      
      // For regular appliances (not TV, not combo)
      setSelectedComboAppliance(appliance);
      setshowPlugpopup(false);
      setShowComboPopup(true);
  
    } catch (e) {
      console.error('Error selecting appliance:', e);
      toast.error('Error selecting appliance',{containerId:"productsPage"});
    }
  };


  const handlePlugTypeSelect = (plugType) => {
    try {
      setSelectedPlugType(plugType);
      setShowComboPopup(false);
      setSelectedComboAppliance(null);
      setSelectedPlugType('');
      toast.success('Selection confirmed',{containerId:"productsPage"});
    } catch (e) {
      console.error('Error with selection:', e);
      toast.error('Error with selection',{containerId:"productsPage"});
    }
  };

  const handleCloseComboPopup = () => {
    searchParams.delete('appliance');
    setSearchParams(searchParams);
    setShowComboPopup(false);
    setSelectedComboAppliance(null);
    setSelectedPlugType('');
  };


  // Track when a user views a listing



  const getProducts = async () => {
    try {
      let token=localStorage.getItem('token')
      let response = await axios.get(`${BASE_URL}/getUserListenings`,{
        headers:{
          Authorization:`Bearer ${token}`
        }
      });
      const listenings = response.data.listenings || [];
      console.log(listenings)
      console.log("LIstenings")
      // 🚀 Sort by boost immediately when fetching
      const sortedListenings = sortByBoost(listenings);
      setUser(response.data.user)
      setAppliances(sortedListenings);
    } catch (e) {
      if (e?.response?.data?.error) {
        toast.dismiss();
        toast.error(e?.response?.data?.error, { containerId: "productsPage" });
      } else {
        toast.dismiss();
        toast.error("Error while fetching products please try again", { containerId: "productsPage" });
      }
    }
  };


  const trackView = async (listingId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${BASE_URL}/trackView/${listingId}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };
  const getPrimaryImage = (images) => {
    if (!images || images.length === 0) return 'https://via.placeholder.com/200';
    const primary = images.find(img => img.isPrimary);
    return primary ? primary.url : images[0].url;
  };

  const getFeatures = (specifications) => {
    if (!specifications || specifications.size === 0) return [];
    return Array.from(specifications.values()).slice(0, 3);
  };

  const getUserRequests = async () => {
    try {
      let token = localStorage.getItem('token');
      let response = await axios.get(`${BASE_URL}/getRequestsUser`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log(response.data)
      setRequests(response.data.requests);
    } catch (e) {
      console.error('Error fetching user requests:', e);
    }
  };

  const handleReject = (appliance, e) => {
    e.stopPropagation();
    setApplianceToReject(appliance);
    setShowRejectModal(true);
  };
   

  const confirmReject = async() => {
    const finalReason = selectedRejectionReason === 'other' 
      ? customRejectionReason.trim()
      : rejectionReasons.find(r => r.value === selectedRejectionReason)?.label;
  
    if (!finalReason) {
      toast.error('Please select or provide a reason for rejection',{containerId:"productsPage"});
      return;
    }
  
    setIsRejecting(true);
    
    try {
      // Changed: Use listing ID instead of request ID
      const listingId = applianceToReject._id;
      
      let response = await axios.patch(`${BASE_URL}/rejectOffer/${listingId}`, {
        rejectionReason: finalReason
      });
  
      // Update requests state
      setRequests(prev =>
        prev.map(req =>
          req.listing === applianceToReject._id
            ? { ...req, status: 'rejected', rejectionReason: finalReason }
            : req
        )
      );

      // Remove the rejected listing from appliances and filteredAppliances
      setAppliances(prev => prev.filter(app => app._id !== listingId));
      setFilteredAppliances(prev => prev.filter(app => app._id !== listingId));
  
      toast.success("Offer rejected successfully",{containerId:"productsPage"});
      setShowRejectModal(false);
      setSelectedRejectionReason('');
      setCustomRejectionReason('');
      setApplianceToReject(null);
    } catch(e) {
      console.log(e.message)
      if(e?.response?.data?.error) {
        toast.error(e?.response?.data?.error,{containerId:"productsPage"});
      } else {
        toast.error("Error occurred while trying to reject offer",{containerId:"productsPage"});
      }
    } finally {
      setIsRejecting(false);
    }
  
  };
  
  // Track views for all displayed appliances


  // Get all rejection reasons for a specific listing
// Get all rejection reasons for a specific listing
const getRejectionReasons = (listingId) => {
  return requests
    .filter(req => req.listing === listingId && req.status === 'rejected')
    .map(req => ({
      reason: req.rejectionReason || 'No reason provided',
      date: new Date(req.updatedAt).toLocaleDateString()
    }));
};

  // 🎨 NEW: Helper to check if boost is active
  const isBoostActive = (appliance) => {
    if (!appliance.visibility?.isBoosted) return false;
    if (!appliance.visibility?.boostEndDate) return false;
    return new Date(appliance.visibility.boostEndDate) > new Date();
  };

  // 🎨 NEW: Helper to get boost badge color based on amount
  const getBoostBadgeColor = (boostAmount) => {
    if (boostAmount >= 100) return 'bg-gradient-to-r from-yellow-400 to-orange-500';
    if (boostAmount >= 50) return 'bg-gradient-to-r from-blue-500 to-purple-600';
    if (boostAmount >= 10) return 'bg-gradient-to-r from-green-400 to-blue-500';
    return 'bg-gradient-to-r from-gray-400 to-gray-600';
  };

  const displayAppliances = filteredAppliances.length > 0 || selectedCategory || selectedPriceRange 
    ? filteredAppliances 
    : appliances;


    useEffect(() => {
      displayAppliances.forEach(appliance => {
        // Only track if not already viewed in this session
        if (!viewedListings.has(appliance._id)) {
          trackView(appliance._id);
          setViewedListings(prev => new Set(prev).add(appliance._id));
        }
      });
    }, [displayAppliances]);

  return (
    <>
      <ToastContainer containerId={"productsPage"} />
      <SupportChatWidget/>
      {showRejectModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Reject Offer</h2>
      <p className="text-gray-600 mb-6">Please select a reason for rejecting this offer:</p>
      
      <div className="space-y-3 mb-6">
        {rejectionReasons.map((reason) => (
          <label
            key={reason.value}
            className={`block cursor-pointer transition-all ${
              selectedRejectionReason === reason.value
                ? 'bg-red-50 border-2 border-red-500'
                : 'bg-gray-50 border-2 border-gray-200 hover:border-gray-300'
            } rounded-lg p-4`}
          >
            <div className="flex items-start">
              <input
                type="radio"
                name="rejectionReason"
                value={reason.value}
                checked={selectedRejectionReason === reason.value}
                onChange={(e) => setSelectedRejectionReason(e.target.value)}
                className="mt-1 w-4 h-4 text-red-600 focus:ring-red-500"
              />
              <div className="ml-3 flex-1">
                <div className="font-semibold text-gray-900">{reason.label}</div>
                <div className="text-sm text-gray-600 mt-1">{reason.description}</div>
              </div>
            </div>
          </label>
        ))}
      </div>

      {selectedRejectionReason === 'other' && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Please specify your reason:
          </label>
          <textarea
            value={customRejectionReason}
            onChange={(e) => setCustomRejectionReason(e.target.value)}
            placeholder="Enter your custom reason here..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[100px] resize-none"
            autoFocus
          />
        </div>
      )}
      
      <div className="flex gap-3">
        <button
          onClick={() => {
            setShowRejectModal(false);
            setSelectedRejectionReason('');
            setCustomRejectionReason('');
            setApplianceToReject(null);
          }}
          className="flex-1 py-3 px-6 rounded-lg font-semibold text-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={confirmReject}
          disabled={!selectedRejectionReason || (selectedRejectionReason === 'other' && !customRejectionReason.trim()) || isRejecting}
          className={`flex-1 py-3 px-6 rounded-lg font-semibold text-lg transition-colors ${
            selectedRejectionReason && (selectedRejectionReason !== 'other' || customRejectionReason.trim()) && !isRejecting
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isRejecting ? (
            <span className="flex items-center justify-center gap-2">
              <svg 
                className="animate-spin h-5 w-5 text-white" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24"
              >
                <circle 
                  className="opacity-25" 
                  cx="12" 
                  cy="12" 
                  r="10" 
                  stroke="currentColor" 
                  strokeWidth="4"
                />
                <path 
                  className="opacity-75" 
                  fill="currentColor" 
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Rejecting...
            </span>
          ) : (
            'Confirm Reject'
          )}
        </button>
      </div>
    </div>
  </div>
)}

      {showComboPopup ? (
        <ComboPopup
        newMessagesLength={newMessagesLength}
        user={user}
        open={open}
        setOpen={setOpen}
        menuRef={menuRef}
          selectedPlugType={selectedPlugType}
          setSelectedPlugType={setSelectedPlugType}
          showComboPopup={showComboPopup}
          setShowComboPopup={setShowComboPopup}
          selectedComboAppliance={selectedComboAppliance}
          handlePlugTypeSelect={handlePlugTypeSelect}
          onClose={handleCloseComboPopup}
        />
      ) : (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
               <h1 style={{paddingLeft:'5rem'}} className="text-center text-3xl sm:text-4xl font-bold text-gray-900">
   MARKETPLACE
  </h1>
          <div className="max-w-4xl mx-auto py-[3rem]">
           
            <div className="mb-6 flex justify-between items-center">
       
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


            <div className="flex flex-wrap gap-3 mb-6">
            
              <div className="relative">
                <button 
                  onClick={() => setShowPriceDropdown(!showPriceDropdown)}
                  className={`px-4 py-2 border rounded-full transition-colors ${
                    selectedPriceRange
                      ? 'bg-[#024a47] text-white border-[#024a47]'
                      : 'bg-white border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {selectedPriceRange ? selectedPriceRange.label : 'Price Range'} ▼
                </button>
                
                {showPriceDropdown && (
                  <div className="absolute top-full mt-2 left-0 bg-white border border-gray-300 rounded-lg shadow-lg z-10 min-w-[150px]">
                    {priceRanges.map((range, index) => (
                      <button
                        key={index}
                        onClick={() => handlePriceFilter(range)}
                        className={`block w-full text-left px-4 py-2 hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg ${
                          selectedPriceRange?.label === range.label ? 'bg-[#024a47] text-white hover:bg-[#035d59]' : ''
                        }`}
                      >
                        {range.label}
                      </button>
                    ))}
                    {selectedPriceRange && (
                      <button
                        onClick={() => handlePriceFilter(selectedPriceRange)}
                        className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 border-t border-gray-200 rounded-b-lg"
                      >
                        Clear Filter
                      </button>
                    )}
                  </div>
                )}
              </div>

          
              <button 
                onClick={() => handleCategoryFilter('Washer')}
                className={`px-4 py-2 border rounded-full transition-colors ${
                  selectedCategory === 'Washer'
                    ? 'bg-[#024a47] text-white border-[#024a47]'
                    : 'bg-white border-gray-300 hover:bg-gray-50'
                }`}
              >
                Washer
              </button>
              <button 
                onClick={() => handleCategoryFilter('Dryer')}
                className={`px-4 py-2 border rounded-full transition-colors ${
                  selectedCategory === 'Dryer'
                    ? 'bg-[#024a47] text-white border-[#024a47]'
                    : 'bg-white border-gray-300 hover:bg-gray-50'
                }`}
              >
                Dryer
              </button>
              <button 
                onClick={() => handleCategoryFilter('Washer & Dryer')}
                className={`px-4 py-2 border rounded-full transition-colors ${
                  selectedCategory === 'Washer & Dryer'
                    ? 'bg-[#024a47] text-white border-[#024a47]'
                    : 'bg-white border-gray-300 hover:bg-gray-50'
                }`}
              >
                Washer & Dryer
              </button>
              <button 
                onClick={() => handleCategoryFilter('Refrigerator')}
                className={`px-4 py-2 border rounded-full transition-colors ${
                  selectedCategory === 'Refrigerator'
                    ? 'bg-[#024a47] text-white border-[#024a47]'
                    : 'bg-white border-gray-300 hover:bg-gray-50'
                }`}
              >
                Refrigerator
              </button>
              <button 
                onClick={() => handleCategoryFilter('Deep Freezer')}
                className={`px-4 py-2 border rounded-full transition-colors ${
                  selectedCategory === 'Deep Freezer'
                    ? 'bg-[#024a47] text-white border-[#024a47]'
                    : 'bg-white border-gray-300 hover:bg-gray-50'
                }`}
              >
                Deep Freezer
              </button>
              <button 
                onClick={() => handleCategoryFilter('TV')}
                className={`px-4 py-2 border rounded-full transition-colors ${
                  selectedCategory === 'TV'
                    ? 'bg-[#024a47] text-white border-[#024a47]'
                    : 'bg-white border-gray-300 hover:bg-gray-50'
                }`}
              >
                TV
              </button>
            </div>

            {(selectedCategory || selectedPriceRange) && (
              <div className="mb-4 flex items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-600">Active filters:</span>
                {selectedCategory && (
  <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#024a47] text-white text-sm rounded-full">
    {selectedCategory}
    <button onClick={() => {
      setSelectedCategory('');
      searchParams.delete('category');
      setSearchParams(searchParams);
    }} className="hover:text-gray-200">×</button>
  </span>
)}
{selectedPriceRange && (
  <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#024a47] text-white text-sm rounded-full">
    {selectedPriceRange.label}
    <button onClick={() => {
      setSelectedPriceRange(null);
      searchParams.delete('price');
      setSearchParams(searchParams);
    }} className="hover:text-gray-200">×</button>
  </span>
)}
             <button 
  onClick={() => {
    setSelectedCategory('');
    setSelectedPriceRange(null);
    searchParams.delete('category');
    searchParams.delete('price');
    setSearchParams(searchParams);
  }}
  className="text-sm text-red-600 hover:text-red-700 underline"
>
  Clear all
</button>
              </div>
            )}

        
            <div className="mb-4 text-sm text-gray-600">
              Showing {displayAppliances.length} {displayAppliances.length === 1 ? 'appliance' : 'appliances'}
            </div>

            
            {displayAppliances.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xl text-gray-600">No appliances found matching your filters</p>
                <button 
  onClick={() => {
    setSelectedCategory('');
    setSelectedPriceRange(null);
    searchParams.delete('category');
    searchParams.delete('price');
    setSearchParams(searchParams);
  }}
  className="mt-4 px-6 py-2 bg-[#024a47] text-white rounded-lg hover:bg-[#035d59]"
>
  Clear Filters
</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6 mb-8">
               
                {displayAppliances.map((appliance) => {
                 return <div 
                
                    key={appliance._id} 
                    className={`bg-white  rounded-xl border p-4 shadow-sm hover:shadow-md transition-all flex flex-col h-full relative ${
                      isBoostActive(appliance) 
                        ? 'border-2 border-yellow-400 ring-2 ring-yellow-200' 
                        : 'border-gray-200'
                    }`}
                  >
                  
                    {isBoostActive(appliance) && (
                      <div className="absolute -top-3 -right-3 z-10">
                        <div className={`${getBoostBadgeColor(appliance.visibility.boostAmount)} text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1`}>
                          <span>⚡</span>
                          <span>BOOSTED ${appliance.visibility.boostAmount}</span>
                        </div>
                      </div>
                    )}
                  
{getRejectionReasons(appliance._id).length > 0 && (
  <div className="absolute top-3 left-3 z-10">
    <div 
      className="relative"
      onMouseEnter={() => setHoveredListing(appliance._id)}
      onMouseLeave={() => setHoveredListing(null)}
    >
      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center cursor-help shadow-lg">
        <span className="text-white font-bold text-sm">i</span>
      </div>
      
     
{hoveredListing === appliance._id && (
  <div className="absolute left-10 top-0 w-64 bg-gray-900 text-white text-sm rounded-lg p-3 shadow-xl z-20">
    <div className="font-semibold mb-2">Previous Rejections ({getRejectionReasons(appliance._id).length}):</div>
    <ul className="space-y-2">
      {getRejectionReasons(appliance._id).map((item, index) => (
        <li key={index} className="border-b border-gray-700 pb-2 last:border-0">
          <div className="flex items-start">
            <span className="mr-2">•</span>
            <div>
              <div>{item.reason}</div>
              
            </div>
          </div>
        </li>
      ))}
    </ul>
   
    <div className="absolute right-full top-3 w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-r-4 border-r-gray-900"></div>
  </div>
)}
    </div>
  </div>
)}

                 
                    <div className="flex items-center mb-4">
                    
                      <div>
                       
                      </div>
                    </div>

            
                    <div className="relative mb-4 bg-gray-50 rounded-lg p-4" style={{minHeight: '200px'}}>
  <div className="flex justify-center items-center h-full">
    <img 
      className='w-full max-w-[200px] h-auto object-contain' 
      src={appliance?.images?.[currentImageIndex[appliance._id] || 0]?.url || getPrimaryImage(appliance?.images)} 
      alt={`${appliance.title} - Image ${(currentImageIndex[appliance._id] || 0) + 1}`} 
    />
  </div>
  
  {appliance?.images?.length > 1 && (
    <>
      {/* Previous Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setCurrentImageIndex(prev => ({
            ...prev,
            [appliance._id]: ((prev[appliance._id] || 0) - 1 + appliance.images.length) % appliance.images.length
          }));
        }}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-all"
      >
        <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      {/* Next Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setCurrentImageIndex(prev => ({
            ...prev,
            [appliance._id]: ((prev[appliance._id] || 0) + 1) % appliance.images.length
          }));
        }}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-all"
      >
        <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
      
      {/* Dots Indicator */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
        {appliance.images.map((_, index) => (
          <button
            key={index}
            onClick={(e) => {
              e.stopPropagation();
              setCurrentImageIndex(prev => ({
                ...prev,
                [appliance._id]: index
              }));
            }}
            className={`w-2 h-2 rounded-full transition-all ${
              (currentImageIndex[appliance._id] || 0) === index 
                ? 'bg-[#024a47] w-6' 
                : 'bg-gray-400'
            }`}
          />
        ))}
      </div>
    </>
  )}
</div>
                    {requests?.find(u=>u.listing==appliance._id && u?.status=="pending") && (
                      <div className="mb-4 py-2 px-4 rounded-lg border-2 border-amber-400 bg-amber-50 flex items-center justify-center gap-2"> 
                        <svg 
                          className="w-4 h-4 text-amber-600 animate-spin" 
                          xmlns="http://www.w3.org/2000/svg" 
                          fill="none" 
                          viewBox="0 0 24 24"
                        >
                          <circle 
                            className="opacity-25" 
                            cx="12" 
                            cy="12" 
                            r="10" 
                            stroke="currentColor" 
                            strokeWidth="4"
                          />
                          <path 
                            className="opacity-75" 
                            fill="currentColor" 
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        <p className="text-amber-700 font-semibold text-sm">
                          Awaiting Vendor Approval
                        </p>
                      </div>
                    )}

                    <div className="text-center mb-6 flex-grow">
                  
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {appliance.title}
                      </h3>
                      
                     
                      <p className="text-sm text-gray-600 mb-2">
                        {appliance.brand} • {appliance.condition}
                      </p>
                      
                
                      <p className="text-2xl font-bold text-gray-900 mb-3">
                        ${appliance.pricing.rentPrice}/mo
                      </p>

                      
                      <div className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full mb-3 capitalize">
                        {appliance.category}
                      </div>

                      {appliance.powerType === 'Warranty' && (
  <div className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full mb-3 ml-2">
    <span className="mr-1">✓</span>
    Warranty Included
  </div>
)}
                      
                      <div className="space-y-1 mb-4">
                        {getFeatures(appliance.specifications).length > 0 ? (
                          getFeatures(appliance.specifications).map((feature, index) => (
                            <div key={index} className="flex items-center justify-center text-gray-700">
                              <div className="w-2 h-2 bg-[#024a47] rounded-full mr-3"></div>
                              <span className="text-base sm:text-lg">{feature}</span>
                            </div>
                          ))
                        ) : appliance.description ? (
                          <div className="text-sm text-gray-600 line-clamp-2">
                            {appliance.description}
                          </div>
                        ) : (
                          <div className="flex items-center justify-center text-gray-500">
                            <span className="text-base sm:text-lg">No features listed</span>
                          </div>
                        )}
                      </div>

                      
                      {!appliance.availability?.isAvailable && (
                        <div className="flex items-center justify-center text-red-500 mb-4">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm">Currently unavailable</span>
                        </div>
                      )}
                    </div>

                   
                    <div className="mt-auto space-y-3">
                     
                    {requests?.find(u => u.listing == appliance._id && u.approvedByVendor==true && u?.status=="approved" && u?.approvedByUser==false)?(
                   <div className="space-y-3">
                 
                   <div className="flex items-center justify-center gap-2 bg-green-50 border-2 border-green-500 rounded-lg py-3 px-4">
                     <div className="relative">
                    
                       <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping"></span>
                      
                       <div className="relative inline-flex items-center justify-center w-8 h-8 bg-green-500 rounded-full">
                         <svg 
                           className="w-5 h-5 text-white" 
                           fill="none" 
                           stroke="currentColor" 
                           viewBox="0 0 24 24"
                         >
                           <path 
                             strokeLinecap="round" 
                             strokeLinejoin="round" 
                             strokeWidth={3} 
                             d="M5 13l4 4L19 7" 
                           />
                         </svg>
                       </div>
                     </div>
                     <div className="flex-1">
                       <p className="text-green-800 font-bold text-base">
                         ✓ Vendor Approved Your Request!
                       </p>
                       <p className="text-green-700 text-sm">
                         Review and accept to proceed with rental
                       </p>
                     </div>
                   </div>
               
                 
                   <div className="flex gap-4">
                   
                     <button
                      onClick={() => navigate(`/renterconfirmation?id=${requests?.find(u => u.listing == appliance._id && u?.status=="approved")?._id}`)}
                       disabled={!appliance.availability?.isAvailable}
                       className={`flex-1 py-3 px-6 rounded-lg font-semibold text-lg transition-colors ${
                         !appliance.availability?.isAvailable
                           ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                           : 'bg-[#024a47] hover:bg-[#035d59] text-white'
                       }`}
                     >
                       Accept Request
                     </button>
                   
                     <button
  onClick={(e) => {
    e.stopPropagation()
    handleReject(appliance, e);
  }}
  disabled={!appliance.availability?.isAvailable}
  className={`flex-1 py-3 px-6 rounded-lg font-semibold text-lg transition-colors ${
    !appliance.availability?.isAvailable
      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
      : 'bg-red-600 hover:bg-red-700 text-white'
  }`}
>
  Reject Offer
</button>
                   </div>
                 </div>
                    ):(
                      <>
                      {requests?.find(u=>u.listing==appliance._id && u?.status=="pending")?       <button
  onClick={(e) => {
    e.stopPropagation()
    handleReject(appliance, e);
  }}
  disabled={!appliance.availability?.isAvailable}
  className={`w-full flex-1 py-3 px-6 rounded-lg font-semibold text-lg transition-colors ${
    !appliance.availability?.isAvailable
      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
      : 'bg-red-600 hover:bg-red-700 text-white'
  }`}
  
>
  Reject Offer
</button>:<button
                        onClick={() => handleSelect(appliance)}
                        disabled={!appliance.availability?.isAvailable}
                        className={`w-full py-3 px-6 rounded-lg font-semibold text-lg transition-colors ${
                          !appliance.availability?.isAvailable
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-[#024a47] hover:bg-[#035d59] text-white'
                        }`}
                      >
                        {!appliance.availability?.isAvailable ? 'Unavailable' : 'Select'}
                      </button>}
                      
                    </>
                    )}
                    
                    <button
                      onClick={() => {
                        navigate(`/userchat?vendor=${appliance?.vendor?._id}`)
                      }}
                      className="w-full py-3 px-6 rounded-lg font-semibold text-lg bg-[#024a47] hover:bg-[#035d59] text-white transition-colors"
                    >
                      Contact vendor
                    </button>
                    </div>
                    </div>
                    })}
                    </div>
                    )}
                    </div>
                    </div>
                    )}
                    </>
  );
}