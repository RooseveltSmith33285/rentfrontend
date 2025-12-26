import React, { useState, useEffect } from 'react';
import { Package, MessageCircle,Home, Clock, User, MapPin, Calendar, Phone, Mail, AlertCircle } from 'lucide-react';
import { BASE_URL } from '../baseUrl';
import { Link } from 'react-router-dom';

const ActiveRentals = () => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchActiveRentals();
  }, []);

  const fetchActiveRentals = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/getActiveRentals`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('vendorToken')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch rentals');
      
      const data = await response.json();
      setRentals(data.requests || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending_confirmation':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#024a47] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading active rentals...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-red-900 text-center mb-2">Error Loading Rentals</h3>
          <p className="text-red-700 text-center">{error}</p>
          <button
            onClick={fetchActiveRentals}
            className="mt-4 w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-semibold"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <Link to='/vendordashboard'>
          <button className="hidden lg:flex items-center space-x-2 hover:opacity-80">
                <Home className="w-5 h-5" />
                <span>Dashboard</span>
              </button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#024a47] mb-2">Active Rentals</h1>
              <p className="text-gray-600">Manage your ongoing rental orders and deliveries</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-[#024a47]">{rentals.length}</p>
              <p className="text-sm text-gray-600">Active Orders</p>
            </div>
          </div>
        </div>

        {/* Rentals Table */}
        {rentals.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Active Rentals</h3>
            <p className="text-gray-600">You don't have any active rental orders at the moment.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Item Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Renter Info
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Delivery Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {rentals.map((rental) => (
                    <tr key={rental._id} className="hover:bg-gray-50 transition-colors">
                      {/* Item Details */}
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                            {rental.listing?.images?.[0]?.url ? (
                              <img 
                                src={rental.listing.images[0].url} 
                                alt={rental.listing.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="w-6 h-6 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-[#024a47]">
                              {rental.listing?.title || 'Listing Title'}
                            </p>
                            <p className="text-sm text-gray-600">
                              {rental.listing?.brand} • {rental.listing?.category}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              <Calendar className="w-3 h-3 inline mr-1" />
                              Ordered: {formatDate(rental.createdAt)}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Renter Info */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="font-medium text-gray-900">
                              {rental.user?.name || 'N/A'}
                            </span>
                          </div>
                          {rental.user?.mobile && (
                            <div className="flex items-center space-x-2">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                {rental.user.mobile}
                              </span>
                            </div>
                          )}
                          {rental.user?.email && (
                            <div className="flex items-center space-x-2">
                              <Mail className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                {rental.user.email}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Delivery Details */}
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <div className="flex items-start space-x-2">
                            <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-gray-600">
                              {rental.deliveryAddress ? (
                                <>
                                  {rental.deliveryAddress.street}<br />
                                  {rental.deliveryAddress.city}, {rental.deliveryAddress.state} {rental.deliveryAddress.zipCode}
                                </>
                              ) : (
                                <span className="text-gray-400">No address provided</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-semibold text-gray-700">
                              Type: {rental.deliveryType || 'Standard'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(rental.status)}`}>
                          {
  rental.status === 'pending_confirmation'
    ? 'Awaiting Delivery Acceptance'
    : rental.status === 'confirmed'
      ? (rental.deliveryType === 'pickup'
          ? 'Customer Successfully Picked up'
          : 'Confirmed - Delivery Required'
        )
      : rental.status
}

                          </span>
                          
                          {rental.status === 'confirmed' && (
                            <div className="flex items-center space-x-1 text-xs text-orange-600">
                              <Clock className="w-3 h-3" />
                              <span className="font-semibold">72hr delivery window</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <button
                          onClick={() => window.location.href = `/chat?user=${rental.user?._id}`}
                          className="flex items-center space-x-2 px-4 py-2 bg-[#024a47] hover:bg-[#035d59] text-white rounded-lg transition-colors text-sm font-semibold"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>Chat</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Delivery Warning Banner */}
        {rentals.some(r => r.status === 'confirmed') && (
          <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-blue-900 mb-1">⏰ Delivery Reminder</h4>
                <p className="text-xs text-blue-800 leading-relaxed">
                  You have confirmed orders requiring delivery within 72 hours. 
                  Failure to deliver on time will result in order cancellation and a negative performance mark.
                  Please use chat to confirm delivery details with renters.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveRentals;