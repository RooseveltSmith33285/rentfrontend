import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Filter, TrendingUp, Eye, Heart, MessageSquare, Share2, MoreVertical, Edit, Trash2, Rocket, Home, BarChart3, Plus, CreditCard, Package, AlertCircle, X } from 'lucide-react';
import axios from 'axios';
import { BASE_URL } from '../baseUrl';
import { useNavigate } from 'react-router-dom';

function VendorFeed() {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('visibility');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDropdown, setShowDropdown] = useState(null);
  const [stats, setStats] = useState(null);
  const [deleting, setDeleting] = useState(null);
  
  const observer = useRef();
  const lastListingRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'refrigerator', label: 'Refrigerator' },
    { value: 'washer', label: 'Washer' },
    { value: 'dryer', label: 'Dryer' },
    { value: 'dishwasher', label: 'Dishwasher' },
    { value: 'oven', label: 'Oven' },
    { value: 'microwave', label: 'Microwave' },
    { value: 'other', label: 'Other' }
  ];

  // Fetch listings when page, category, or sort changes
  useEffect(() => {
    fetchListings();
  }, [page]);

  // Filter locally when search query changes
  useEffect(() => {
    filterListings();
  }, [listings, searchQuery]);

  // Reset and refetch when filters change
  useEffect(() => {
    if (page === 1) {
      fetchListings(true);
    } else {
      setPage(1);
      setListings([]);
    }
  }, [selectedCategory, sortBy]);

  const fetchListings = async (reset = false) => {
    if (loading) return;
    
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please log in to view your listings');
        navigate('/login');
        return;
      }

      const response = await axios.get(`${BASE_URL}/getVendorListingsFeed`, {
        headers: { 'Authorization': `Bearer ${token}` },
        params: {
          page: reset ? 1 : page,
          limit: 12,
          category: selectedCategory,
          sortBy: sortBy
        }
      });

      console.log('API Response:', response.data);

      if (response.data.success) {
        const newListings = response.data.data || [];
        
        if (reset) {
          setListings(newListings);
        } else {
          setListings(prev => [...prev, ...newListings]);
        }
        
        setHasMore(response.data.pagination?.hasMore || false);
        setStats(response.data.stats);
      }

    } catch (err) {
      console.error('Fetch listings error:', err);
      setError(err.response?.data?.error || 'Failed to load listings');
      
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const filterListings = () => {
    let filtered = [...listings];

    // Search filter (client-side for better UX)
    if (searchQuery) {
      filtered = filtered.filter(listing =>
        listing.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredListings(filtered);
  };

  const handleEdit = (listingId) => {
    navigate(`/listings/edit/${listingId}`);
  };

  const handleDelete = async (listingId) => {
    if (!window.confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      return;
    }

    setDeleting(listingId);
    setShowDropdown(null);

    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.delete(`${BASE_URL}/listings/${listingId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        // Remove from local state
        setListings(prev => prev.filter(l => l._id !== listingId));
        setFilteredListings(prev => prev.filter(l => l._id !== listingId));
        
        // Show success message
        alert('Listing deleted successfully');
      }

    } catch (err) {
      console.error('Delete listing error:', err);
      setError(err.response?.data?.error || 'Failed to delete listing');
    } finally {
      setDeleting(null);
    }
  };

  const handleBoost = (listingId) => {
    navigate(`/boost`);
  };

  const handleToggleStatus = async (listingId) => {
    try {
      const token = localStorage.getItem('token');
      
      // Find the current listing to determine new status
      const currentListing = listings.find(l => l._id === listingId);
      const newStatus = currentListing.status === 'active' ? 'inactive' : 'active';
      
      const response = await axios.post(
        `${BASE_URL}/updateStatus`,
        {
          id: listingId,
          status: newStatus
        },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (response.data.message) {
        // Update local state with new status
        setListings(prev => prev.map(l => 
          l._id === listingId ? { ...l, status: newStatus } : l
        ));
        setFilteredListings(prev => prev.map(l => 
          l._id === listingId ? { ...l, status: newStatus } : l
        ));
        
        alert(response.data.message);
      }

    } catch (err) {
      console.error('Toggle status error:', err);
      setError(err.response?.data?.error || 'Error while trying to update status');
    }
  };
  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num?.toString() || '0';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-[#024a47]">My Listings Feed</h1>
              {stats && (
                <p className="text-sm text-gray-600 mt-1">
                  {stats.total} total • {stats.active} active • {stats.boosted} boosted
                </p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {filteredListings.length} listing{filteredListings.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search listings..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#024a47] focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#024a47] focus:border-transparent"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#024a47] focus:border-transparent"
            >
              <option value="visibility">Visibility Score</option>
              <option value="views">Most Views</option>
              <option value="engagement">Most Engagement</option>
              <option value="recent">Most Recent</option>
            </select>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-800">{error}</p>
            </div>
            <button
              onClick={() => setError('')}
              className="text-red-500 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Stats Summary */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <p className="text-sm text-gray-600">Total Views</p>
              <p className="text-2xl font-bold text-[#024a47]">{formatNumber(stats.totalViews)}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4">
              <p className="text-sm text-gray-600">Total Engagement</p>
              <p className="text-2xl font-bold text-[#024a47]">{formatNumber(stats.totalEngagement)}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4">
              <p className="text-sm text-gray-600">Active Listings</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4">
              <p className="text-sm text-gray-600">Boosted</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.boosted}</p>
            </div>
          </div>
        )}

        {/* Listings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((listing, index) => (
            <div
              key={listing._id}
              ref={index === filteredListings.length - 1 ? lastListingRef : null}
              className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow ${
                deleting === listing._id ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              {/* Image */}
              <div className="relative h-48 bg-gray-200">
                {listing.images && listing.images[0]?.url ? (
                  <img
                    src={listing.images[0].url}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-300">
                    <Package className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                
                {/* Boosted Badge */}
                {listing.visibility?.isBoosted && (
                  <div className="absolute top-3 left-3 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
                    <Rocket className="w-3 h-3" />
                    <span>Boosted</span>
                  </div>
                )}

                {/* Status Badge */}
                <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                  listing.status === 'active' ? 'bg-green-500 text-white' :
                  listing.status === 'draft' ? 'bg-gray-500 text-white' :
                  listing.status === 'rented' ? 'bg-blue-500 text-white' :
                  listing.status === 'sold' ? 'bg-purple-500 text-white' :
                  'bg-orange-500 text-white'
                }`}>
                  {listing.status}
                </div>

                {/* Actions Menu */}
                <div className="absolute bottom-3 right-3">
                  <button
                    onClick={() => setShowDropdown(showDropdown === listing._id ? null : listing._id)}
                    className="bg-white bg-opacity-90 p-2 rounded-full hover:bg-opacity-100 transition-all"
                  >
                    <MoreVertical className="w-4 h-4 text-gray-700" />
                  </button>

                  {showDropdown === listing._id && (
                    <>
                      {/* Backdrop to close dropdown */}
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setShowDropdown(null)}
                      />
                      
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                        <button
                          onClick={() => handleEdit(listing._id)}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
                        >
                          <Edit className="w-4 h-4" />
                          <span>Edit Listing</span>
                        </button>
                        <button
                          onClick={() => {
                            handleToggleStatus(listing._id);
                            setShowDropdown(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
                        >
                          <TrendingUp className="w-4 h-4" />
                          <span>{listing.status === 'active' ? 'Deactivate' : 'Activate'}</span>
                        </button>
                        <button
                          onClick={() => {
                            handleBoost(listing._id);
                            setShowDropdown(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
                        >
                          <Rocket className="w-4 h-4" />
                          <span>Boost Listing</span>
                        </button>
                        <div className="border-t border-gray-200 my-1"></div>
                        <button
                          onClick={() => handleDelete(listing._id)}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2 text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                {/* Title and Category */}
                <div className="mb-2">
                  <h3 className="text-lg font-semibold text-[#024a47] mb-1 line-clamp-1">
                    {listing.title}
                  </h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span className="capitalize">{listing.category}</span>
                    <span>•</span>
                    <span>{listing.brand}</span>
                    <span>•</span>
                    <span>{listing.condition}</span>
                  </div>
                </div>

                {/* Pricing */}
                <div className="mb-3 flex items-center space-x-4">
                  <div>
                    <p className="text-xs text-gray-500">Rent/month</p>
                    <p className="text-lg font-bold text-[#024a47]">
                      ${listing.pricing?.rentPrice || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Buy</p>
                    <p className="text-lg font-bold text-gray-700">
                      ${listing.pricing?.buyPrice || 0}
                    </p>
                  </div>
                </div>

                {/* Visibility Score */}
                <div className="mb-3 bg-gray-50 rounded-lg p-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">Visibility Score</span>
                    <span className="text-sm font-bold text-[#024a47]">
                      {listing.visibility?.visibilityScore || 0}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-[#024a47] h-2 rounded-full transition-all"
                      style={{ width: `${listing.visibility?.visibilityScore || 0}%` }}
                    />
                  </div>
                </div>

                {/* Engagement Stats */}
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="flex flex-col items-center">
                    <Eye className="w-4 h-4 text-gray-500 mb-1" />
                    <span className="text-xs font-semibold text-gray-700">
                      {formatNumber(listing.engagement?.views || 0)}
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Heart className="w-4 h-4 text-gray-500 mb-1" />
                    <span className="text-xs font-semibold text-gray-700">
                      {formatNumber(listing.engagement?.likes || 0)}
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <MessageSquare className="w-4 h-4 text-gray-500 mb-1" />
                    <span className="text-xs font-semibold text-gray-700">
                      {formatNumber(listing.engagement?.inquiries || 0)}
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Share2 className="w-4 h-4 text-gray-500 mb-1" />
                    <span className="text-xs font-semibold text-gray-700">
                      {formatNumber(listing.engagement?.shares || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#024a47]"></div>
          </div>
        )}

        {/* No Results */}
        {!loading && filteredListings.length === 0 && !error && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No listings found</h3>
            <p className="text-gray-500 mb-6">
              {searchQuery || selectedCategory !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Create your first listing to get started'}
            </p>
            <button 
              onClick={() => navigate('/listening')}
              className="bg-[#024a47] text-white px-6 py-3 rounded-lg hover:bg-[#035d59] transition-colors"
            >
              Create Listing
            </button>
          </div>
        )}

        {/* End of Results */}
        {!loading && !hasMore && filteredListings.length > 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">You've reached the end of your listings</p>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 lg:hidden z-10">
        <div className="flex justify-around py-3">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex flex-col items-center text-gray-600"
          >
            <Home className="w-6 h-6" />
            <span className="text-xs mt-1">Dashboard</span>
          </button>
          <button className="flex flex-col items-center text-[#024a47]">
            <BarChart3 className="w-6 h-6" />
            <span className="text-xs mt-1">Feed</span>
          </button>
          <button 
            onClick={() => navigate('/listening')}
            className="flex flex-col items-center text-gray-600"
          >
            <Plus className="w-6 h-6" />
            <span className="text-xs mt-1">Create</span>
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
  );
}

export default VendorFeed;