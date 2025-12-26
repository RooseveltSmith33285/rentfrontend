import { useState, useEffect } from 'react';
import React from 'react'
import { BASE_URL } from '../baseUrl';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { useContext } from 'react';
import { SocketContext } from '../context/socketContext';
import VendorSupportChatWidget from './vendoradminchat';
import { toast, ToastContainer } from 'react-toastify';

export default function BoostListingPage() {
  const stripe = useStripe();
  const elements = useElements();
  const [activeRenters, setActiveRenters] = useState(0);
  const [listings, setListings] = useState([]);
  const [selectedListing, setSelectedListing] = useState(null);
  const [boostAmount, setBoostAmount] = useState(5);
  const [boostDuration, setBoostDuration] = useState(7);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('boost');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [realTimeStats, setRealTimeStats] = useState({
    views: 0,
    likes: 0,
    inquiries: 0,
  });

  const socketRef = useContext(SocketContext);


  // Mock data - replace with API call
  function getActiveRentersCount() {
    let count = 0;
    for (let [userId, userData] of onlineUsers.entries()) {
      if (userData.userType === 'user') {
        count++;
      }
    }
    return count;
  }

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('vendorToken');
        const response = await fetch(`${BASE_URL}/listings?status=active`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch listings');
        
        const data = await response.json();
        
        if (data.success) {
          // Map API data to component format, providing defaults for missing fields
          const mappedListings = data.listings.map(listing => ({
            ...listing,
            engagement: listing.engagement || { views: 0, likes: 0, inquiries: 0},
            visibility: listing.visibility || { isBoosted: false, visibilityScore: 50 }
          }));
          setListings(mappedListings);
        }
      } catch (error) {
        console.error('Error fetching listings:', error);
        setError('Failed to load listings. Please try again.');
      } finally {
        setLoading(false);
      }
    };
  
    fetchListings();
  }, []);
 

  useEffect(() => {
    if (!socketRef?.socket) return;
  
    const socket = socketRef.socket;
  
    // Join as vendor to receive user online/offline events
    const vendorId = localStorage.getItem('vendorId');
    if (vendorId) {
      console.log('Joining as vendor:', vendorId);
      socket.emit('join', {
        userId: vendorId,
        userType: 'vendor'
      });
    }
  
    // Listen for initial active renters count (you'll need to add this event in backend)
    socket.on('activeRentersCount', (count) => {
      setActiveRenters(count);
      console.log('Active renters:', count);
    });
  
    // Listen for user coming online
    socket.on('userOnline', (data) => {
      if (data.userType === 'user') {
        setActiveRenters(prev => prev + 1);
        console.log('Renter came online:', data.userId);
      }
    });
  
    // Listen for user going offline
    socket.on('userOffline', (data) => {
      if (data.userType === 'user') {
        setActiveRenters(prev => Math.max(0, prev - 1));
        console.log('Renter went offline:', data.userId);
      }
    });
  
    // Request initial count when component mounts
    socket.emit('getActiveRenters');
  
    // Cleanup listeners on unmount
    return () => {
      socket.off('activeRentersCount');
      socket.off('userOnline');
      socket.off('userOffline');
    };
  }, [socketRef?.socket]);

  // Simulate real-time stats updates
  useEffect(() => {
    if (selectedListing) {
      const interval = setInterval(() => {
        setRealTimeStats(prev => ({
          views: prev.views + Math.floor(Math.random() * 3),
          likes: prev.likes + (Math.random() > 0.7 ? 1 : 0),
          inquiries: prev.inquiries + (Math.random() > 0.9 ? 1 : 0)
        }));
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedListing]);

  const handleBoostClick = (listing) => {
    setSelectedListing(listing);
    setRealTimeStats(listing.engagement);
    setShowModal(true);
  };

  const handleBoostSubmit = async () => {
    if (!stripe || !elements) {
      toast.info('Stripe is not loaded yet. Please try again.',{containerId:"vendorBoost"});
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('vendorToken');
      
      // Get card element
      const cardElement = elements.getElement(CardElement);
      
      // Create payment method
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      const response = await fetch(`${BASE_URL}/boost`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          listingId: selectedListing._id,
          amount: boostAmount,
          duration: boostDuration,
          paymentMethodId: paymentMethod.id,
          estimatedReach: boostAmount * 70
        })
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to boost listing');
      }
      
      if (data.success) {
        // Update local state with the boosted listing
        setListings(listings.map(l => 
          l._id === selectedListing._id 
            ? { 
                ...l, 
                visibility: { 
                  ...l.visibility, 
                  isBoosted: true, 
                  boostAmount,
                  boostEndDate: new Date(Date.now() + boostDuration * 24 * 60 * 60 * 1000),
                  visibilityScore: Math.min(100, l.visibility.visibilityScore + 30)
                } 
              }
            : l
        ));
        
        setShowModal(false);
        setBoostAmount(5);
        setBoostDuration(7);
        toast.success('Listing boosted successfully!',{containerId:"vendorBoost"});
      }
    } catch (error) {
      console.error('Boost error:', error);
      toast.error(error.message || 'Failed to boost listing. Please try again.',{containerId:"vendorBoost"});
    } finally {
      setLoading(false);
    }
  };

  const calculateEstimatedReach = () => {
    return Math.floor((boostAmount * 100) + (boostDuration * 50));
  };

  const getDaysRemaining = (endDate) => {
    if (!endDate) return 0;
    const days = Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24));
    return Math.max(0, days);
  };

  return (
   <>
   <ToastContainer containerId={"vendorBoost"}/>
   

   <div className="min-h-screen bg-[#f3f4e6] p-4 md:p-8">
          <VendorSupportChatWidget/>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <Link to='/vendordashboard'>
          <button className="hidden lg:flex items-center space-x-2 hover:opacity-80">
                <Home className="w-5 h-5" />
                <span>Dashboard</span>
              </button>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-[#024a47] mb-2">
            Boost Your Listings
          </h1>
          <p className="text-gray-600">
            Increase visibility and reach more customers with boosts
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Views</p>
                <p className="text-2xl font-bold text-[#024a47]">
                  {listings.reduce((sum, l) => sum + l.engagement.views, 0)}
                </p>
              </div>
              <div className="bg-[#024a47] bg-opacity-10 rounded-full p-3">
                <svg className="w-6 h-6 text-[#024a47]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Inquiries</p>
                <p className="text-2xl font-bold text-[#024a47]">
                  {listings.reduce((sum, l) => sum + l.engagement.inquiries, 0)}
                </p>
              </div>
              <div className="bg-[#024a47] bg-opacity-10 rounded-full p-3">
                <svg className="w-6 h-6 text-[#024a47]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Active Boosts</p>
                <p className="text-2xl font-bold text-[#024a47]">
                  {listings.filter(l => l.visibility.isBoosted).length}
                </p>
              </div>
              <div className="bg-[#024a47] bg-opacity-10 rounded-full p-3">
                <svg className="w-6 h-6 text-[#024a47]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-5">
  <div className="flex items-center justify-between">
    <div>
      <div className="flex items-center gap-2 mb-1">
        <p className="text-gray-500 text-sm">Active Renters Online</p>
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
        </span>
      </div>
      <p className="text-2xl font-bold text-[#024a47]">
        {activeRenters}
      </p>
      <p className="text-xs text-gray-500 mt-1">Real-time count</p>
    </div>
    <div className="bg-[#024a47] bg-opacity-10 rounded-full p-3">
      <svg className="w-6 h-6 text-[#024a47]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    </div>
  </div>
</div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-lg mb-6">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('boost')}
                className={`flex-1 py-4 px-6 text-center font-semibold transition-colors ${
                  activeTab === 'boost'
                    ? 'text-[#024a47] border-b-2 border-[#024a47]'
                    : 'text-gray-500 hover:text-[#024a47]'
                }`}
              >
                Boost Listings
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex-1 py-4 px-6 text-center font-semibold transition-colors ${
                  activeTab === 'analytics'
                    ? 'text-[#024a47] border-b-2 border-[#024a47]'
                    : 'text-gray-500 hover:text-[#024a47]'
                }`}
              >
                Real-Time Analytics
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'boost' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map(listing => (
                  <div key={listing._id} className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <img
                        src={listing.images[0]?.url}
                        alt={listing.title}
                        className="w-full h-48 object-cover"
                      />
                      {listing.visibility.isBoosted && (
                        <div className="absolute top-2 right-2 bg-[#024a47] text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                          </svg>
                          BOOSTED
                        </div>
                      )}
                      
                    </div>

                    <div className="p-4">
                      <h3 className="font-bold text-lg text-[#024a47] mb-2 truncate">
                        {listing.title}
                      </h3>
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                        <span>{listing.brand}</span>
                        <span className="font-semibold">${listing.pricing.rentPrice}/mo</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                        <div className="flex items-center gap-1 text-gray-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          {listing.engagement.views} views
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                          </svg>
                          {listing.engagement.inquiries} inquiries
                        </div>
                      </div>

                      {listing.visibility.isBoosted ? (
                        <div className="text-sm text-gray-600 mb-3">
                          <p className="font-semibold">Boost expires in:</p>
                          <p className="text-[#024a47]">{getDaysRemaining(listing.visibility.boostEndDate)} days</p>
                        </div>
                      ) : null}

                      <button
                        onClick={() => handleBoostClick(listing)}
                        className="w-full bg-[#024a47] hover:bg-[#035d59] text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                      >
                        {listing.visibility.isBoosted ? 'Extend Boost' : 'Boost Listing'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-[#024a47] to-[#035d59] text-white rounded-lg p-6">
                  <h3 className="text-xl font-bold mb-2">Real-Time Performance</h3>
                  <p className="text-sm opacity-90">Live updates every 3 seconds</p>
                </div>

                {listings.filter(l => l.visibility.isBoosted).map(listing => (
                  <div key={listing._id} className="bg-white border-2 border-[#024a47] rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-[#024a47]">{listing.title}</h3>
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        LIVE
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-500 text-sm mb-1">Views</p>
                        <p className="text-2xl font-bold text-[#024a47]">
                          {listing.engagement.views}
                        </p>
                        <p className="text-green-600 text-xs mt-1">↑ Live tracking</p>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-500 text-sm mb-1">Likes</p>
                        <p className="text-2xl font-bold text-[#024a47]">
                          {listing.engagement.likes}
                        </p>
                        <p className="text-green-600 text-xs mt-1">↑ Live tracking</p>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-500 text-sm mb-1">Inquiries</p>
                        <p className="text-2xl font-bold text-[#024a47]">
                          {listing.engagement.inquiries}
                        </p>
                        <p className="text-green-600 text-xs mt-1">↑ Live tracking</p>
                      </div>

                 
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Boost Investment:</span>
                        <span className="font-bold text-[#024a47]">${listing.visibility.boostAmount}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-2">
                        <span className="text-gray-600">Days Remaining:</span>
                        <span className="font-bold text-[#024a47]">{getDaysRemaining(listing.visibility.boostEndDate)} days</span>
                      </div>
                    </div>
                  </div>
                ))}

                {listings.filter(l => l.visibility.isBoosted).length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <p className="text-lg font-semibold mb-2">No Active Boosts</p>
                    <p>Boost a listing to see real-time analytics</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Boost Modal */}
      {showModal && selectedListing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-[#024a47]">Boost Listing</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-bold text-lg text-[#024a47] mb-2">{selectedListing.title}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>{selectedListing.brand}</span>
                  <span>•</span>
                  <span>${selectedListing.pricing.rentPrice}/month</span>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-[#024a47] mb-2">
                    Boost Amount
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="10"
                      max="100"
                      step="10"
                      value={boostAmount}
                      onChange={(e) => setBoostAmount(Number(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-2xl font-bold text-[#024a47] min-w-[80px]">
                      ${boostAmount}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Min: $10</span>
                    <span>Max: $100</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#024a47] mb-2">
                    Boost Duration
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {[3, 7, 14, 30].map(days => (
                      <button
                        key={days}
                        onClick={() => setBoostDuration(days)}
                        className={`py-3 px-4 rounded-lg font-semibold transition-colors ${
                          boostDuration === days
                            ? 'bg-[#024a47] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {days} days
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#024a47] mb-2">
                    Payment Information
                  </label>
                  <div className="border border-gray-300 rounded-lg p-4 bg-white">
                    <CardElement
                      options={{
                        style: {
                          base: {
                            fontSize: '16px',
                            color: '#024a47',
                            '::placeholder': {
                              color: '#9CA3AF',
                            },
                          },
                          invalid: {
                            color: '#EF4444',
                          },
                        },
                        hidePostalCode: true,
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Your payment information is secure and encrypted
                  </p>
                </div>

                <div className="bg-gradient-to-r from-[#024a47] to-[#035d59] text-white rounded-lg p-6">
                  <h4 className="font-bold mb-4">Estimated Results</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm opacity-90 mb-1">Boost Spend</p>
                      <p className="text-2xl font-bold">${boostAmount}</p>
                    </div>
                    <div>
                      <p className="text-sm opacity-90 mb-1">Est. Reach</p>
                      <p className="text-2xl font-bold">{(boostAmount * 70).toLocaleString()} people</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white border-opacity-20">
                    <p className="text-xs opacity-75">
                      Based on {boostDuration} days boost duration
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div className="text-sm text-blue-800">
                      <p className="font-semibold mb-1">How Boosting Works</p>
                      <ul className="list-disc list-inside space-y-1 text-xs">
                        <li>Your listing appears higher in search results</li>
                        <li>Featured on homepage and category pages</li>
                        <li>Real-time analytics dashboard access</li>
                        <li>Track views, inquiries, and engagement live</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBoostSubmit}
                    disabled={!stripe || loading}
                    className="flex-1 bg-[#024a47] hover:bg-[#035d59] text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Processing...' : `Boost for $${boostAmount}`}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
   </>
  );
}