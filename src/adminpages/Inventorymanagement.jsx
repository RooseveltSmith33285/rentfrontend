import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { BASE_URL } from '../baseUrl';
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
  Upload,
  Image as ImageIcon,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';


const Pagination = ({ currentPage, totalPages, onPageChange, totalProducts, limit }) => {
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
  const endIndex = Math.min(currentPage * limit, totalProducts);

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
            <span className="font-medium">{totalProducts}</span> results
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

const InventoryManagement = () => {
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

 
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [comboFilter, setComboFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  

  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
    limit: 10,
    hasNext: false,
    hasPrev: false
  });
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    getProducts();
  }, [currentPage, itemsPerPage]);

 
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        getProducts();
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm]);


  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      getProducts();
    }
  }, [statusFilter, comboFilter, priceFilter]);

  const getProducts = async () => {
    try {
      setLoading(true);
      
    
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        search: searchTerm,
        status: statusFilter,
        combo: comboFilter,
        price: priceFilter
      });

    
      let response = await axios.get(`${BASE_URL}/getProducts`);
      console.log("products get", response.data);
      
      const allProductsData = response.data.products || [];
      setAllProducts(allProductsData);
      
     
      let filteredProducts = allProductsData;
      
  
      if (searchTerm) {
        filteredProducts = filteredProducts.filter(product => 
          (product.name && product.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (product._id && product._id.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (product.key_features && product.key_features.some(feature => 
            feature.toLowerCase().includes(searchTerm.toLowerCase())
          ))
        );
      }
      
    
      if (statusFilter !== 'all') {
        filteredProducts = filteredProducts.filter(product => 
          product.stock_status && product.stock_status.toLowerCase() === statusFilter.toLowerCase()
        );
      }

 
      if (comboFilter !== 'all') {
        const isCombo = comboFilter === 'combo';
        filteredProducts = filteredProducts.filter(product => 
          Boolean(product.combo) === isCombo
        );
      }

     
      if (priceFilter !== 'all') {
        filteredProducts = filteredProducts.filter(product => {
          const price = parseFloat(product.monthly_price) || 0;
          switch (priceFilter) {
            case 'low': return price <= 50;
            case 'medium': return price > 50 && price <= 150;
            case 'high': return price > 150;
            default: return true;
          }
        });
      }
      
     
      const totalProducts = filteredProducts.length;
      const totalPages = Math.ceil(totalProducts / itemsPerPage);
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
      
      setProducts(paginatedProducts);
      setPagination({
        currentPage,
        totalPages,
        totalProducts,
        limit: itemsPerPage,
        hasNext: currentPage < totalPages,
        hasPrev: currentPage > 1
      });
      
      if (paginatedProducts.length > 0) {
       
      }
      
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products', { containerId: 'inventoryPage' });
      setProducts([]);
      setAllProducts([]);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalProducts: 0,
        limit: itemsPerPage,
        hasNext: false,
        hasPrev: false
      });
    } finally {
      setLoading(false);
    }
  };

  const getInventoryStats = () => {
   
    const allProds = allProducts;
    const total = allProds.length;
    const available = allProds.filter(product => product.stock_status === 'available').length;
    const rented = allProds.filter(product => product.stock_status === 'rented').length;
    const maintenance = allProds.filter(product => product.stock_status === 'maintenance').length;
    
    return { total, available, rented, maintenance };
  };

  const stats = getInventoryStats();

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'rented':
        return 'bg-blue-100 text-blue-800';
      case 'maintenance':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewProduct = (product) => {
    console.log('View button clicked for product:', product);
    setSelectedProduct(product);
    setShowModal(true);
    console.log('Modal should be showing now');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
  };

  const handleEditProduct = (product) => {
    console.log('Edit button clicked for product:', product);
    setEditFormData({
      _id: product._id,
      name: product.name,
      monthly_price: product.monthly_price,
      stock_status: product.stock_status,
      combo: product.combo,
      key_features: product.key_features || [],
      photo: product.photo
    });
    setImageFile(null);
    setImagePreview(product.photo || '');
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditFormData({});
    setImageFile(null);
    setImagePreview('');
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleKeyFeaturesChange = (index, value) => {
    const updatedFeatures = [...editFormData.key_features];
    updatedFeatures[index] = value;
    setEditFormData(prev => ({
      ...prev,
      key_features: updatedFeatures
    }));
  };

  const addKeyFeature = () => {
    setEditFormData(prev => ({
      ...prev,
      key_features: [...prev.key_features, '']
    }));
  };

  const removeKeyFeature = (index) => {
    const updatedFeatures = editFormData.key_features.filter((_, i) => i !== index);
    setEditFormData(prev => ({
      ...prev,
      key_features: updatedFeatures
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file', { containerId: 'inventoryPage' });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB', { containerId: 'inventoryPage' });
        return;
      }

      setImageFile(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProduct = async () => {
    try {
      const cleanedData = {
        ...editFormData,
        key_features: editFormData.key_features.filter(feature => feature.trim() !== '')
      };

      const formData = new FormData();

      Object.keys(cleanedData).forEach(key => {
        if (key !== 'photo') {
          if (Array.isArray(cleanedData[key])) {
            cleanedData[key].forEach((item, index) => {
              formData.append(`${key}[${index}]`, item);
            });
          } else if (typeof cleanedData[key] === 'object' && cleanedData[key] !== null) {
            formData.append(key, JSON.stringify(cleanedData[key]));
          } else {
            formData.append(key, cleanedData[key]);
          }
        }
      });

      if (imageFile) {
        formData.append('photo', imageFile);
      }

      console.log('Saving product with form data');
      
      const response = await axios.put(`${BASE_URL}/updateProduct/${editFormData._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.success) {
        toast.success('Product updated successfully!', { containerId: 'inventoryPage' });
        
        const updatedProduct = response.data.product || {
          ...cleanedData,
          photo: response.data.photoUrl || imagePreview || editFormData.photo
        };
        
  
        setProducts(prev => prev.map(product => 
          product._id === editFormData._id ? updatedProduct : product
        ));
        setAllProducts(prev => prev.map(product => 
          product._id === editFormData._id ? updatedProduct : product
        ));
        
        handleCloseEditModal();
      } else {
        toast.error('Failed to update product', { containerId: 'inventoryPage' });
      }
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Error updating product: ' + (error.response?.data?.message || error.message), { 
        containerId: 'inventoryPage' 
      });
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

  const refreshProducts = () => {
    getProducts();
  };

 
  if (loading && products.length === 0 && allProducts.length === 0) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Appliance & Inventory Tracking</h1>
        <p className="text-gray-600">Track assigned appliances, inventory status, and maintenance logs.</p>
        <p className="text-sm text-gray-500 mt-1">
          Total Products: {pagination.totalProducts.toLocaleString()} | 
          Page {pagination.currentPage} of {pagination.totalPages}
        </p>
      </div>

     
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, ID, or features..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="rented">Rented</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>

            <div className="relative">
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={comboFilter}
                onChange={(e) => setComboFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="combo">Combo Only</option>
                <option value="single">Single Only</option>
              </select>
            </div>

            <div className="relative">
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
              >
                <option value="all">All Prices</option>
                <option value="low">$0 - $50</option>
                <option value="medium">$51 - $150</option>
                <option value="high">$150+</option>
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
              onClick={refreshProducts}
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
      </div>

      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Total Inventory</p>
            <p className="text-3xl font-bold text-gray-900">{stats.total.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Available</p>
            <p className="text-3xl font-bold text-green-600">{stats.available.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Rented</p>
            <p className="text-3xl font-bold text-blue-600">{stats.rented.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Maintenance</p>
            <p className="text-3xl font-bold text-orange-600">{stats.maintenance.toLocaleString()}</p>
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
          <h2 className="text-lg font-semibold text-gray-900">Inventory Items</h2>
        </div>
        
        <div className="overflow-x-auto">
          {products.length === 0 && !loading ? (
            <div className="flex flex-col justify-center items-center py-12">
              <Package className="h-12 w-12 text-gray-300 mb-4" />
              <div className="text-gray-500 text-lg font-medium">No products found</div>
              {searchTerm && (
                <p className="text-sm text-gray-400 mt-2">Try adjusting your search terms or filters</p>
              )}
              {!searchTerm && statusFilter === 'all' && comboFilter === 'all' && priceFilter === 'all' && (
                <p className="text-sm text-gray-400 mt-2">No products are available in the system</p>
              )}
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Photo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monthly Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Combo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Key Features</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map(product => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 capitalize">
                        {product.name}
                      </div>
                      <div className="text-xs text-gray-500 font-mono">
                        ID: {product._id.slice(-8)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img 
                          className="h-10 w-10 rounded-lg object-cover" 
                          src={product.photo} 
                          alt={product.name}
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/40x40?text=No+Image';
                          }}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <span className="font-medium">${product.monthly_price || 0}</span>
                        <span className="text-gray-500">/month</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(product.stock_status)}`}>
                        {product.stock_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        product.combo ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {product.combo ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs">
                        {product.key_features && product.key_features.length > 0 ? (
                          <div className="space-y-1">
                            {product.key_features.slice(0, 2).map((feature, index) => (
                              <div key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                {feature}
                              </div>
                            ))}
                            {product.key_features.length > 2 && (
                              <div className="text-xs text-gray-500">
                                +{product.key_features.length - 2} more
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">No features listed</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleViewProduct(product)}
                          className="text-blue-600 hover:text-blue-900 text-xs bg-blue-100 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                          type="button"
                        >
                          <Eye className="h-3 w-3 inline mr-1" />
                          View
                        </button>
                        <button 
                          onClick={() => handleEditProduct(product)}
                          className="text-green-600 hover:text-green-900 text-xs bg-green-100 px-2 py-1 rounded hover:bg-green-200 transition-colors"
                          type="button"
                        >
                          <Edit className="h-3 w-3 inline mr-1" />
                          Edit
                        </button>
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
          totalProducts={pagination.totalProducts}
          limit={pagination.limit}
        />
      </div>

    
      <div className="mt-6 text-center text-sm text-gray-500">
        {pagination.totalProducts > 0 && (
          <div>
            <p>
              Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.currentPage * pagination.limit, pagination.totalProducts)} of{' '}
              {pagination.totalProducts.toLocaleString()} total products
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
      
      
      {showModal && selectedProduct && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            {console.log('Modal is rendering with product:', selectedProduct)}
            <div className="mt-3">
        =
              <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900 capitalize">
                  {selectedProduct.name}
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
                    <img
                      src={selectedProduct.photo}
                      alt={selectedProduct.name}
                      className="w-full h-64 object-cover rounded-lg shadow-md"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x300?text=No+Image+Available';
                      }}
                    />
                
                    <div className="flex flex-wrap gap-2">
                      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedProduct.stock_status)}`}>
                        {selectedProduct.stock_status}
                      </span>
                      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                        selectedProduct.combo ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedProduct.combo ? 'Combo Package' : 'Single Item'}
                      </span>
                    </div>
                  </div>

              
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Product Information</h4>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-600">Product ID:</span>
                          <span className="text-sm text-gray-900 font-mono">{selectedProduct._id}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-600">Monthly Price:</span>
                          <span className="text-lg font-bold text-green-600">${selectedProduct.monthly_price}/month</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-600">Status:</span>
                          <span className="text-sm text-gray-900 capitalize">{selectedProduct.stock_status}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-600">Combo Package:</span>
                          <span className="text-sm text-gray-900">{selectedProduct.combo ? 'Yes' : 'No'}</span>
                        </div>
                      </div>
                    </div>

                  
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Key Features</h4>
                      {selectedProduct.key_features && selectedProduct.key_features.length > 0 ? (
                        <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto">
                          <ul className="space-y-2">
                            {selectedProduct.key_features.map((feature, index) => (
                              <li key={index} className="flex items-start">
                                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                                <span className="text-sm text-gray-700">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm text-gray-500 italic">No key features listed for this product.</p>
                        </div>
                      )}
                    </div>

                  
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Additional Information</h4>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-600">Version:</span>
                          <span className="text-sm text-gray-900">v{selectedProduct.__v}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-600">Available for Rent:</span>
                          <span className={`text-sm font-medium ${
                            selectedProduct.stock_status === 'available' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {selectedProduct.stock_status === 'available' ? 'Yes' : 'No'}
                          </span>
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
                <button 
                  onClick={() => {
                    handleCloseModal();
                    handleEditProduct(selectedProduct);
                  }}
                  className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition duration-150 ease-in-out"
                >
                  <Edit className="h-4 w-4 inline mr-1" />
                  Edit Product
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
     
      {showEditModal && editFormData && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white max-h-screen overflow-y-auto">
            <div className="mt-3">
             
              <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900">
                  Edit Product
                </h3>
                <button
                  onClick={handleCloseEditModal}
                  className="text-gray-400 hover:text-gray-600 transition duration-150 ease-in-out"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

           
              <div className="py-6">
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                  
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Product Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={editFormData.name || ''}
                          onChange={handleFormChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter product name"
                        />
                      </div>

                    
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Monthly Price ($)
                        </label>
                        <input
                          type="number"
                          name="monthly_price"
                          value={editFormData.monthly_price || ''}
                          onChange={handleFormChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter monthly price"
                          min="0"
                          step="0.01"
                        />
                      </div>

                  
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Stock Status
                        </label>
                        <select
                          name="stock_status"
                          value={editFormData.stock_status || ''}
                          onChange={handleFormChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="available">Available</option>
                          <option value="rented">Rented</option>
                          <option value="maintenance">Maintenance</option>
                          <option value="discontinued">Discontinued</option>
                        </select>
                      </div>

                    
                      <div>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            name="combo"
                            checked={editFormData.combo || false}
                            onChange={handleFormChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="text-sm font-medium text-gray-700">
                            Combo Package
                          </span>
                        </label>
                      </div>
                    </div>

                 
                    <div className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Product Image
                        </label>
                        <div className="flex items-center justify-center w-full">
                          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition duration-150 ease-in-out">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <Upload className="w-8 h-8 mb-3 text-gray-400" />
                              <p className="mb-2 text-sm text-gray-500">
                                <span className="font-semibold">Click to upload</span> or drag and drop
                              </p>
                              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                            </div>
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/*"
                              onChange={handleImageUpload}
                            />
                          </label>
                        </div>
                      </div>

                    
                      {imagePreview && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Image Preview
                          </label>
                          <div className="relative">
                            <img
                              src={imagePreview}
                              alt="Product preview"
                              className="w-full h-32 object-cover rounded-md border border-gray-300"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setImageFile(null);
                                setImagePreview(editFormData.photo || '');
                              }}
                              className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition duration-150 ease-in-out"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {imageFile ? `Selected: ${imageFile.name}` : 'Current image'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

              
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Key Features
                      </label>
                      <button
                        type="button"
                        onClick={addKeyFeature}
                        className="text-sm bg-blue-100 text-blue-600 px-3 py-1 rounded-md hover:bg-blue-200 transition duration-150 ease-in-out"
                      >
                        + Add Feature
                      </button>
                    </div>
                    
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {editFormData.key_features && editFormData.key_features.length > 0 ? (
                        editFormData.key_features.map((feature, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={feature}
                              onChange={(e) => handleKeyFeaturesChange(index, e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder={`Feature ${index + 1}`}
                            />
                            <button
                              type="button"
                              onClick={() => removeKeyFeature(index)}
                              className="text-red-600 hover:text-red-800 p-1"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 italic">No features added yet. Click "Add Feature" to start.</p>
                      )}
                    </div>
                  </div>
                </form>
              </div>

           
              <div className="flex items-center justify-end pt-4 border-t border-gray-200 space-x-3">
                <button
                  onClick={handleCloseEditModal}
                  className="px-4 py-2 bg-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-400 transition duration-150 ease-in-out"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProduct}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition duration-150 ease-in-out"
                >
                  <CheckCircle className="h-4 w-4 inline mr-1" />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <ToastContainer containerId={"inventoryPage"} />
    </div>
  );
};

export default InventoryManagement;