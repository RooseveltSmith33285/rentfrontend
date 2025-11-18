import React, { useState, useEffect } from "react";
import { Package, Eye, MessageSquare, DollarSign, Home, LogOut, Clock, CheckCircle, XCircle, FileText, CreditCard, MessageCircle, User, CrossIcon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import { BASE_URL } from "../baseUrl";

function RenterDashboard() {
  const navigate = useNavigate();
  
  // State management
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [processingReject, setProcessingReject] = useState(false);

  // Fetch dashboard data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${BASE_URL}/getRenterDashboardData`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log(response.data);
      if (response.data.success) {
        setDashboardData(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.response?.data?.error || 'Failed to load dashboard data');
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href='/';
  };

  const handleNavigation = (path) => {
    navigate(path);
  };




  const downloadReceipt = (receipt) => {
    // Prepare CSV data
    const csvData = [
      ['Receipt Details', ''],
      ['Receipt Number', receipt.receiptNumber],
      ['Date', new Date(receipt.date).toLocaleDateString()],
      ['', ''],
      ['Item Details', ''],
      ['Appliance', receipt.applianceName],
      ['', ''],
      ['Payment Details', ''],
      ['Amount', `$${receipt.amount.toFixed(2)}`],
      ['Status', receipt.status],
      ['', ''],
      ['Generated on', new Date().toLocaleString()]
    ];
  
    // Convert to CSV string
    const csvContent = csvData.map(row => row.join(',')).join('\n');
  
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `receipt_${receipt.receiptNumber}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

 // Calculate stats from actual data arrays
const activeRentalsCount = dashboardData?.activeRentals?.length || 0;
const pendingApprovalsCount = dashboardData?.pendingApprovals?.length || 0;
const completedOrdersCount = dashboardData?.completedOrders?.length || 0;

const stats = [
  { 
    label: 'Active Rentals', 
    value: activeRentalsCount, // Use calculated count from array
    icon: Package, 
    color: 'bg-blue-500' 
  },
  { 
    label: 'Pending Approvals', 
    value: pendingApprovalsCount, // Use calculated count from array
    icon: Clock, 
    color: 'bg-yellow-500' 
  },
  { 
    label: 'Credits avaiable', 
    value: `$${dashboardData?.user?.credit?.toLocaleString() || '0'}`, 
    icon: DollarSign, 
    color: 'bg-green-500' 
  },
  { 
    label: 'Total Spent', 
    value: `$${dashboardData?.stats?.totalSpent?.toLocaleString() || '0'}`, 
    icon: DollarSign, 
    color: 'bg-green-500' 
  },
  { 
    label: 'Completed Rentals', 
    value: completedOrdersCount, // Use calculated count from array
    icon: CheckCircle, 
    color: 'bg-purple-500' 
  }
];

  const activeRentals = dashboardData?.activeRentals?.map(rental => ({
    id: rental._id,
    applianceName: rental.listing?.title || 'Unknown Appliance',
    vendorName: rental.vendor?.businessName || rental.vendor?.name || 'Unknown Vendor',
    monthlyRate: rental.monthlyRent || 0,
    startDate: rental.rentalStartDate,
    endDate: rental.rentalEndDate,
    status: rental.status,
    image: rental.listing?.images?.[0]?.url || rental.productImages?.front
  })) || [];

  const pendingApprovals = dashboardData?.pendingApprovals?.map(order => ({
    id: order._id,
    applianceName: order.listing?.title || 'Unknown Appliance',
    vendorName: order.vendor?.businessName || order.vendor?.name || 'Unknown Vendor',
    requestedDate: order.createdAt,
    status: order.status,
    image: order.listing?.images?.[0]?.url || order.productImages?.front
  })) || [];

  
  const completedOrders = dashboardData?.completedOrders?.map(order => ({
    id: order._id,
    applianceName: order.listing?.title || 'Unknown Appliance',
    vendorName: order.vendor?.businessName || order.vendor?.name || 'Unknown Vendor',
    monthlyRate: order.monthlyRent || 0,
    completedDate: order.updatedAt,
    orderNumber: order.orderNumber,
    status: order.status,
    image: order.listing?.images?.[0]?.url || order.productImages?.front
  })) || [];



  const recentReceipts = dashboardData?.recentReceipts?.map(receipt => ({
    id: receipt._id,
    applianceName: receipt.rental?.listing?.title || 'Unknown Appliance',
    amount: receipt.amount || 0,
    date: receipt.paidDate || receipt.rental?.createdAt,
    status: receipt.status,
    receiptNumber: receipt.receiptNumber || receipt.rental?.orderNumber
  })) || [];




  const handleRejectDelivery = (orderId) => {
    setSelectedOrderId(orderId);
    setShowRejectModal(true);
  };

  const confirmRejectDelivery = async () => {
    if (!rejectReason) {
      alert('Please select a reason for rejection');
      return;
    }

    try {
      setProcessingReject(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `${BASE_URL}/rejectDeliveryAndInstallation`,
        { 
          orderId: selectedOrderId,
          reason: rejectReason 
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
  
      if (response.data.success) {
        alert('✅ Delivery & Installation rejected successfully');
        setShowRejectModal(false);
        setRejectReason('');
        setSelectedOrderId(null);
        fetchDashboardData(); // Refresh the dashboard
      }
    } catch (err) {
      console.error('Error rejecting delivery:', err);
      alert('❌ ' + (err.response?.data?.error || 'Failed to reject delivery'));
    } finally {
      setProcessingReject(false);
    }
  };


  const handleApproveDelivery = async (orderId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `${BASE_URL}/releasePaymentToVendor`,
        {orderId},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
  
      if (response.data.success) {
        alert('✅ Delivery & Installation approved successfully!');
        fetchDashboardData(); // Refresh the dashboard
      }
    } catch (err) {
      console.error('Error approving delivery:', err);
      alert('❌ ' + (err.response?.data?.error || 'Failed to approve delivery'));
    } finally {
      setLoading(false);
    }
  };

  const RejectDeliveryModal = () => {
    const rejectReasons = [
      'Unit Not Delivered',
      'Incorrect Unit Delivered',
      'Unit Damaged During Delivery',
      'Installation Not Completed',
      'Installation Done Incorrectly',
      'Unit Not Working Properly',
      'Safety Concerns with Installation',
      'Delivery Time Not Honored',
      'Missing Parts or Accessories',
      'Poor Condition Upon Arrival',
      'Unit Does Not Match Description',
      'Professional Installation Required but Not Provided'
    ];

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Reject Delivery & Installation</h2>
              <button 
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                  setSelectedOrderId(null);
                }}
                className="text-gray-500 hover:text-gray-700"
                disabled={processingReject}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    Please select a reason for rejecting this delivery and installation. This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>

            <p className="text-gray-600 mb-4 font-semibold">Please select a reason for rejection:</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6 max-h-96 overflow-y-auto pr-2">
              {rejectReasons.map((reason) => (
                <label
                  key={reason}
                  className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    rejectReason === reason
                      ? 'border-red-600 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  } ${processingReject ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <input
                    type="radio"
                    name="rejectReason"
                    value={reason}
                    checked={rejectReason === reason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    disabled={processingReject}
                    className="mt-1 mr-3 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-900 font-medium">{reason}</span>
                </label>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                  setSelectedOrderId(null);
                }}
                disabled={processingReject}
                className="flex-1 py-3 px-4 rounded-lg font-semibold bg-gray-200 hover:bg-gray-300 text-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={confirmRejectDelivery}
                disabled={!rejectReason || processingReject}
                className="flex-1 py-3 px-4 rounded-lg font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {processingReject ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  'Confirm Rejection'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
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
                  Welcome, {dashboardData?.renter?.name || 'Renter'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
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
        {/* Stats Cards */}
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

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => handleNavigation('/appliance')}
            className="bg-[#024a47] hover:bg-[#035d59] text-white rounded-lg p-6 flex items-center space-x-4 transition-all shadow-md"
          >
            <Package className="w-8 h-8" />
            <div className="text-left">
              <h3 className="font-semibold text-lg">Browse Appliances</h3>
              <p className="text-sm opacity-90">Find rentals</p>
            </div>
          </button>

       

          <button
            onClick={() => handleNavigation('/chat')}
            className="bg-white hover:bg-gray-50 text-[#024a47] border-2 border-[#024a47] rounded-lg p-6 flex items-center space-x-4 transition-all shadow-md relative"
          >
            <MessageCircle className="w-8 h-8" />
            <div className="text-left">
              <h3 className="font-semibold text-lg">Messages</h3>
              <p className="text-sm opacity-75">Chat with vendors</p>
            </div>
            {dashboardData?.unreadMessages > 0 && (
              <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                {dashboardData.unreadMessages}
              </span>
            )}
          </button>
        </div>

        {/* Active Rentals Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-[#024a47]">Active Rentals</h2>
           
          </div>
          
          {activeRentals.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No active rentals. Browse appliances to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeRentals.map((rental) => (
                <div key={rental.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                      {rental.image ? (
                        <img src={rental.image} alt={rental.applianceName} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-6 h-6 text-gray-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#024a47]">{rental.applianceName}</h3>
                      <p className="text-sm text-gray-600">{rental.vendorName}</p>
                      <p className="text-xs text-gray-500">
  ${rental.monthlyRate}/month • 
  {rental.startDate 
  ? new Date(rental.startDate).toLocaleDateString() 
  : 'Start date not set'
} 
- 
{rental.startDate 
  ? new Date(new Date(rental.startDate).setMonth(new Date(rental.startDate).getMonth() + 5)).toLocaleDateString() 
  : 'End date not set'
}

</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${
  rental.status === 'active' || rental.status === 'delivered' ? 'bg-green-100 text-green-800' :
  rental.status === 'pending_confirmation' || rental.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
  rental.status === 'in_transit' || rental.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
  rental.status === 'cancelled' || rental.status === 'refunded' ? 'bg-red-100 text-red-800' :
  'bg-gray-100 text-gray-800'
}`}>
  {rental.status?.replace('_', ' ') || 'Unknown'}
</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

{/* Completed Orders Section */}
<div className="bg-white rounded-lg shadow-md p-6 mb-6">
  <div className="flex justify-between items-center mb-6">
    <h2 className="text-2xl font-bold text-[#024a47]">Completed Orders</h2>
  </div>
  
  {completedOrders.length === 0 ? (
    <div className="text-center py-8 text-gray-500">
      <CheckCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
      <p>No completed orders yet</p>
    </div>
  ) : (
    <div className="space-y-4">
      {completedOrders.map((order) => (
        <div key={order.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors gap-4">
          <div className="flex items-center space-x-4 flex-1">
            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
              {order.image ? (
                <img src={order.image} alt={order.applianceName} className="w-full h-full object-cover" />
              ) : (
                <Package className="w-6 h-6 text-gray-600" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-[#024a47]">{order.applianceName}</h3>
              <p className="text-sm text-gray-600">{order.vendorName}</p>
              <p className="text-xs text-gray-500">
                Order #{order.orderNumber} • ${order.monthlyRate}/month
              </p>
              <p className="text-xs text-gray-500">
                Completed: {new Date(order.completedDate).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold capitalize flex items-center space-x-1">
              <CheckCircle className="w-4 h-4" />
              <span>Confirmed & Delivered</span>
            </span>
          </div>
        </div>
      ))}
    </div>
  )}
</div>
        {/* Pending Approvals Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-[#024a47]">Pending Approvals</h2>
          </div>
          
          {pendingApprovals.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No pending approvals</p>
            </div>
          ) : (
            <div className="space-y-4">
            {pendingApprovals.map((request) => (
              <div key={request.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors gap-4">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                    {request.image ? (
                      <img src={request.image} alt={request.applianceName} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-6 h-6 text-gray-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#024a47]">{request.applianceName}</h3>
                    <p className="text-sm text-gray-600">{request.vendorName}</p>
                    <p className="text-xs text-gray-500">
                      Requested: {new Date(request.requestedDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 w-full sm:w-auto">
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold capitalize">
                    {request.status}
                  </span>
                  <button
                    onClick={() => handleApproveDelivery(request.id)}
                    disabled={loading || processingReject}
                    className="flex items-center space-x-2 px-4 py-2 bg-[#024a47] hover:bg-[#035d59] text-white rounded-lg transition-colors font-semibold text-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Approve</span>
                  </button>

                  <button
                    onClick={() => handleRejectDelivery(request.id)}
                    disabled={loading || processingReject}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-semibold text-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>

        {/* Recent Receipts Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-20 lg:mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-[#024a47]">Recent Receipts</h2>
         
          </div>
          
          {recentReceipts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No receipts yet</p>
            </div>
          ) : (
            <div className="space-y-4">
            {recentReceipts.map((receipt) => (
              <div key={receipt.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-[#024a47] rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#024a47]">{receipt.applianceName}</h3>
                    <p className="text-sm text-gray-600">Receipt #{receipt.receiptNumber}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(receipt.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <p className="font-bold text-[#024a47]">${receipt.amount.toFixed(2)}</p>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    receipt.status === 'paid' ? 'bg-green-100 text-green-800' : 
                    'bg-red-100 text-red-800'
                  }`}>
                    {receipt.status}
                  </span>
                  <button
                    onClick={() => downloadReceipt(receipt)}
                    className="p-2 bg-[#024a47] hover:bg-[#035d59] text-white rounded-lg transition-colors"
                    title="Download Receipt"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>

        {/* Mobile Bottom Navigation */}
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
              onClick={() => handleNavigation('/appliance')} 
              className="flex flex-col items-center text-gray-600"
            >
              <Package className="w-6 h-6" />
              <span className="text-xs mt-1">Browse</span>
            </button>
            <button 
              onClick={() => handleNavigation('/userchat')} 
              className="flex flex-col items-center text-gray-600 relative"
            >
              <MessageCircle className="w-6 h-6" />
              <span className="text-xs mt-1">Chat</span>
              {dashboardData?.unreadMessages > 0 && (
                <span className="absolute -top-1 right-2 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {dashboardData.unreadMessages}
                </span>
              )}
            </button>
            <button 
              onClick={() => handleNavigation('/profile')} 
              className="flex flex-col items-center text-gray-600"
            >
              <User className="w-6 h-6" />
              <span className="text-xs mt-1">Profile</span>
            </button>
          </div>
        </div>
      </div>
      {showRejectModal && <RejectDeliveryModal />}
    </div>
  );
}

export default RenterDashboard;