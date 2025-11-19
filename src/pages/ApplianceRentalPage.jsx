import { useEffect, useRef, useState } from 'react';
import React from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import { BASE_URL } from '../baseUrl';
import { useNavigate } from 'react-router-dom';
import ComboPopup from '../components/combopopup';
import {User} from 'lucide-react'


export default function ApplianceRentalPage() {
  const [appliances, setAppliances] = useState([]);
  const [filteredAppliances, setFilteredAppliances] = useState([]);
  const [viewedListings, setViewedListings] = useState(new Set());
  const [hoveredListing, setHoveredListing] = useState(null);
  const [open,setOpen]=useState(false)
  const [showComboPopup, setShowComboPopup] = useState(false);
  const [selectedComboAppliance, setSelectedComboAppliance] = useState(null);
  const [selectedPlugType, setSelectedPlugType] = useState('');
  const [requests, setRequests] = useState([]);
  const [showPlugpopup, setshowPlugpopup] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPriceRange, setSelectedPriceRange] = useState(null);
  const [showPriceDropdown, setShowPriceDropdown] = useState(false);
  const navigate = useNavigate();
  const [user,setUser]=useState({})
  const menuRef=useRef();

  const priceRanges = [
    { label: '$20-$60', min: 20, max: 60 },
    { label: '$60-$100', min: 60, max: 100 },
    { label: '$100-$140', min: 100, max: 140 },
    { label: '$140-$180', min: 140, max: 180 },
    { label: '$180-$220', min: 180, max: 220 },
    { label: '$220-$250', min: 220, max: 250 }
  ];

  useEffect(() => {
    getProducts();
    getUserRequests();
  }, []);

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
      setSelectedCategory(''); // Deselect if clicking the same category
    } else {
      setSelectedCategory(category);
    }
  };

  const handlePriceFilter = (range) => {
    if (selectedPriceRange?.label === range.label) {
      setSelectedPriceRange(null); // Deselect if clicking the same range
    } else {
      setSelectedPriceRange(range);
    }
    setShowPriceDropdown(false);
  };

  const handleSelect = (appliance) => {
    try {
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
      toast.error('Error selecting appliance');
    }
  };

  const handlePlugTypeSelect = (plugType) => {
    try {
      setSelectedPlugType(plugType);
      setShowComboPopup(false);
      setSelectedComboAppliance(null);
      setSelectedPlugType('');
      toast.success('Selection confirmed');
    } catch (e) {
      console.error('Error with selection:', e);
      toast.error('Error with selection');
    }
  };

  const handleCloseComboPopup = () => {
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

  const handleReject = async(appliance) => {
    try {
      let response = await axios.patch(`${BASE_URL}/rejectOffer/${appliance._id}`)

      setRequests(prev =>
        prev.map(req =>
          req.listing === appliance._id
            ? { ...req, status: 'rejected' }
            : req
        )
      );

      alert("Offer rejected sucessfully")
    } catch(e) {
      if(e?.response?.data?.error) {
        alert(e?.response?.data?.error)
      } else {
        alert("Error occured while trying to reject offer")
      }
    }
  }


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
      
      {showComboPopup ? (
        <ComboPopup
          selectedPlugType={selectedPlugType}
          setSelectedPlugType={setSelectedPlugType}
          showComboPopup={showComboPopup}
          setShowComboPopup={setShowComboPopup}
          selectedComboAppliance={selectedComboAppliance}
          handlePlugTypeSelect={handlePlugTypeSelect}
        />
      ) : (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
          <div className="max-w-4xl mx-auto">
            {/* Greeting Header */}
            <div className="mb-6 flex justify-between items-center">
  <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
    Hi, {user?.name?user?.name:"Renter"} 👋
  </h1>

  {/* Icon + Dropdown Wrapper */}
  <div className="relative" ref={menuRef}>
    
    {/* Profile Icon */}
    <div 
      className="cursor-pointer"
      onClick={() => setOpen(!open)}
    >
      <User className="w-8 h-8 text-gray-700" />
    </div>

    {/* Dropdown Menu */}
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
          className="px-3 py-2 hover:bg-gray-100 rounded cursor-pointer"
        >
          Chat
        </div>
      </div>
    )}

  </div>
</div>


            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-3 mb-6">
              {/* Price Filter with Dropdown */}
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

              {/* Category Filters */}
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

            {/* Active Filters Display */}
            {(selectedCategory || selectedPriceRange) && (
              <div className="mb-4 flex items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-600">Active filters:</span>
                {selectedCategory && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#024a47] text-white text-sm rounded-full">
                    {selectedCategory}
                    <button onClick={() => setSelectedCategory('')} className="hover:text-gray-200">×</button>
                  </span>
                )}
                {selectedPriceRange && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#024a47] text-white text-sm rounded-full">
                    {selectedPriceRange.label}
                    <button onClick={() => setSelectedPriceRange(null)} className="hover:text-gray-200">×</button>
                  </span>
                )}
                <button 
                  onClick={() => {
                    setSelectedCategory('');
                    setSelectedPriceRange(null);
                  }}
                  className="text-sm text-red-600 hover:text-red-700 underline"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Results Count */}
            <div className="mb-4 text-sm text-gray-600">
              Showing {displayAppliances.length} {displayAppliances.length === 1 ? 'appliance' : 'appliances'}
            </div>

            {/* Appliances Grid */}
            {displayAppliances.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xl text-gray-600">No appliances found matching your filters</p>
                <button 
                  onClick={() => {
                    setSelectedCategory('');
                    setSelectedPriceRange(null);
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
                 onClick={() => handleSelect(appliance)}
                    key={appliance._id} 
                    className={`bg-white cursor-pointer rounded-xl border p-4 shadow-sm hover:shadow-md transition-all flex flex-col h-full relative ${
                      isBoostActive(appliance) 
                        ? 'border-2 border-yellow-400 ring-2 ring-yellow-200' 
                        : 'border-gray-200'
                    }`}
                  >
                    {/* 🚀 BOOSTED BADGE */}
                    {isBoostActive(appliance) && (
                      <div className="absolute -top-3 -right-3 z-10">
                        <div className={`${getBoostBadgeColor(appliance.visibility.boostAmount)} text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1`}>
                          <span>⚡</span>
                          <span>BOOSTED ${appliance.visibility.boostAmount}</span>
                        </div>
                      </div>
                    )}
                    {/* Rejection Info Icon */}
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
      
      {/* Tooltip */}
   {/* Tooltip */}
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
    {/* Arrow pointing left */}
    <div className="absolute right-full top-3 w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-r-4 border-r-gray-900"></div>
  </div>
)}
    </div>
  </div>
)}

                    {/* Vendor Header */}
                    <div className="flex items-center mb-4">
                    
                      <div>
                       
                      </div>
                    </div>

                    {/* Product Image */}
                    <div className="flex justify-center items-center mb-4 bg-gray-50 rounded-lg p-4" style={{minHeight: '200px'}}>
                      <img 
                        className='w-full max-w-[200px] h-auto object-contain' 
                        src={getPrimaryImage(appliance?.images)} 
                        alt={appliance.title} 
                      />
                    </div>

                    <div className="text-center mb-6 flex-grow">
                      {/* Product Title */}
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {appliance.title}
                      </h3>
                      
                      {/* Brand & Condition */}
                      <p className="text-sm text-gray-600 mb-2">
                        {appliance.brand} • {appliance.condition}
                      </p>
                      
                      {/* Price */}
                      <p className="text-2xl font-bold text-gray-900 mb-3">
                        ${appliance.pricing.rentPrice}/mo
                      </p>

                      {/* Category Badge */}
                      <div className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full mb-3 capitalize">
                        {appliance.category}
                      </div>

                      {/* Specifications */}
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

                      {/* Availability Status */}
                      {!appliance.availability?.isAvailable && (
                        <div className="flex items-center justify-center text-red-500 mb-4">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm">Currently unavailable</span>
                        </div>
                      )}
                    </div>

                    {/* Buttons at bottom */}
                    <div className="mt-auto space-y-3">
                      {/* Select Button */}
                    {requests?.find(u => u.vendor == appliance.vendor._id && u.approvedByVendor==true && u.status!="rejected")?(
                   <div className="space-y-3">
                   {/* Approval Badge */}
                   <div className="flex items-center justify-center gap-2 bg-green-50 border-2 border-green-500 rounded-lg py-3 px-4">
                     <div className="relative">
                       {/* Animated ping effect */}
                       <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping"></span>
                       {/* Checkmark icon */}
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
               
                   {/* Action Buttons */}
                   <div className="flex gap-4">
                     {/* Accept Button */}
                     <button
                       onClick={() => navigate(`/renterconfirmation?id=${requests?.find(u => u.vendor == appliance.vendor._id)?._id}`)}
                       disabled={!appliance.availability?.isAvailable}
                       className={`flex-1 py-3 px-6 rounded-lg font-semibold text-lg transition-colors ${
                         !appliance.availability?.isAvailable
                           ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                           : 'bg-[#024a47] hover:bg-[#035d59] text-white'
                       }`}
                     >
                       Accept Request
                     </button>
                   
                     {/* Reject Button */}
                     <button
                       onClick={() => handleReject(appliance)}
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
                   {requests?.find(u=>u.vendor==appliance.vendor._id && u?.status=="pending")?<div className="w-full py-3 px-6 rounded-lg border-2 border-amber-400 bg-amber-50 flex items-center justify-center gap-3"> 

                    <svg 
      className="w-5 h-5 text-amber-600 animate-spin" 
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
                    <p className="text-amber-700 font-semibold text-base">
      Awaiting Vendor Approval
    </p>

                   </div>:<button
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