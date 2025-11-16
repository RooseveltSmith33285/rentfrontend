import React, { useState, useEffect } from "react";
import { Package, Eye, MessageSquare, DollarSign, Home, LogOut, Plus, TrendingUp, Users, BarChart3, CreditCard, MessageCircle, Share, House } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { BASE_URL } from "../baseUrl";

function VendorDashboard() {
  const navigate = useNavigate();
  
  // State management
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch dashboard data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${BASE_URL}/getVendorDashboardData`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setDashboardData(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data');
      
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/vendorlogin');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href='/'
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
        {dashboardData?.subscriptionStatus && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">
                    {dashboardData.subscriptionStatus.plan.charAt(0).toUpperCase() + 
                     dashboardData.subscriptionStatus.plan.slice(1)} Plan
                  </span>
                  {' - '}
                  <span className="capitalize">{dashboardData.subscriptionStatus.status}</span>
                </p>
                {dashboardData.subscriptionStatus.daysRemaining !== null && (
                  <p className="text-xs text-blue-600 mt-1">
                    {dashboardData.subscriptionStatus.daysRemaining} days remaining
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-blue-800">
                  Boost Credits: {dashboardData.vendor?.boostCredits || 0}
                </p>
              </div>
            </div>
          </div>
        )}

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
            onClick={() => navigate('/listening')}
            className="bg-[#024a47] hover:bg-[#035d59] text-white rounded-lg p-6 flex items-center space-x-4 transition-all shadow-md"
          >
            <Plus className="w-8 h-8" />
            <div className="text-left">
              <h3 className="font-semibold text-lg">Create Listing</h3>
              <p className="text-sm opacity-90">Add new appliance</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/boost')}
            className="bg-white hover:bg-gray-50 text-[#024a47] border-2 border-[#024a47] rounded-lg p-6 flex items-center space-x-4 transition-all shadow-md"
          >
            <TrendingUp className="w-8 h-8" />
            <div className="text-left">
              <h3 className="font-semibold text-lg">Boost Listings</h3>
              <p className="text-sm opacity-75">Increase visibility</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/requestlist')}
            className="bg-[#024a47] hover:bg-[#035d59] text-white rounded-lg p-6 flex items-center space-x-4 transition-all shadow-md"
          >
            <House className="w-8 h-8" />
            <div className="text-left">
              <h3 className="font-semibold text-lg">View renter requests</h3>
            </div>
          </button>

          <button
            onClick={() => navigate('/feed')}
            className="bg-white hover:bg-gray-50 text-[#024a47] border-2 border-[#024a47] rounded-lg p-6 flex items-center space-x-4 transition-all shadow-md"
          >
            <Share className="w-8 h-8" />
            <div className="text-left">
              <h3 className="font-semibold text-lg">Community Posts</h3>
              <p className="text-sm opacity-75">Share posts</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/chat')}
            className="bg-white hover:bg-gray-50 text-[#024a47] border-2 border-[#024a47] rounded-lg p-6 flex items-center space-x-4 transition-all shadow-md relative"
          >
            <MessageCircle className="w-8 h-8" />
            <div className="text-left">
              <h3 className="font-semibold text-lg">Chat with Buyers</h3>
              <p className="text-sm opacity-75">Respond to inquiries</p>
            </div>
            {dashboardData?.stats?.engagement?.inquiries > 0 && (
              <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                {dashboardData.stats.engagement.inquiries}
              </span>
            )}
          </button>

          <button
            onClick={() => navigate('/community')}
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
              onClick={() => navigate('/mylistenings')}
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
                  <div className="flex items-center space-x-4">
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
                  </div>
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
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 lg:hidden">
          <div className="flex justify-around py-3">
            <button 
              onClick={() => navigate('/dashboard')} 
              className="flex flex-col items-center text-[#024a47]"
            >
              <Home className="w-6 h-6" />
              <span className="text-xs mt-1">Dashboard</span>
            </button>
            <button 
              onClick={() => navigate('/feed')} 
              className="flex flex-col items-center text-gray-600"
            >
              <BarChart3 className="w-6 h-6" />
              <span className="text-xs mt-1">Feed</span>
            </button>
            <button 
              onClick={() => navigate('/chat')} 
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
              onClick={() => navigate('/subscription')} 
              className="flex flex-col items-center text-gray-600"
            >
              <CreditCard className="w-6 h-6" />
              <span className="text-xs mt-1">Subscribe</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VendorDashboard;