import React, { useState, useEffect } from 'react';
import { ArrowLeft, Image, X, Sparkles, Megaphone, Lightbulb, Tag, Send, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { BASE_URL } from '../baseUrl';

function CommunityPostPage() {
  const [postType, setPostType] = useState('announcement');
  const [content, setContent] = useState('');
  const [selectedListing, setSelectedListing] = useState('');
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingListings, setFetchingListings] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Fetch vendor's listings on mount
  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    setFetchingListings(true);
    try {
      const token = localStorage.getItem('vendorToken');
      
      if (!token) {
        console.error('No token found');
        setError('Please log in to continue');
        return;
      }

      const response = await axios.get(`${BASE_URL}/listings`, {
        headers: { 
          'Authorization': `Bearer ${token}` 
        }
      });
      
      console.log('Full response:', response);
      console.log('Response data:', response.data);
      
      // Handle different response structures
      let listingsData = [];
      
      if (response.data.success && Array.isArray(response.data.data)) {
        listingsData = response.data.data;
      } else if (response.data.success && response.data.listings) {
        listingsData = response.data.listings;
      } else if (Array.isArray(response.data)) {
        listingsData = response.data;
      }
      
      console.log('Parsed listings:', listingsData);
      
      // Filter only active listings
      const activeListings = listingsData.filter(l => l.status === 'active');
      console.log('Active listings:', activeListings);
      
      setListings(activeListings);
      
    } catch (err) {
      console.error('Error fetching listings:', err);
      console.error('Error response:', err.response);
      
      if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
      }
    } finally {
      setFetchingListings(false);
    }
  };

  const postTypes = [
    { 
      value: 'announcement', 
      label: 'Announcement', 
      icon: Megaphone, 
      color: 'bg-blue-500',
      description: 'Share important updates'
    },
    { 
      value: 'tip', 
      label: 'Tip & Advice', 
      icon: Lightbulb, 
      color: 'bg-yellow-500',
      description: 'Share helpful tips'
    },
    { 
      value: 'update', 
      label: 'Update', 
      icon: Sparkles, 
      color: 'bg-purple-500',
      description: 'Share business updates'
    },
    { 
      value: 'promotion', 
      label: 'Promotion', 
      icon: Tag, 
      color: 'bg-green-500',
      description: 'Promote special offers'
    }
  ];

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    if (images.length + files.length > 4) {
      setError('Maximum 4 images allowed');
      return;
    }

    setImages([...images, ...files]);
    
    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('Content is required');
      return;
    }

    if (content.length > 5000) {
      setError('Content must be less than 5000 characters');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const token = localStorage.getItem('vendorToken');
      const formData = new FormData();
      
      formData.append('type', postType);
      formData.append('content', content);
      if (selectedListing) {
        formData.append('linkedListing', selectedListing);
      }
      
      images.forEach(image => {
        formData.append('images', image);
      });

      const response = await axios.post(
        `${BASE_URL}/community/posts`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        setSuccess(true);
        // Reset form
        setContent('');
        setSelectedListing('');
        setImages([]);
        setImagePreviews([]);
        setPostType('announcement');
        
        setTimeout(() => {
          setSuccess(false);
          window.history.back();
        }, 2000);
      }
    } catch (err) {
      console.error('Post creation error:', err);
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const currentPostType = postTypes.find(pt => pt.value === postType);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <button 
              onClick={() => window.history.back()}
              className="flex items-center space-x-2 text-gray-600 hover:text-[#024a47]"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-semibold">Back</span>
            </button>
            <h1 className="text-xl font-bold text-[#024a47]">Create Community Post</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-green-800">Post created successfully!</p>
              <p className="text-sm text-green-700">Your post is now visible in the community feed.</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-800">{error}</p>
            <button 
              onClick={() => setError('')}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Post Type Selection */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-[#024a47] mb-4">Select Post Type</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {postTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setPostType(type.value)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    postType === type.value
                      ? 'border-[#024a47] bg-[#024a47] bg-opacity-5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`${type.color} rounded-lg p-3 w-fit mx-auto mb-2`}>
                    <type.icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="font-semibold text-sm text-[#024a47]">{type.label}</p>
                  <p className="text-xs text-gray-600 mt-1">{type.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <label className="block text-lg font-semibold text-[#024a47] mb-2">
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`Share your ${currentPostType.label.toLowerCase()} with the community...`}
              className="w-full h-48 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#024a47] focus:border-transparent resize-none"
              maxLength={5000}
              required
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-sm text-gray-500">
                {content.length}/5000 characters
              </p>
              {content.length > 4500 && (
                <p className="text-sm text-orange-600 font-semibold">
                  {5000 - content.length} characters remaining
                </p>
              )}
            </div>
          </div>

          {/* Link Listing */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <label className="block text-lg font-semibold text-[#024a47] mb-2">
              Link a Listing (Optional)
            </label>
            <p className="text-sm text-gray-600 mb-4">
              Attach one of your listings to this post to drive more visibility
            </p>
            
            {fetchingListings ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#024a47]"></div>
                <span className="ml-2 text-gray-600">Loading listings...</span>
              </div>
            ) : (
              <select
                value={selectedListing}
                onChange={(e) => setSelectedListing(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#024a47] focus:border-transparent"
              >
                <option value="">No listing selected</option>
                {listings.length > 0 ? (
                  listings.map((listing) => (
                    <option key={listing._id} value={listing._id}>
                      {listing.title} - {listing.category}
                    </option>
                  ))
                ) : (
                  <option disabled>No active listings available</option>
                )}
              </select>
            )}
            
            {!fetchingListings && listings.length === 0 && (
              <p className="text-xs text-gray-500 mt-2">
                You don't have any active listings yet. Create a listing first to link it here.
              </p>
            )}
            
            {/* Debug info - remove in production */}
            <p className="text-xs text-gray-400 mt-2">
              {listings.length} active listing(s) found
            </p>
          </div>

          {/* Image Upload */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <label className="block text-lg font-semibold text-[#024a47] mb-2">
              Add Images (Optional)
            </label>
            <p className="text-sm text-gray-600 mb-4">
              Upload up to 4 images to make your post more engaging
            </p>

            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Button */}
            {images.length < 4 && (
              <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#024a47] transition-colors">
                <div className="text-center">
                  <Image className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Click to upload images</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {4 - images.length} remaining
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !content.trim()}
              className="px-6 py-3 bg-[#024a47] text-white rounded-lg hover:bg-[#035d59] font-semibold transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Posting...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Publish Post</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Community Guidelines</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Be respectful and professional in your posts</li>
            <li>• Share valuable content that benefits the community</li>
            <li>• Avoid spam or excessive self-promotion</li>
            <li>• Use appropriate images and language</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default CommunityPostPage;