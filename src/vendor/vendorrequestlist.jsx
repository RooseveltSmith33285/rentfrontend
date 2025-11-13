import { useEffect, useState } from 'react';
import React from 'react';
import { BASE_URL } from '../baseUrl';
import { Check } from 'lucide-react';

export default function VendorRequestsListPage() {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [processingId, setProcessingId] = useState(null);
  const [uploadedPhotos, setUploadedPhotos] = useState({
    front: null,
    side: null,
    serialTag: null,
    condition: null
  });
  const [showPreDelivery, setShowPreDelivery] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [photos, setPhotos] = useState({
    front: null,
    side: null,
    serialTag: null,
    condition: null
  });

  useEffect(() => {
    getVendorRequests();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [requests, selectedFilter]);

  const applyFilters = () => {
    let filtered = [...requests];

    if (selectedFilter === 'pending') {
      filtered = filtered.filter(req => !req.status || req.status === 'pending');
    } else if (selectedFilter === 'approved') {
      filtered = filtered.filter(req => req.status === 'approved');
    } else if (selectedFilter === 'rejected') {
      filtered = filtered.filter(req => req.status === 'rejected');
    }

    setFilteredRequests(filtered);
  };

  const getVendorRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/getVendorRequests`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      setRequests(data.requests || []);
    } catch (e) {
      console.error('Error fetching requests:', e);
      alert('Error while fetching requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };



  const handleReject = async (requestId) => {
    try {
      setProcessingId(requestId);
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/rejectRequest`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ id:requestId })
      });
      
      if (response.ok) {
        alert('Request rejected');
        getVendorRequests();
      } else {
        const data = await response.json();
        alert(data.error || 'Error rejecting request');
      }
    } catch (e) {
      console.error('Error rejecting request:', e);
      alert('Error rejecting request. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  const getPrimaryImage = (images) => {
    if (!images || images.length === 0) return 'https://via.placeholder.com/150';
    const primary = images.find(img => img.isPrimary);
    return primary ? primary.url : images[0].url;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };






  const PreDeliveryProcess = ({ onClose, onSubmit }) => {
    const [photos, setPhotos] = useState({
      front: false,
      side: false,
      serialTag: false,
      condition: false
    });
  
    const handlePhotoUpload = (type, event) => {
      const file = event.target.files[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
          alert('File size should be less than 5MB');
          return;
        }
        if (!file.type.startsWith('image/')) {
          alert('Please upload an image file');
          return;
        }
        setPhotos(prev => ({ ...prev, [type]: file }));
      }
    };
    
    const removePhoto = (type) => {
      setPhotos(prev => ({ ...prev, [type]: null }));
    };
  
    const handleSubmit = () => {
      const allPhotosComplete = Object.values(photos).every(photo => photo !== null);
      if (!allPhotosComplete) {
        alert('Please upload all required photos before submitting.');
        return;
      }
      onSubmit(photos); // Pass photos to parent if needed
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-8">
            {/* Header with Close Button */}
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold">Pre-Delivery Process</h2>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
  
            {/* Photos Section */}
       {/* Photos Section */}
<div className="border border-gray-200 rounded-2xl p-6 mb-6">
  <div className="flex items-start gap-4 mb-6">
    <div className="w-8 h-8 bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
      <Check className="w-5 h-5 text-white" strokeWidth={3} />
    </div>
    <div className="flex-1">
      <h3 className="text-2xl font-bold mb-2">Photos</h3>
      <p className="text-gray-700 text-lg">
        Capture front, side, serial tag, and condition photos of the unit
      </p>
    </div>
  </div>

  <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
    {[
      { key: 'front', label: 'Front' },
      { key: 'side', label: 'Side' },
      { key: 'serialTag', label: 'Serial tag' },
      { key: 'condition', label: 'Condition' }
    ].map((item) => (
      <div key={item.key} className="relative">
        <input
          type="file"
          id={`upload-${item.key}`}
          accept="image/*"
          className="hidden"
          onChange={(e) => handlePhotoUpload(item.key, e)}
        />
        <label
          htmlFor={`upload-${item.key}`}
          className={`aspect-square rounded-2xl border-2 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer ${
            photos[item.key]
              ? 'bg-green-100 border-green-300'
              : 'bg-gray-100 border-gray-300 hover:bg-gray-200'
          }`}
        >
          {photos[item.key] ? (
            <>
              <div className="w-full h-full rounded-2xl overflow-hidden p-2">
                <img
                  src={URL.createObjectURL(photos[item.key])}
                  alt={item.label}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  removePhoto(item.key);
                }}
                className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 z-10"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-lg bg-gray-300 flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-900">{item.label}</span>
            </>
          )}
        </label>
      </div>
    ))}
    <div className="aspect-square rounded-2xl border-2 bg-gray-100 border-gray-300 flex items-center justify-center">
      <div className="w-12 h-12 rounded-lg bg-gray-300"></div>
    </div>
  </div>
</div>
            {/* Operational Test Section */}
            <div className="border border-gray-200 rounded-2xl p-6 mb-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-8 h-8 bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 text-white" strokeWidth={3} />
                </div>
                <h3 className="text-2xl font-bold">Operational Test</h3>
              </div>
  
              <div className="ml-12 space-y-3">
                <p className="text-gray-700 text-lg mb-4">Perform function checks</p>
                
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-white" strokeWidth={3} />
                  </div>
                  <span className="text-lg text-gray-900">Verify proper operation</span>
                </div>
  
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-white" strokeWidth={3} />
                  </div>
                  <span className="text-lg text-gray-900">Desired location confirmed</span>
                </div>
  
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-white" strokeWidth={3} />
                  </div>
                  <span className="text-lg text-gray-900">Safe to install</span>
                </div>
              </div>
            </div>
  
            {/* Unit Ready Section */}
            <div className="border border-gray-200 rounded-2xl p-6 mb-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 text-white" strokeWidth={3} />
                </div>
                <h3 className="text-2xl font-bold">Unit Ready for Purchase & Delivery</h3>
              </div>
            </div>
  
            {/* Submit Button */}
            <button 
              onClick={handleSubmit}
              className="w-full bg-green-900 hover:bg-green-800 text-white text-xl font-semibold py-4 rounded-2xl transition-colors"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    );
  };


  const handleApprove = async (requestId) => {
    setSelectedRequestId(requestId);
    setShowPreDelivery(true);
  };

  const handlePreDeliverySubmit = async (photos) => {
    try {
      setProcessingId(selectedRequestId);
      const token = localStorage.getItem('token');
      
      const formData = new FormData();
      formData.append('id', selectedRequestId);
      
      if (photos.front) formData.append('front', photos.front);
      if (photos.side) formData.append('side', photos.side);
      if (photos.serialTag) formData.append('serialTag', photos.serialTag);
      if (photos.condition) formData.append('condition', photos.condition);
      
      const response = await fetch(`${BASE_URL}/approveRequest`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });
  
      if (response.ok) {
        alert('Request approved successfully!');
        setShowPreDelivery(false);
        setSelectedRequestId(null);
        getVendorRequests();
      } else {
        const data = await response.json();
        alert(data.error || 'Error approving request');
      }
    } catch (e) {
      console.error('Error approving request:', e);
      alert('Error approving request. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };
  const getStatusBadge = (status) => {
    if (!status || status === 'pending') {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
          Pending
        </span>
      );
    } else if (status === 'approved') {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Approved
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          Rejected
        </span>
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#024a47] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Rental Requests 📋
          </h1>
          <p className="text-gray-600 mt-2">Manage your incoming rental requests</p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button 
            onClick={() => setSelectedFilter('all')}
            className={`px-4 py-2 border rounded-full transition-colors ${
              selectedFilter === 'all'
                ? 'bg-[#024a47] text-white border-[#024a47]'
                : 'bg-white border-gray-300 hover:bg-gray-50'
            }`}
          >
            All Requests
          </button>
          <button 
            onClick={() => setSelectedFilter('pending')}
            className={`px-4 py-2 border rounded-full transition-colors ${
              selectedFilter === 'pending'
                ? 'bg-[#024a47] text-white border-[#024a47]'
                : 'bg-white border-gray-300 hover:bg-gray-50'
            }`}
          >
            Pending
          </button>
          <button 
            onClick={() => setSelectedFilter('approved')}
            className={`px-4 py-2 border rounded-full transition-colors ${
              selectedFilter === 'approved'
                ? 'bg-[#024a47] text-white border-[#024a47]'
                : 'bg-white border-gray-300 hover:bg-gray-50'
            }`}
          >
            Approved
          </button>
          <button 
            onClick={() => setSelectedFilter('rejected')}
            className={`px-4 py-2 border rounded-full transition-colors ${
              selectedFilter === 'rejected'
                ? 'bg-[#024a47] text-white border-[#024a47]'
                : 'bg-white border-gray-300 hover:bg-gray-50'
            }`}
          >
            Rejected
          </button>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-600">
          Showing {filteredRequests.length} {filteredRequests.length === 1 ? 'request' : 'requests'}
        </div>

        {/* Requests List */}
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-xl text-gray-600 mt-4">No requests found</p>
            <p className="text-gray-500 mt-2">
              {selectedFilter !== 'all' ? 'Try changing the filter to see more requests' : 'Requests will appear here when renters contact you'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <div key={request._id} className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Listing Info Section */}
                  <div className="flex gap-4 flex-1">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden">
                        <img 
                          className="w-full h-full object-contain p-2" 
                          src={getPrimaryImage(request?.listing?.images)} 
                          alt={request?.listing?.title || 'Product'} 
                        />
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
                        {request?.listing?.title || 'Product'}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {request?.listing?.brand} • {request?.listing?.condition}
                      </p>
                      <p className="text-xl font-bold text-gray-900 mb-2">
                        ${request?.listing?.pricing?.rentPrice}/mo
                      </p>
                      <div className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full capitalize">
                        {request?.listing?.category}
                      </div>
                    </div>
                  </div>

                  {/* Divider for large screens */}
                  <div className="hidden lg:block w-px bg-gray-200"></div>

                  {/* Customer Info Section */}
                  <div className="flex-1 lg:pl-4">
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">Customer Details</h4>
                      <div className="space-y-2">
                        <div className="flex items-center text-gray-700">
                          <svg className="w-5 h-5 mr-2 text-[#024a47]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="font-medium">{request?.user?.name || 'N/A'}</span>
                        </div>
                        <div className="flex items-center text-gray-700">
                          <svg className="w-5 h-5 mr-2 text-[#024a47]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span className="text-sm">{request?.user?.email || 'N/A'}</span>
                        </div>
                        <div className="flex items-center text-gray-700">
                          <svg className="w-5 h-5 mr-2 text-[#024a47]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span className="text-sm">{request?.user?.mobile || 'N/A'}</span>
                        </div>
                        {request?.deliveryType && (
                          <div className="flex items-center text-gray-700">
                            <svg className="w-5 h-5 mr-2 text-[#024a47]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                            </svg>
                            <span className="text-sm capitalize">{request?.deliveryType}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Request Info */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500">Request Date:</span>
                        <span className="text-sm font-medium text-gray-700">{formatDate(request.createdAt)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Status:</span>
                        {getStatusBadge(request.status)}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {(!request.status || request.status === 'pending') && (
                      <div className="flex gap-3 mt-4">
                        <button
                          onClick={() => handleApprove(request._id)}
                          disabled={processingId === request._id}
                          className="flex-1 py-2 px-4 rounded-lg font-semibold text-sm bg-[#024a47] hover:bg-[#035d59] text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                          {processingId === request._id ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          ) : (
                            <>
                              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Approve
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleReject(request._id)}
                          disabled={processingId === request._id}
                          className="flex-1 py-2 px-4 rounded-lg font-semibold text-sm bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                          {processingId === request._id ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          ) : (
                            <>
                              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Reject
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showPreDelivery && (
  <PreDeliveryProcess 
    onClose={() => {
      setShowPreDelivery(false);
      setSelectedRequestId(null);
    }}
    onSubmit={handlePreDeliverySubmit}
  />
)}
    </div>
  );
}