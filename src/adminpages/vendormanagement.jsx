import React, { useEffect, useState } from 'react';
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
  User,
  Mail,
  Phone,
  Shield,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  RefreshCw,
  Store,
  Briefcase
} from 'lucide-react';

import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import { BASE_URL } from '../baseUrl';


const VendorEditModal = ({ vendor, isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      mobile: '',
      businessName: ''
    });
    
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
  
    useEffect(() => {
      if (vendor && isOpen) {
        setFormData({
          name: vendor.name || '',
          email: vendor.email || '',
          mobile: vendor.mobile || '',
          businessName: vendor.businessName || ''
        });
        setErrors({});
      }
    }, [vendor, isOpen]);
  
    if (!isOpen || !vendor) return null;
  
    const validateForm = () => {
      const newErrors = {};
      
      if (!formData.name.trim()) {
        newErrors.name = 'Name is required';
      }
      
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email';
      }
      
      if (!formData.mobile.trim()) {
        newErrors.mobile = 'Mobile number is required';
      } else if (!/^[+]?[\d\s-()]+$/.test(formData.mobile)) {
        newErrors.mobile = 'Please enter a valid phone number';
      }
      
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };
  
    const handleInputChange = (e) => {
      const { name, value } = e.target;
      
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    
      if (errors[name]) {
        setErrors(prev => ({
          ...prev,
          [name]: ''
        }));
      }
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      
      if (!validateForm()) {
        return;
      }
      
      setLoading(true);
      try {
        await axios.put(`${BASE_URL}/update-vendor/${vendor._id}`, formData);
        toast.success('Vendor updated successfully!', { containerId: 'vendorManagement' });
        onSave(formData);
        onClose();
      } catch (error) {
        console.error('Error updating vendor:', error);
        toast.error(error.response?.data?.message || 'Failed to update vendor', { containerId: 'vendorManagement' });
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Edit Vendor</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={loading}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
  
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter full name"
                disabled={loading}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>
  
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter email address"
                disabled={loading}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>
  
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.mobile ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter mobile number"
                disabled={loading}
              />
              {errors.mobile && (
                <p className="mt-1 text-sm text-red-600">{errors.mobile}</p>
              )}
            </div>
  
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Name
              </label>
              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter business name"
                disabled={loading}
              />
            </div>
  
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const VendorDetailModal = ({ vendor, isOpen, onClose, onEdit }) => {
    if (!isOpen || !vendor) return null;
  
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleString();
    };
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Vendor Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
  
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Full Name</label>
                  <p className="text-gray-900 font-medium">{vendor.name || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Vendor ID</label>
                  <p className="text-gray-900 font-mono text-sm">{vendor._id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Email Address</label>
                  <p className="text-gray-900">{vendor.email || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Mobile Number</label>
                  <p className="text-gray-900">{vendor.mobile || 'N/A'}</p>
                </div>
              </div>
            </div>
  
            {/* Business Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Store className="h-5 w-5 mr-2" />
                Business Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Business Name</label>
                  <p className="text-gray-900">{vendor.businessName || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Verification Status</label>
                  <div className="mt-1">
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                      vendor.isVerified 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {vendor.isVerified ? 'Verified' : 'Not Verified'}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Stripe Connected</label>
                  <div className="mt-1">
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                      vendor.stripe_connect_status 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {vendor.stripe_connect_status ? 'Connected' : 'Not Connected'}
                    </span>
                  </div>
                </div>
                {vendor.stripe_account_id && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Stripe Account ID</label>
                    <p className="text-gray-900 font-mono text-xs">{vendor.stripe_account_id}</p>
                  </div>
                )}
              </div>
            </div>
  
            {/* Subscription Information */}
            {vendor.subscription && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Subscription Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.keys(vendor.subscription).length > 0 ? (
                    Object.entries(vendor.subscription).map(([key, value]) => (
                      <div key={key}>
                        <label className="text-sm font-medium text-gray-600 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </label>
                        <p className="text-gray-900">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 col-span-2">No subscription information available</p>
                  )}
                </div>
              </div>
            )}
  
            {/* Performance Stats */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Performance Stats
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Total Listings</label>
                  <p className="text-2xl font-bold text-gray-900">{vendor.stats?.totalListings || 0}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Active Listings</label>
                  <p className="text-2xl font-bold text-green-600">{vendor.stats?.activeListings || 0}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Boost Credits</label>
                  <p className="text-2xl font-bold text-orange-600">{vendor.boostCredits || 0}</p>
                </div>
              </div>
            </div>
  
            {/* Account Timeline */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Account Timeline
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Account Created</label>
                  <p className="text-gray-900">{formatDate(vendor.createdAt)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Last Updated</label>
                  <p className="text-gray-900">{formatDate(vendor.updatedAt)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Account Status</label>
                  <div className="mt-1">
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                      vendor.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {vendor.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
  
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
              <button 
                onClick={() => {
                  onClose();
                  onEdit(vendor);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Vendor
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };


const Pagination = ({ currentPage, totalPages, onPageChange, totalVendors, limit }) => {
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
  const endIndex = Math.min(currentPage * limit, totalVendors);

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
            <span className="font-medium">{totalVendors}</span> results
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

const VendorManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalVendors: 0,
    limit: 10,
    hasNext: false,
    hasPrev: false
  });
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    getVendors(currentPage, itemsPerPage, searchTerm, statusFilter);
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1); 
      } else {
        getVendors(1, itemsPerPage, searchTerm, statusFilter);
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm]);

  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1); 
    } else {
      getVendors(1, itemsPerPage, searchTerm, statusFilter);
    }
  }, [statusFilter]);

  const getVendors = async (page = 1, limit = 10, search = '', status = 'all') => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search: search,
        status: status
      });
      
      const response = await axios.get(`${BASE_URL}/getVendors?${queryParams}`);
      console.log('API Response:', response.data);
      
      setVendors(response.data.vendors || []);
      setPagination(response.data.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalVendors: 0,
        limit: 10,
        hasNext: false,
        hasPrev: false
      });
    } catch (error) {
      console.error('Error fetching vendors:', error);
      toast.error('Failed to load vendors', { containerId: 'vendorManagement' });
      setVendors([]);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalVendors: 0,
        limit: 10,
        hasNext: false,
        hasPrev: false
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const handleDeleteVendor = async (vendorId) => {
    if (window.confirm('Are you sure you want to delete this vendor? This action cannot be undone.')) {
      try {
        await axios.delete(`${BASE_URL}/deleteVendor/${vendorId}`);
        toast.success('Vendor deleted successfully!', { containerId: 'vendorManagement' });
        getVendors(currentPage, itemsPerPage, searchTerm, statusFilter);
      } catch (error) {
        console.error('Error deleting vendor:', error);
        toast.error('Failed to delete vendor', { containerId: 'vendorManagement' });
      }
    }
  };

  const handleViewVendor = (vendor) => {
    setSelectedVendor(vendor);
    setIsModalOpen(true);
  };

  const handleEditVendor = (vendor) => {
    setSelectedVendor(vendor);
    setIsEditModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedVendor(null);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedVendor(null);
  };

  const handleSaveVendor = (updatedData) => {
    setVendors(prevVendors => 
      prevVendors.map(vendor => 
        vendor._id === selectedVendor._id 
          ? { ...vendor, ...updatedData }
          : vendor
      )
    );
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

  const refreshVendors = () => {
    getVendors(currentPage, itemsPerPage, searchTerm, statusFilter);
  };

  if (loading && vendors.length === 0) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  const UpdateVendorStatus = async (vendor, status) => {
    try {
      setLoading(true);
      const response = await axios.put(`${BASE_URL}/update-vendor/${vendor._id}`, { status });
      
    
    
        setVendors(prevVendors => 
          prevVendors.map(v => 
            v._id === vendor._id 
              ? { ...v, status: status }
              : v
          )
        );
        
        toast.success(
          `Vendor ${status === 'active' ? 'activated' : 'deactivated'} successfully!`, 
          { containerId: 'vendorManagement' }
        );
      
    } catch (e) {
      console.error('Error updating vendor status:', e);
      toast.error(
        e.response?.data?.message || 'Failed to update vendor status', 
        { containerId: 'vendorManagement' }
      );
    } finally {
      setLoading(false);
    }
  }
  return (
    <>
      <ToastContainer containerId={"vendorManagement"} />
      <VendorDetailModal 
        vendor={selectedVendor} 
        isOpen={isModalOpen} 
        onClose={closeModal}
        onEdit={handleEditVendor}
      />
      <VendorEditModal 
        vendor={selectedVendor} 
        isOpen={isEditModalOpen} 
        onClose={closeEditModal}
        onSave={handleSaveVendor}
      />

      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Vendor Management</h1>
          <p className="text-gray-600">Manage vendor accounts, subscriptions, and performance.</p>
          <p className="text-sm text-gray-500 mt-1">
            Total Vendors: {pagination.totalVendors.toLocaleString()} | 
            Page {pagination.currentPage} of {pagination.totalPages}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
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
                <option value="suspended">Suspended</option>
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
              onClick={refreshVendors}
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

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden relative">
          {loading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                <span className="text-gray-600">Loading...</span>
              </div>
            </div>
          )}
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business</th>
                 
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stats</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {vendors.length > 0 ? (
                  vendors.map(vendor => (
                    <tr key={vendor._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{vendor.name || 'No Name'}</div>
                          <div className="text-sm text-gray-500">{vendor.email || 'No Email'}</div>
                          {vendor.mobile && (
                            <div className="text-sm text-gray-500">{vendor.mobile}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{vendor.businessName || 'N/A'}</div>
                        <div className="flex items-center mt-1">
                          {vendor.isVerified ? (
                            <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                              <Clock className="h-3 w-3 mr-1" />
                              Unverified
                            </span>
                          )}
                        </div>
                      </td>
                     
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs text-gray-900">
                          <div className="flex items-center">
                            <Package className="h-3 w-3 mr-1 text-gray-400" />
                            {vendor?.status}
                          </div>
                          
                          
                        </div>
                      </td>


                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs text-gray-900">
                          <div className="flex items-center">
                            <Package className="h-3 w-3 mr-1 text-gray-400" />
                            {vendor.stats?.totalListings || 0} listings
                          </div>
                          
                          
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(vendor.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                        <button
  className={`p-1 rounded text-white font-medium 
    ${vendor?.status === 'active' 
      ? 'bg-red-500 hover:bg-red-600'   
      : 'bg-green-500 hover:bg-green-600' 
    }`}
  title="View Details"
  onClick={() => UpdateVendorStatus(vendor,vendor?.status === 'active' ? 'inactive' : 'active')}
>
  {vendor?.status === 'active' ? 'Deactivate' : 'Activate'}
</button>

                          <button 
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                            title="View Details"
                            onClick={() => handleViewVendor(vendor)}
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                            title="Edit Vendor"
                            onClick={() => handleEditVendor(vendor)}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                            title="Delete Vendor"
                            onClick={() => handleDeleteVendor(vendor._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <Store className="h-12 w-12 text-gray-300 mb-2" />
                        <p className="text-lg font-medium">No vendors found</p>
                        {searchTerm && (
                          <p className="text-sm">Try adjusting your search terms or filters</p>
                        )}
                        {!searchTerm && statusFilter === 'all' && (
                          <p className="text-sm">No vendors are available in the system</p>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {pagination.totalPages > 1 && (
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
              totalVendors={pagination.totalVendors}
              limit={pagination.limit}
            />
          )}
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <Store className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Vendors</p>
                <p className="text-2xl font-semibold text-gray-900">{pagination.totalVendors.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Vendors</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {vendors.filter(v => v.isActive).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Verified Vendors</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {vendors.filter(v => v.isVerified).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <CreditCard className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Stripe Connected</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {vendors.filter(v => v.stripe_connect_status).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {pagination.totalVendors > 0 && (
          <div className="mt-4 text-center text-sm text-gray-500">
            <p>
              Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.currentPage * pagination.limit, pagination.totalVendors)} of{' '}
              {pagination.totalVendors.toLocaleString()} total vendors
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
    </>
  );
};

export default VendorManagement;