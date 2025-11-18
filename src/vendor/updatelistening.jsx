import React, { useState, useEffect } from 'react';
import { ArrowLeft, Upload, X, Package, AlertCircle, Loader, Home, BarChart3, Plus, CreditCard } from 'lucide-react';
import { BASE_URL } from '../baseUrl';
function UpdateListing() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [listingId, setListingId] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    category: 'refrigerator',
    brand: '',
    condition: 'Good',
    description: '',
    rentPrice: '',
    buyPrice: '',
    city: '',
    state: '',
    zipCode: '',
    specifications: {
      dimensions: '',
      weight: '',
      color: '',
      model: '',
      year: ''
    },
    publishToFeed: false
  });

  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const categories = [
    { value: 'refrigerator', label: 'Refrigerator' },
    { value: 'washer', label: 'Washer' },
    { value: 'dryer', label: 'Dryer' },
    { value: 'dishwasher', label: 'Dishwasher' },
    { value: 'oven', label: 'Oven' },
    { value: 'microwave', label: 'Microwave' },
    { value: 'other', label: 'Other' }
  ];

  const conditions = [
    { value: 'New', label: 'New' },
    { value: 'Like New', label: 'Like New' },
    { value: 'Good', label: 'Good' },
    { value: 'Fair', label: 'Fair' }
  ];

  useEffect(() => {
    // Get listing ID from URL path params (/listings/edit/:id)
    const pathParts = window.location.pathname.split('/');
    const id = pathParts[pathParts.length - 1];
    
    if (id && id !== 'edit') {
      setListingId(id);
      fetchListingDetails(id);
    } else {
      setError('No listing ID provided');
      setLoading(false);
    }
  }, []);

  const fetchListingDetails = async (id) => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to continue');
        window.location.href = '/login';
        return;
      }



      const response = await fetch(`${BASE_URL}/getListingById/${id}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
console.log("DATA")
console.log(data)
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load listing');
      }

      if (data.success && data.data) {
        const listing = data.data;
        
        // Convert specifications Map to object
        const specs = {};
        if (listing.specifications) {
          if (listing.specifications instanceof Map) {
            listing.specifications.forEach((value, key) => {
              specs[key] = value;
            });
          } else {
            Object.assign(specs, listing.specifications);
          }
        }

        setFormData({
          title: listing.title || '',
          category: listing.category || 'refrigerator',
          brand: listing.brand || '',
          condition: listing.condition || 'Good',
          description: listing.description || '',
          rentPrice: listing.pricing?.rentPrice || '',
          buyPrice: listing.pricing?.buyPrice || '',
          city: listing.availability?.location?.city || '',
          state: listing.availability?.location?.state || '',
          zipCode: listing.availability?.location?.zipCode || '',
          specifications: {
            dimensions: specs.dimensions || '',
            weight: specs.weight || '',
            color: specs.color || '',
            model: specs.model || '',
            year: specs.year || ''
          },
          publishToFeed: listing.publishToFeed || false
        });

        setExistingImages(listing.images || []);
      }

    } catch (err) {
      console.error('Fetch listing error:', err);
      setError(err.message || 'Failed to load listing details');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('specifications.')) {
      const specKey = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [specKey]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    if (images.length + existingImages.length + files.length > 5) {
      setError('Maximum 5 images allowed');
      return;
    }

    setImages(prev => [...prev, ...files]);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeNewImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const convertUrlToFile = async (imageObj, index) => {
    try {
      const response = await fetch(imageObj.url);
      const blob = await response.blob();
      const filename = imageObj.publicId || `existing-image-${index}`;
      const file = new File([blob], filename, { type: blob.type });
      return file;
    } catch (error) {
      console.error('Error converting image to file:', error);
      return null;
    }
  };


    
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.brand || !formData.rentPrice || !formData.buyPrice || !formData.description) {
      setError('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      
    

      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('category', formData.category);
      submitData.append('brand', formData.brand);
      submitData.append('condition', formData.condition);
      submitData.append('description', formData.description);
      submitData.append('rentPrice', formData.rentPrice);
      submitData.append('buyPrice', formData.buyPrice);
      submitData.append('city', formData.city);
      submitData.append('state', formData.state);
      submitData.append('zipCode', formData.zipCode);
      submitData.append('publishToFeed', formData.publishToFeed);
      
      // Add specifications
      Object.entries(formData.specifications).forEach(([key, value]) => {
        if (value) {
          submitData.append(`specifications[${key}]`, value);
        }
      });
      
      // Add new images
      const existingImageFiles = await Promise.all(
        existingImages.map((img, index) => convertUrlToFile(img, index))
      );
      
      // Filter out any failed conversions
      const validExistingFiles = existingImageFiles.filter(file => file !== null);
      
      // Add all images (existing + new)
      validExistingFiles.forEach(file => {
        submitData.append('images', file);
      });
      
      images.forEach(image => {
        submitData.append('images', image);
      });
      const response = await fetch(`${BASE_URL}/listings/${listingId}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`
        },
        body: submitData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update listing');
      }

      setSuccess('Listing updated successfully!');
      setTimeout(() => {
        window.location.href = '/vendordashboard';
      }, 1500);

    } catch (err) {
      console.error('Update listing error:', err);
      setError(err.message || 'Failed to update listing');
    } finally {
      setSubmitting(false);
    }
  };

  const goBack = () => {
    window.location.href = '/vendordashboard';
  };

  const navigateTo = (path) => {
    window.location.href = path;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-[#024a47] animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading listing details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={goBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              type="button"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-[#024a47]">Update Listing</h1>
              <p className="text-sm text-gray-600 mt-1">Edit your appliance listing details</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-800">{error}</p>
            </div>
            <button onClick={() => setError('')} className="text-red-500 hover:text-red-700" type="button">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
            <p className="text-green-800">{success}</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Samsung French Door Refrigerator"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#024a47] focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#024a47] focus:border-transparent"
                    required
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brand <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    placeholder="e.g., Samsung"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#024a47] focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Condition <span className="text-red-500">*</span>
                </label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#024a47] focus:border-transparent"
                  required
                >
                  {conditions.map(cond => (
                    <option key={cond.value} value={cond.value}>{cond.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Describe the appliance, its features, and condition..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#024a47] focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rent Price ($/month) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="rentPrice"
                  value={formData.rentPrice}
                  onChange={handleInputChange}
                  placeholder="75"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#024a47] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buy Price ($) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="buyPrice"
                  value={formData.buyPrice}
                  onChange={handleInputChange}
                  placeholder="1200"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#024a47] focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Location</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="New York"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#024a47] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  placeholder="NY"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#024a47] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  placeholder="10001"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#024a47] focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Specifications */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Specifications</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dimensions</label>
                <input
                  type="text"
                  name="specifications.dimensions"
                  value={formData.specifications.dimensions}
                  onChange={handleInputChange}
                  placeholder='36" x 70" x 30"'
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#024a47] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Weight</label>
                <input
                  type="text"
                  name="specifications.weight"
                  value={formData.specifications.weight}
                  onChange={handleInputChange}
                  placeholder="300 lbs"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#024a47] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                <input
                  type="text"
                  name="specifications.color"
                  value={formData.specifications.color}
                  onChange={handleInputChange}
                  placeholder="Stainless Steel"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#024a47] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
                <input
                  type="text"
                  name="specifications.model"
                  value={formData.specifications.model}
                  onChange={handleInputChange}
                  placeholder="RF28R7351SR"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#024a47] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                <input
                  type="text"
                  name="specifications.year"
                  value={formData.specifications.year}
                  onChange={handleInputChange}
                  placeholder="2022"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#024a47] focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Images</h2>
            
            {existingImages.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-3">Current Images</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {existingImages.map((img, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={img.url}
                        alt={`Existing ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {imagePreviews.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-3">New Images</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#024a47] transition-colors">
              <input
                type="file"
                id="image-upload"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={images.length + existingImages.length >= 5}
              />
              <label
                htmlFor="image-upload"
                className={`cursor-pointer ${images.length + existingImages.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-1">
                  {images.length + existingImages.length >= 5 
                    ? 'Maximum 5 images reached' 
                    : 'Click to upload new images'}
                </p>
                <p className="text-sm text-gray-500">
                  {5 - images.length - existingImages.length} remaining (Max 5)
                </p>
              </label>
            </div>
          </div>

          {/* Publish to Feed */}
        

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              onClick={goBack}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 bg-[#024a47] text-white px-6 py-3 rounded-lg hover:bg-[#035d59] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {submitting ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <span>Update Listing</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 lg:hidden z-10">
        <div className="flex justify-around py-3">
          <button 
            onClick={() => navigateTo('/dashboard')}
            className="flex flex-col items-center text-gray-600"
            type="button"
          >
            <Home className="w-6 h-6" />
            <span className="text-xs mt-1">Dashboard</span>
          </button>
          <button 
            onClick={() => navigateTo('/feed')}
            className="flex flex-col items-center text-gray-600"
            type="button"
          >
            <BarChart3 className="w-6 h-6" />
            <span className="text-xs mt-1">Feed</span>
          </button>
          <button className="flex flex-col items-center text-[#024a47]" type="button">
            <Plus className="w-6 h-6" />
            <span className="text-xs mt-1">Update</span>
          </button>
          <button 
            onClick={() => navigateTo('/subscription')}
            className="flex flex-col items-center text-gray-600"
            type="button"
          >
            <CreditCard className="w-6 h-6" />
            <span className="text-xs mt-1">Subscribe</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default UpdateListing;