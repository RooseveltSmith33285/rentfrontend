import React, { useState, useEffect } from "react";
import { Package, Eye, MessageSquare, DollarSign, Home, LogOut, Plus, TrendingUp, Users, BarChart3, CreditCard, MessageCircle, Share, House } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import { BASE_URL } from "../baseUrl";

function VendorDashboard() {
  const navigate = useNavigate();
  
  // State management
  const [showStripePopup, setShowStripePopup] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stripeOnboardingData,setStripeOnboardingData]=useState()
  const [stripeLoading, setStripeLoading] = useState(false);
  // Fetch dashboard data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (dashboardData?.vendor?.stripe_connect_status === false) {
      setShowStripePopup(true);
    }
  }, [dashboardData]);


  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('vendorToken');
      
      const response = await axios.get(`${BASE_URL}/getVendorDashboardData`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log(response.data)
      if (response.data.success) {
        setDashboardData(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data');
      
      if (err.response?.status === 401) {
        localStorage.removeItem('vendorToken');
        navigate('/vendorlogin');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('vendorToken');
    window.location.href='/'
  };



  const handleStripeOnboarding = async () => {
    try {
      setStripeLoading(true);
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

      // If already connected, close popup and refresh dashboard
      if (data.alreadyConnected) {
        setStripeLoading(false);
        setShowStripePopup(false);
        alert('✅ Your Stripe account is already connected!');
        fetchDashboardData(); // Refresh to update status
        return;
      }

      // If onboarding URL exists, redirect IMMEDIATELY
      if (data.onboardingUrl) {
        // Redirect without waiting for state updates
        window.location.href = data.onboardingUrl;
        // Note: Code below won't execute due to redirect, but kept for safety
        return;
      }

      setStripeLoading(false);
      alert('Unable to generate Stripe onboarding link. Please try again.');
      
    } catch (error) {
      console.error('Error generating Stripe link:', error);
      setStripeLoading(false);
      
      if (error?.response?.status === 404) {
        alert('❌ Vendor not found. Please contact support.');
      } else if (error?.response?.status === 401) {
        alert('❌ Session expired. Please log in again.');
        localStorage.removeItem('vendorToken');
        navigate('/vendorlogin');
      } else {
        alert('❌ ' + (error?.response?.data?.error || 'Failed to connect to Stripe. Please try again.'));
      }
    }
  };



  const handleNavigation = (path) => {
    if (dashboardData?.vendor?.stripe_connect_status === false) {
      setShowStripePopup(true);
      return;
    }
    navigate(path);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#024a47] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
          <button 
            onClick={fetchDashboardData}
            className="mt-4 bg-[#024a47] text-white px-4 py-2 rounded hover:bg-[#035d59]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const stats = [
    { 
      label: 'Active Listings', 
      value: dashboardData?.stats?.listings?.active || 0, 
      icon: Package, 
      color: 'bg-blue-500' 
    },
    { 
      label: 'Total Views', 
      value: dashboardData?.stats?.engagement?.views?.toLocaleString() || '0', 
      icon: Eye, 
      color: 'bg-green-500' 
    },
    { 
      label: 'Engagements', 
      value: (
        (dashboardData?.stats?.engagement?.likes || 0) + 
        (dashboardData?.stats?.engagement?.inquiries || 0) + 
        (dashboardData?.stats?.engagement?.shares || 0)
      ).toLocaleString(), 
      icon: MessageSquare, 
      color: 'bg-purple-500' 
    },
    { 
      label: 'Revenue', 
      value: `$${dashboardData?.stats?.vendorStats?.totalRevenue?.toLocaleString() || '0'}`, 
      icon: DollarSign, 
      color: 'bg-yellow-500' 
    }
  ];

  const recentListings = dashboardData?.recentListings?.map(listing => ({
    id: listing._id,
    name: listing.title,
    views: listing.engagement?.views || 0,
    status: listing.status.charAt(0).toUpperCase() + listing.status.slice(1),
    boosted: listing.visibility?.isBoosted || false,
    image: listing.images?.[0]?.url
  })) || [];

  const handleRenewListing = async (listingId) => {
    try {
      const token = localStorage.getItem('vendorToken'); // Changed from 'token' to 'vendorToken'
      
      const response = await axios.post(
        `${BASE_URL}/renewListing`,
        { listingId },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
  
      if (response.data.success) {
        const updatedListing = response.data.listing;
        
        // Update dashboardData instead of recentListings
        setDashboardData(prevData => ({
          ...prevData,
          recentListings: prevData.recentListings.map(listing => {
            if (listing._id === listingId) {
              return {
                ...listing,
                status: updatedListing.status,
                engagement: {
                  ...listing.engagement,
                  views: updatedListing.engagement?.views || 0
                },
                visibility: {
                  ...listing.visibility,
                  isBoosted: updatedListing.visibility?.isBoosted || false
                }
              };
            }
            return listing;
          })
        }));
        
        alert('Listing renewed successfully! It is now active and available for rent.');
      }
    } catch (err) {
      console.error('Error renewing listing:', err);
      alert(err.response?.data?.error || 'Failed to renew listing');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#024a47] rounded-lg flex items-center justify-center">
                <Home className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#024a47]">RentSimple</h1>
                <p className="text-sm text-gray-600">
                  {dashboardData?.vendor?.businessName || 'Vendor Dashboard'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {dashboardData?.vendor?.isVerified && (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                  Verified
                </span>
              )}
              <button 
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-[#024a47]"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
     

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-[#024a47]">{stat.value}</p>
                </div>
                <div className={`${stat.color} rounded-lg p-3`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <button
            onClick={() => handleNavigation('/listening')}
            className="bg-[#024a47] hover:bg-[#035d59] text-white rounded-lg p-6 flex items-center space-x-4 transition-all shadow-md"
          >
            <Plus className="w-8 h-8" />
            <div className="text-left">
              <h3 className="font-semibold text-lg">Create Listing</h3>
              <p className="text-sm opacity-90">Add new appliance</p>
            </div>
          </button>

          <button
            onClick={() => handleNavigation('/boost')}
            className="bg-white hover:bg-gray-50 text-[#024a47] border-2 border-[#024a47] rounded-lg p-6 flex items-center space-x-4 transition-all shadow-md"
          >
            <TrendingUp className="w-8 h-8" />
            <div className="text-left">
              <h3 className="font-semibold text-lg">Boost Listings</h3>
              <p className="text-sm opacity-75">Increase visibility</p>
            </div>
          </button>

          <button
  onClick={() => handleNavigation('/requestlist')}
  className="relative bg-[#024a47] hover:bg-[#035d59] text-white rounded-lg p-6 flex items-center space-x-4 transition-all shadow-md"
>
  <House className="w-8 h-8" />
  <div className="text-left">
    <h3 className="font-semibold text-lg">View renter requests</h3>
  </div>

  {dashboardData?.requests?.length > 0 && (
    <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
      {dashboardData?.requests?.length}
    </span>
  )}
</button>


          <button
            onClick={() => handleNavigation('/feed')}
            className="bg-white hover:bg-gray-50 text-[#024a47] border-2 border-[#024a47] rounded-lg p-6 flex items-center space-x-4 transition-all shadow-md"
          >
            <Share className="w-8 h-8" />
            <div className="text-left">
              <h3 className="font-semibold text-lg">Community Posts</h3>
              <p className="text-sm opacity-75">Share posts</p>
            </div>
          </button>

          <button
            onClick={() => handleNavigation('/chat')}
            className="bg-white hover:bg-gray-50 text-[#024a47] border-2 border-[#024a47] rounded-lg p-6 flex items-center space-x-4 transition-all shadow-md relative"
          >
            <MessageCircle className="w-8 h-8" />
            <div className="text-left">
              <h3 className="font-semibold text-lg">Chat with Buyers</h3>
             
            </div>
            {dashboardData?.messages?.length>0?<span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
            {dashboardData?.messages?.length}
</span>:''}
          </button>

          <button
            onClick={() => handleNavigation('/community')}
            className="bg-white hover:bg-gray-50 text-[#024a47] border-2 border-[#024a47] rounded-lg p-6 flex items-center space-x-4 transition-all shadow-md"
          >
            <Users className="w-8 h-8" />
            <div className="text-left">
              <h3 className="font-semibold text-lg">Post to Community</h3>
              <p className="text-sm opacity-75">Engage with users</p>
            </div>
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-20 lg:mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-[#024a47]">Recent Listings</h2>
            <button
              onClick={() => handleNavigation('/mylistenings')}
              className="text-[#024a47] hover:underline font-semibold"
            >
              View All
            </button>
          </div>
          
          {recentListings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No listings yet. Create your first listing!</p>
            </div>
          ) : (
            <div className="space-y-4">
  {recentListings.map((listing) => (
    <div key={listing.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <Link to={`/listings/edit/${listing.id}`} className="flex items-center space-x-4 flex-1">
        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
          {listing.image ? (
            <img src={listing.image} alt={listing.name} className="w-full h-full object-cover" />
          ) : (
            <Package className="w-6 h-6 text-gray-600" />
          )}
        </div>
        <div>
          <h3 className="font-semibold text-[#024a47]">{listing.name}</h3>
          <p className="text-sm text-gray-600">{listing.views} views</p>
        </div>
      </Link>
      
      <div className="flex items-center space-x-3">
        {listing.boosted && (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
            Boosted
          </span>
        )}
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
          listing.status === 'Active' ? 'bg-green-100 text-green-800' : 
          listing.status === 'Draft' ? 'bg-gray-100 text-gray-800' :
          listing.status === 'Rented' ? 'bg-blue-100 text-blue-800' :
          'bg-purple-100 text-purple-800'
        }`}>
          {listing.status}
        </span>
        
        {/* Renew Listing Button - shown only for Rented/Unavailable listings */}
        {(listing.status.toLowerCase() === 'sold') && (
          <button
            onClick={(e) => {
              e.preventDefault();
              handleRenewListing(listing.id);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-[#024a47] hover:bg-[#035d59] text-white rounded-lg transition-colors font-semibold text-sm whitespace-nowrap"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Renew Listing</span>
          </button>
        )}
      </div>
    </div>
  ))}
</div>
          )}
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 lg:hidden">
          <div className="flex justify-around py-3">
            <button 
              onClick={() => handleNavigation('/dashboard')} 
              className="flex flex-col items-center text-[#024a47]"
            >
              <Home className="w-6 h-6" />
              <span className="text-xs mt-1">Dashboard</span>
            </button>
            <button 
              onClick={() => handleNavigation('/feed')} 
              className="flex flex-col items-center text-gray-600"
            >
              <BarChart3 className="w-6 h-6" />
              <span className="text-xs mt-1">Feed</span>
            </button>
            <button 
              onClick={() => handleNavigation('/chat')} 
              className="flex flex-col items-center text-gray-600 relative"
            >
              <MessageCircle className="w-6 h-6" />
              <span className="text-xs mt-1">Chat</span>
              {dashboardData?.stats?.engagement?.inquiries > 0 && (
                <span className="absolute -top-1 right-2 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {dashboardData.stats.engagement.inquiries}
                </span>
              )}
            </button>
            <button 
              onClick={() => handleNavigation('/subscription')} 
              className="flex flex-col items-center text-gray-600"
            >
              <CreditCard className="w-6 h-6" />
              <span className="text-xs mt-1">Subscribe</span>
            </button>
          </div>
        </div>
      </div>

      {showStripePopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
            {/* Loading Overlay */}
            {stripeLoading && (
              <div className="absolute inset-0 bg-white bg-opacity-95 rounded-lg flex items-center justify-center z-10">
                <div className="text-center">
                  <div className="relative inline-flex items-center justify-center mb-4">
                    {/* Outer rotating circle */}
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
                    {/* Inner rotating circle */}
                    <div className="absolute animate-spin rounded-full h-16 w-16 border-4 border-[#024a47] border-t-transparent"></div>
                    {/* Center icon */}
                    <div className="absolute">
                      <CreditCard className="w-6 h-6 text-[#024a47]" />
                    </div>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">Generating Secure Link...</p>
                  <p className="text-sm text-gray-600 mt-2">Please wait</p>
                </div>
              </div>
            )}

            <h2 className="text-2xl font-bold text-[#024a47] mb-4">
              Action Required: Add Your Payout Details
            </h2>
            <p className="text-gray-700 mb-6">
              Before you can list your first item, please connect your bank account through our secure Stripe system. This ensures you get paid on time for every rental.
            </p>
            <p className="text-gray-700 mb-6">
              Once your banking info is added, you'll unlock the ability to post listings.
            </p>
            <div className="flex space-x-3">
            <button
                onClick={handleStripeOnboarding}
                disabled={stripeLoading}
                className="flex-1 bg-[#024a47] hover:bg-[#035d59] text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {stripeLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Loading...
                  </>
                ) : (
                  'Add Banking Details'
                )}
              </button>
              <button
                onClick={() => setShowStripePopup(false)}
                disabled={stripeLoading}
                className="px-4 py-3 text-gray-600 hover:text-gray-800 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VendorDashboard;