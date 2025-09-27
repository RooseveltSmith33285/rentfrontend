import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { 
  Users, 
  CreditCard, 
  Package, 
  BarChart3, 
  Bell, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  TrendingUp,
  MapPin,
  Calendar,
  AlertTriangle,
  MessageSquare,
  Settings,
  Menu,
  X,
  Play,
  Pause,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import { BASE_URL } from '../baseUrl';


const Pagination = ({ currentPage, totalPages, onPageChange, totalSubscriptions, limit }) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
      } else if (currentPage >= totalPages - 2) {
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pages.push(i);
        }
      }
    }
    
    return pages;
  };

  const startIndex = (currentPage - 1) * limit + 1;
  const endIndex = Math.min(currentPage * limit, totalSubscriptions);

  if (totalPages <= 1) return null;

  return (
    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
      <div className="flex-1 flex justify-between sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
      
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{startIndex}</span> to{' '}
            <span className="font-medium">{endIndex}</span> of{' '}
            <span className="font-medium">{totalSubscriptions}</span> results
          </p>
        </div>
        
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              title="First page"
            >
              <ChevronsLeft className="h-5 w-5" />
            </button>
            
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Previous page"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            {getPageNumbers().map(page => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                  page === currentPage
                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Next page"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            
            <button
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Last page"
            >
              <ChevronsRight className="h-5 w-5" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

const SubscriptionManagement = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [allSubscriptions, setAllSubscriptions] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [showModal, setShowModal] = useState(false);
  

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
 
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalSubscriptions: 0,
    limit: 10,
    hasNext: false,
    hasPrev: false
  });
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    getSubscriptions();
  }, [currentPage, itemsPerPage]);


  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        getSubscriptions();
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm]);

  
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      getSubscriptions();
    }
  }, [statusFilter]);

  const getSubscriptions = async () => {
    try {
      setLoading(true);
      
     
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        search: searchTerm,
        status: statusFilter
      });

    
      let response = await axios.get(`${BASE_URL}/get-orders`);
      console.log("subscriptions get", response.data);
      
      const allOrders = response.data.orders || [];
      setAllSubscriptions(allOrders);
      
     
      let filteredOrders = allOrders;
      
      
      if (searchTerm) {
        filteredOrders = filteredOrders.filter(sub => 
          (sub.subscriptionId && sub.subscriptionId.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (sub._id && sub._id.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (sub.user && sub.user.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (sub.locationName && sub.locationName.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }
      
    
      if (statusFilter !== 'all') {
        filteredOrders = filteredOrders.filter(sub => 
          sub.status && sub.status.toLowerCase() === statusFilter.toLowerCase()
        );
      }
      
    
      const totalSubscriptions = filteredOrders.length;
      const totalPages = Math.ceil(totalSubscriptions / itemsPerPage);
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedOrders = filteredOrders.slice(startIndex, endIndex);
      
      setSubscriptions(paginatedOrders);
      setPagination({
        currentPage,
        totalPages,
        totalSubscriptions,
        limit: itemsPerPage,
        hasNext: currentPage < totalPages,
        hasPrev: currentPage > 1
      });
      
      if (paginatedOrders.length > 0) {
      
      }
      
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      toast.error('Failed to fetch subscriptions', { containerId: 'subscriptionPage' });
      setSubscriptions([]);
      setAllSubscriptions([]);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalSubscriptions: 0,
        limit: itemsPerPage,
        hasNext: false,
        hasPrev: false
      });
    } finally {
      setLoading(false);
    }
  };

  const getSubscriptionStats = () => {
    
    const allSubs = allSubscriptions;
    const total = allSubs.length;
    const active = allSubs.filter(sub => sub.status === 'active').length;
    const paused = allSubs.filter(sub => sub.status === 'paused').length;
    const cancelled = allSubs.filter(sub => sub.status === 'cancelled').length;

    const monthlyRevenue = allSubs
      .filter(sub => sub.status === 'active')
      .reduce((total, sub) => {
        const itemsTotal = sub.items?.reduce((sum, item) => sum + (item.monthly_price || 0), 0) || 0;
        const comboTotal = sub.comboItem?.reduce((sum, item) => sum + (item.monthly_price || 0), 0) || 0;
        return total + itemsTotal + comboTotal;
      }, 0);
    
    return { total, active, paused, cancelled, monthlyRevenue };
  };

  const stats = getSubscriptionStats();

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateSubscriptionTotal = (subscription) => {
    const itemsTotal = subscription.items?.reduce((sum, item) => sum + (item.monthly_price || 0), 0) || 0;
    const comboTotal = subscription.comboItem?.reduce((sum, item) => sum + (item.monthly_price || 0), 0) || 0;
    return itemsTotal + comboTotal;
  };

  const handleViewSubscription = (subscription) => {
    setSelectedSubscription(subscription);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedSubscription(null);
  };

  const handleStatusChange = async (subscriptionId, newStatus) => {
    try {
      console.log(`Changing subscription ${subscriptionId} status to ${newStatus}`);
      
    
      setSubscriptions(prev => prev.map(sub => 
        sub._id === subscriptionId ? { ...sub, status: newStatus } : sub
      ));
      setAllSubscriptions(prev => prev.map(sub => 
        sub._id === subscriptionId ? { ...sub, status: newStatus } : sub
      ));

     
      if (newStatus === "active") {
        await axios.patch(`${BASE_URL}/unpauseSubscription/${subscriptionId}`);
      } else {
        await axios.patch(`${BASE_URL}/pauseSubscription/${subscriptionId}`);
      }
      
      toast.success(`Subscription ${newStatus} successfully!`, { containerId: 'subscriptionPage' });
    } catch (error) {
      console.error('Error updating subscription status:', error);
      toast.error('Failed to update subscription status', { containerId: 'subscriptionPage' });
      
  
      getSubscriptions();
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleItemsPerPageChange = (newLimit) => {
    setItemsPerPage(newLimit);
    setCurrentPage(1);
  };

  const refreshSubscriptions = () => {
    getSubscriptions();
  };

 
  if (loading && subscriptions.length === 0 && allSubscriptions.length === 0) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer containerId={"subscriptionPage"} />

      <div className="p-6">
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscription & Payment Control</h1>
          <p className="text-gray-600">Monitor active subscriptions, billing, and payment processing.</p>
          <p className="text-sm text-gray-500 mt-1">
            Total Subscriptions: {pagination.totalSubscriptions.toLocaleString()} | 
            Page {pagination.currentPage} of {pagination.totalPages}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by subscription ID, customer ID, or location..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="relative">
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
            </div>
            
            <button
              onClick={refreshSubscriptions}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh
            </button>
          </div>
        </div>

     
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Subscriptions</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-gray-100 rounded-full">
                <Package className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Subscriptions</p>
                <p className="text-3xl font-bold text-green-600">{stats.active.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Paused Subscriptions</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.paused.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Pause className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-3xl font-bold text-blue-600">${stats.monthlyRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

       
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden relative">
          {loading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                <span className="text-gray-600">Loading...</span>
              </div>
            </div>
          )}
          
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">All Subscriptions</h2>
          </div>
          
          <div className="overflow-x-auto">
            {subscriptions.length === 0 && !loading ? (
              <div className="flex flex-col justify-center items-center py-12">
                <Package className="h-12 w-12 text-gray-300 mb-4" />
                <div className="text-gray-500 text-lg font-medium">No subscriptions found</div>
                {searchTerm && (
                  <p className="text-sm text-gray-400 mt-2">Try adjusting your search terms or filters</p>
                )}
                {!searchTerm && statusFilter === 'all' && (
                  <p className="text-sm text-gray-400 mt-2">No subscriptions are available in the system</p>
                )}
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscription ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monthly Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {subscriptions.map(subscription => (
                    <tr key={subscription._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono text-gray-900">
                          {subscription.subscriptionId || subscription._id.slice(-8)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {subscription.user || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(subscription.status)}`}>
                          {subscription.status || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(subscription.deliveryDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {subscription.deliveryTime || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center">
                            <MapPin className="h-3 w-3 text-gray-400 mr-1" />
                            <span className="truncate max-w-32" title={subscription.locationName}>
                              {subscription.locationName || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          <div className="space-y-1">
                            {subscription.items?.slice(0, 2).map((item, index) => (
                              <div key={index} className="text-xs bg-blue-100 px-2 py-1 rounded">
                                {item.name} - ${item.monthly_price}/mo
                              </div>
                            ))}
                            {subscription.comboItem?.slice(0, 1).map((item, index) => (
                              <div key={`combo-${index}`} className="text-xs bg-purple-100 px-2 py-1 rounded">
                                {item.name || item.plugType} (Combo) - ${item.monthly_price || 0}/mo
                              </div>
                            ))}
                            {(subscription.items?.length > 2 || subscription.comboItem?.length > 1) && (
                              <div className="text-xs text-gray-500">
                                +{(subscription.items?.length || 0) + (subscription.comboItem?.length || 0) - 2} more
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-green-600">
                          ${calculateSubscriptionTotal(subscription).toFixed(2)}/mo
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleViewSubscription(subscription)}
                            className="text-blue-600 hover:text-blue-900 text-xs bg-blue-100 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                          >
                            <Eye className="h-3 w-3 inline mr-1" />
                            View
                          </button>
                          {subscription.status === 'active' ? (
                            <button 
                              onClick={() => handleStatusChange(subscription._id, 'paused')}
                              className="text-yellow-600 hover:text-yellow-900 text-xs bg-yellow-100 px-2 py-1 rounded hover:bg-yellow-200 transition-colors"
                            >
                              <Pause className="h-3 w-3 inline mr-1" />
                              Pause
                            </button>
                          ) : subscription.status === 'paused' ? (
                            <button 
                              onClick={() => handleStatusChange(subscription._id, 'active')}
                              className="text-green-600 hover:text-green-900 text-xs bg-green-100 px-2 py-1 rounded hover:bg-green-200 transition-colors"
                            >
                              <Play className="h-3 w-3 inline mr-1" />
                              Resume
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          
       
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
            totalSubscriptions={pagination.totalSubscriptions}
            limit={pagination.limit}
          />
        </div>

     
        <div className="mt-6 text-center text-sm text-gray-500">
          {pagination.totalSubscriptions > 0 && (
            <div>
              <p>
                Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.currentPage * pagination.limit, pagination.totalSubscriptions)} of{' '}
                {pagination.totalSubscriptions.toLocaleString()} total subscriptions
              </p>
              {pagination.hasNext && (
                <p className="mt-1">
                  <button 
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    Load next page
                  </button>
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      
      {showModal && selectedSubscription && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
           
              <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900">
                  Subscription Details
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 transition duration-150 ease-in-out"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

          
              <div className="py-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Subscription Information</h4>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-600">Subscription ID:</span>
                          <span className="text-sm text-gray-900 font-mono">
                            {selectedSubscription.subscriptionId || selectedSubscription._id.slice(-12)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-600">Customer ID:</span>
                          <span className="text-sm text-gray-900 font-mono">{selectedSubscription.user}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-600">Status:</span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedSubscription.status)}`}>
                            {selectedSubscription.status}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-600">Delivery Date:</span>
                          <span className="text-sm text-gray-900">{formatDate(selectedSubscription.deliveryDate)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-600">Delivery Time:</span>
                          <span className="text-sm text-gray-900">{selectedSubscription.deliveryTime || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-600">Created Date:</span>
                          <span className="text-sm text-gray-900">{formatDate(selectedSubscription.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Delivery Location</h4>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                        <div className="flex items-start">
                          <MapPin className="h-4 w-4 text-gray-500 mt-1 mr-2" />
                          <span className="text-sm text-gray-700">{selectedSubscription.locationName || 'Location not specified'}</span>
                        </div>
                        {selectedSubscription.location && selectedSubscription.location[0] && (
                          <div className="text-xs text-gray-500 ml-6">
                            Coordinates: {selectedSubscription.location[0].lat}, {selectedSubscription.location[0].lng}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

              
                  <div className="space-y-4">
                 

                    {selectedSubscription.items && selectedSubscription.items.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Items ({selectedSubscription.items.length})</h4>
                        <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                          <div className="space-y-3">
                            {selectedSubscription.items.map((item, index) => (
                              <div key={index} className="flex items-center space-x-3 p-2 bg-white rounded border">
                                <img
                                  src={item.photo}
                                  alt={item.name}
                                  className="h-12 w-12 object-cover rounded"
                                  onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/48x48?text=No+Image';
                                  }}
                                />
                                <div className="flex-1">
                                  <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                  <div className="text-sm text-green-600 font-semibold">${item.monthly_price || 0}/month</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

          
                    {selectedSubscription.comboItem && selectedSubscription.comboItem.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Combo Items ({selectedSubscription.comboItem.length})</h4>
                        <div className="bg-purple-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                          <div className="space-y-3">
                            {selectedSubscription.comboItem.map((item, index) => (
                              <div key={index} className="flex items-center space-x-3 p-2 bg-white rounded border border-purple-200">
                                <div className="flex-1">
                                  <div className="text-sm font-medium text-gray-900">
                                    {item.name || item.plugType || `Combo Item ${index + 1}`} <span className="text-purple-600">(Combo)</span>
                                  </div>
                                  <div className="text-sm text-purple-600 font-semibold">${item.monthly_price || 0}/month</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                 
                    {(!selectedSubscription.items || selectedSubscription.items.length === 0) && 
                     (!selectedSubscription.comboItem || selectedSubscription.comboItem.length === 0) && (
                      <div className="bg-gray-50 rounded-lg p-8 text-center">
                        <Package className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500">No items found in this subscription</p>
                      </div>
                    )}

               
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <div className="space-y-2">
                        {selectedSubscription.items && selectedSubscription.items.length > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700">Regular Items:</span>
                            <span className="text-sm font-semibold text-blue-600">
                              ${selectedSubscription.items.reduce((sum, item) => sum + (item.monthly_price || 0), 0).toFixed(2)}
                            </span>
                          </div>
                        )}
                        {selectedSubscription.comboItem && selectedSubscription.comboItem.length > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700">Combo Items:</span>
                            <span className="text-sm font-semibold text-purple-600">
                              ${selectedSubscription.comboItem.reduce((sum, item) => sum + (item.monthly_price || 0), 0).toFixed(2)}
                            </span>
                          </div>
                        )}
                        <div className="pt-2 border-t border-blue-200">
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-semibold text-gray-900">Monthly Total:</span>
                            <span className="text-xl font-bold text-blue-600">
                              ${calculateSubscriptionTotal(selectedSubscription).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

           
              <div className="flex items-center justify-end pt-4 border-t border-gray-200 space-x-3">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-400 transition duration-150 ease-in-out"
                >
                  Close
                </button>
                {selectedSubscription.status === 'active' ? (
                  <button 
                    onClick={() => {
                      handleStatusChange(selectedSubscription._id, 'paused');
                      handleCloseModal();
                    }}
                    className="px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-md hover:bg-yellow-700 transition duration-150 ease-in-out"
                  >
                    <Pause className="h-4 w-4 inline mr-1" />
                    Pause Subscription
                  </button>
                ) : selectedSubscription.status === 'paused' ? (
                  <button 
                    onClick={() => {
                      handleStatusChange(selectedSubscription._id, 'active');
                      handleCloseModal();
                    }}
                    className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition duration-150 ease-in-out"
                  >
                    <Play className="h-4 w-4 inline mr-1" />
                    Resume Subscription
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SubscriptionManagement;