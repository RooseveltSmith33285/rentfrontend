import React, { useEffect, useState } from 'react';
import { BASE_URL } from '../baseUrl';
import axios from 'axios'
import { 
  Package, 
  Search, 
  Filter, 
  Eye,
  Pause,
  Play,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  MapPin,
  Calendar,
  X
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';

// Mock data for demonstration
const mockRentals = [
  {
    id: 'RNT-001',
    customer: { name: 'John Doe', email: 'john@example.com', phone: '+1 234 567 8900' },
    status: 'active',
    items: [
      { name: 'Electric Scooter', photo: 'https://images.unsplash.com/photo-1559311040-4c0d77b4c810?w=100', monthlyPrice: 45 },
      { name: 'Safety Helmet', photo: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=100', monthlyPrice: 15 }
    ],
    deliveryDate: '2024-01-15',
    deliveryTime: '10:00 AM',
    location: 'Downtown, Main Street 123',
    createdAt: '2024-01-10',
    totalAmount: 60
  },
  {
    id: 'RNT-002',
    customer: { name: 'Jane Smith', email: 'jane@example.com', phone: '+1 234 567 8901' },
    status: 'active',
    items: [
      { name: 'Mountain Bike', photo: 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=100', monthlyPrice: 80 }
    ],
    deliveryDate: '2024-01-20',
    deliveryTime: '2:00 PM',
    location: 'Uptown, Park Avenue 456',
    createdAt: '2024-01-12',
    totalAmount: 80
  },
  {
    id: 'RNT-003',
    customer: { name: 'Mike Johnson', email: 'mike@example.com', phone: '+1 234 567 8902' },
    status: 'paused',
    items: [
      { name: 'Electric Skateboard', photo: 'https://images.unsplash.com/photo-1547447134-cd3f5c716030?w=100', monthlyPrice: 55 }
    ],
    deliveryDate: '2024-01-18',
    deliveryTime: '11:30 AM',
    location: 'West End, Sunset Boulevard 789',
    createdAt: '2024-01-08',
    totalAmount: 55
  },
  {
    id: 'RNT-004',
    customer: { name: 'Sarah Wilson', email: 'sarah@example.com', phone: '+1 234 567 8903' },
    status: 'active',
    items: [
      { name: 'Electric Bike', photo: 'https://images.unsplash.com/photo-1571333250630-f0230c320b6d?w=100', monthlyPrice: 95 },
      { name: 'Bike Lock', photo: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', monthlyPrice: 10 }
    ],
    deliveryDate: '2024-01-22',
    deliveryTime: '9:00 AM',
    location: 'East Side, River Road 321',
    createdAt: '2024-01-14',
    totalAmount: 105
  },
  {
    id: 'RNT-005',
    customer: { name: 'David Brown', email: 'david@example.com', phone: '+1 234 567 8904' },
    status: 'paused',
    items: [
      { name: 'Hoverboard', photo: 'https://images.unsplash.com/photo-1607453998774-d533f65dac99?w=100', monthlyPrice: 40 }
    ],
    deliveryDate: '2024-01-16',
    deliveryTime: '3:30 PM',
    location: 'North District, Highland Avenue 654',
    createdAt: '2024-01-09',
    totalAmount: 40
  }
];

const Pagination = ({ currentPage, totalPages, onPageChange, totalItems, limit }) => {
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
  const endIndex = Math.min(currentPage * limit, totalItems);

  if (totalPages <= 1) return null;


  useEffect(()=>{

  },[])

const getRentals=async()=>{
    try{
let response;
    }catch(e){

    }
}


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
            <span className="font-medium">{totalItems}</span> results
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

const RentalsManagement = () => {
    const [rentals, setRentals] = useState([]);
    const [allRentals, setAllRentals] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [selectedRental, setSelectedRental] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
      currentPage: 1,
      totalPages: 1,
      totalOrders: 0,
      limit: 10,
      hasNext: false,
      hasPrev: false
    });



    useEffect(() => {
        getRentals();
      }, [currentPage, itemsPerPage]);
    
      useEffect(() => {
        const delayedSearch = setTimeout(() => {
          if (currentPage !== 1) {
            setCurrentPage(1);
          } else {
            getRentals();
          }
        }, 500);
        return () => clearTimeout(delayedSearch);
      }, [searchTerm]);
    
      useEffect(() => {
        if (currentPage !== 1) {
          setCurrentPage(1);
        } else {
          getRentals();
        }
      }, [statusFilter]);
    
      const getRentals = async () => {
        try {
          setLoading(true);
          
          const queryParams = new URLSearchParams({
            page: currentPage.toString(),
            limit: itemsPerPage.toString(),
            search: searchTerm,
            status: statusFilter !== 'all' ? statusFilter : ''
          });
          
          const response = await axios.get(`${BASE_URL}/get-rentals?${queryParams}`);
          console.log("rentals get", response.data);
          
          const allOrders = response.data.orders || [];
          setAllRentals(allOrders);
          setRentals(allOrders);
          
          setPagination({
            currentPage: response.data.pagination.currentPage,
            totalPages: response.data.pagination.totalPages,
            totalOrders: response.data.pagination.totalOrders,
            limit: response.data.pagination.limit,
            hasNext: response.data.pagination.hasNext,
            hasPrev: response.data.pagination.hasPrev
          });
          
        } catch (error) {
          console.error('Error fetching rentals:', error);
          setRentals([]);
          setAllRentals([]);
          setPagination({
            currentPage: 1,
            totalPages: 1,
            totalOrders: 0,
            limit: itemsPerPage,
            hasNext: false,
            hasPrev: false
          });
        } finally {
          setLoading(false);
        }
      };
    
     

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
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

  const filteredRentals = rentals.filter(rental => {
    const matchesSearch = 
      (rental._id?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (rental.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (rental.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (rental.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (rental.deliveryAddress?.street?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (rental.deliveryAddress?.city?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    
    const matchesStatus = statusFilter === 'all' || rental.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  const stats = {
    total: allRentals.length,
    active: allRentals.filter(r => r.status === 'active' || r.status === 'confirmed').length,
    paused: allRentals.filter(r => r.status === 'paused').length,
    monthlyRevenue: allRentals
      .filter(r => r.status === 'active' || r.status === 'confirmed')
      .reduce((sum, r) => sum + ((r.totalAmount || r.monthlyRent || 0) * 0.15), 0)
  };
  const totalPages = Math.ceil(filteredRentals.length / itemsPerPage);
  const paginatedRentals = filteredRentals.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleStatusChange = async (rentalId, newStatus) => {
    try {
      // Optimistically update the UI
      setRentals(prev => prev.map(rental => 
        rental._id === rentalId ? { ...rental, status: newStatus } : rental
      ));
      setAllRentals(prev => prev.map(rental => 
        rental._id === rentalId ? { ...rental, status: newStatus } : rental
      ));
  
      // Make API call
      await axios.patch(`${BASE_URL}/admin/updateStatus/${rentalId}`, { newStatus });
      
      // Show success alert
      toast.success(`Rental status updated to ${newStatus} successfully!`,{containerId:"adminrentalsPage"});
      
      // Optional: Refresh data to ensure sync with server
      // getRentals();
      
    } catch (error) {
      console.error('Error updating rental status:', error);
      
      // Revert optimistic update on error
      getRentals();
      
      // Show error alert
      toast.error('Failed to update rental status. Please try again.',{containerId:"adminrentalsPage"});
    }
  };
  const refreshRentals = () => {
    getRentals();
  };

  const handleViewRental = (rental) => {
    setSelectedRental(rental);
    setShowModal(true);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (loading && rentals.length === 0 && allRentals.length === 0) {
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
 <ToastContainer containerId={"adminrentalsPage"}/>
 
 <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Rentals Management</h1>
        <p className="text-gray-600">Monitor active rentals and manage rental status.</p>
        <p className="text-sm text-gray-500 mt-1">
          Total Rentals: {pagination.totalOrders.toLocaleString()} | Page {pagination.currentPage} of {pagination.totalPages}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Rentals</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-full">
              <Package className="h-6 w-6 text-gray-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Rentals</p>
              <p className="text-3xl font-bold text-green-600">{stats.active}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Paused Rentals</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.paused}</p>
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
              <p className="text-3xl font-bold text-blue-600">${stats.monthlyRevenue.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by rental ID, customer name, email, or location..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
            </select>
          </div>

          <div className="relative">
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
            </select>
          </div>
          
          <button
            onClick={refreshRentals}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
          >
            {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>}
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Rentals Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">All Rentals</h2>
        </div>
        
        <div className="overflow-x-auto">
          {paginatedRentals.length === 0 ? (
            <div className="flex flex-col justify-center items-center py-12">
              <Package className="h-12 w-12 text-gray-300 mb-4" />
              <div className="text-gray-500 text-lg font-medium">No rentals found</div>
              {searchTerm && (
                <p className="text-sm text-gray-400 mt-2">Try adjusting your search terms or filters</p>
              )}
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rental ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monthly Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedRentals.map(rental => (
                  <tr key={rental._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-mono text-gray-900">{rental.orderNumber || rental._id.slice(-8)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{rental.user?.name || rental.user?.email || 'N/A'}</div>
                    <div className="text-xs text-gray-500">{rental.user?.phone || ''}</div>
                  </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(rental.status)}`}>
                        {rental.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        <div className="space-y-1">
                          {rental.listing && (
                            <div className="text-xs bg-blue-100 px-2 py-1 rounded">
                              {rental.listing.title}
                            </div>
                          )}
                          {!rental.listing && (
                            <div className="text-xs text-gray-400">No items</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-green-600">
                        ${(rental.totalAmount || rental.monthlyRent || 0).toFixed(2)}/mo
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleViewRental(rental)}
                          className="text-blue-600 hover:text-blue-900 text-xs bg-blue-100 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                        >
                          <Eye className="h-3 w-3 inline mr-1" />
                          View
                        </button>
                        {rental.status === 'confirmed' ? (
                          <button 
                          onClick={() => handleStatusChange(rental._id, 'paused')}
                            className="text-yellow-600 hover:text-yellow-900 text-xs bg-yellow-100 px-2 py-1 rounded hover:bg-yellow-200 transition-colors"
                          >
                            <Pause className="h-3 w-3 inline mr-1" />
                            Pause
                          </button>
                        ) : rental.status === 'paused' ? (
                            <button 
                            onClick={() => handleStatusChange(rental._id, 'confirmed')}
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
          totalItems={pagination.totalOrders}
          limit={pagination.limit}
        />
      </div>

      {/* Modal */}
      {showModal && selectedRental && (
  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
      <div className="mt-3">
        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900">Rental Details</h3>
          <button
            onClick={() => setShowModal(false)}
            className="text-gray-400 hover:text-gray-600 transition duration-150 ease-in-out"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Rental Information</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Rental ID:</span>
                    <span className="text-sm text-gray-900 font-mono">{selectedRental.orderNumber || selectedRental._id.slice(-12)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Customer:</span>
                    <span className="text-sm text-gray-900">{selectedRental.user?.name || selectedRental.user?.email || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Email:</span>
                    <span className="text-sm text-gray-900">{selectedRental.user?.email || 'N/A'}</span>
                  </div>
                  {selectedRental.user?.mobile && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Phone:</span>
                      <span className="text-sm text-gray-900">{selectedRental.user.mobile}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Status:</span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedRental.status)}`}>
                      {selectedRental.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Delivery Date:</span>
                    <span className="text-sm text-gray-900">{formatDate(selectedRental.deliveryDate)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Delivery Time:</span>
                    <span className="text-sm text-gray-900">{selectedRental.deliveryTime}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Delivery Location</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 text-gray-500 mt-1 mr-2" />
                    <span className="text-sm text-gray-700">
                      {selectedRental.deliveryAddress 
                        ? `${selectedRental.deliveryAddress.street}, ${selectedRental.deliveryAddress.city}, ${selectedRental.deliveryAddress.state} ${selectedRental.deliveryAddress.zipCode}`
                        : 'Location not specified'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Rental Item</h4>
                <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                  {selectedRental.listing ? (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-2 bg-white rounded border">
                        <img
                          src={
                            selectedRental.request?.images?.[0]?.front || 
                            selectedRental.productImages?.front ||
                            selectedRental.listing.images?.[0] || 
                            'https://via.placeholder.com/48'
                          }
                          alt={selectedRental.listing.title}
                          className="h-12 w-12 object-cover rounded"
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/48?text=No+Image'; }}
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">{selectedRental.listing.title}</div>
                          <div className="text-sm text-green-600 font-semibold">${selectedRental.monthlyRent || 0}/month</div>
                        </div>
                      </div>
                      
                      {/* Product Images Section */}
                      {(selectedRental.request?.images?.[0] || selectedRental.productImages) && (
                        <div className="mt-3">
                          <p className="text-xs font-medium text-gray-600 mb-2">Product Images:</p>
                          <div className="grid grid-cols-4 gap-2">
                            {(selectedRental.request?.images?.[0]?.front || selectedRental.productImages?.front) && (
                              <div className="text-center">
                                <img
                                  src={selectedRental.request?.images?.[0]?.front || selectedRental.productImages?.front}
                                  alt="Front"
                                  className="h-16 w-16 object-cover rounded border"
                                  onError={(e) => { e.target.src = 'https://via.placeholder.com/64?text=Front'; }}
                                />
                                <p className="text-xs text-gray-500 mt-1">Front</p>
                              </div>
                            )}
                            {(selectedRental.request?.images?.[0]?.side || selectedRental.productImages?.side) && (
                              <div className="text-center">
                                <img
                                  src={selectedRental.request?.images?.[0]?.side || selectedRental.productImages?.side}
                                  alt="Side"
                                  className="h-16 w-16 object-cover rounded border"
                                  onError={(e) => { e.target.src = 'https://via.placeholder.com/64?text=Side'; }}
                                />
                                <p className="text-xs text-gray-500 mt-1">Side</p>
                              </div>
                            )}
                            {(selectedRental.request?.images?.[0]?.serial_tag || selectedRental.productImages?.serial_tag) && (
                              <div className="text-center">
                                <img
                                  src={selectedRental.request?.images?.[0]?.serial_tag || selectedRental.productImages?.serial_tag}
                                  alt="Serial Tag"
                                  className="h-16 w-16 object-cover rounded border"
                                  onError={(e) => { e.target.src = 'https://via.placeholder.com/64?text=Serial'; }}
                                />
                                <p className="text-xs text-gray-500 mt-1">Serial</p>
                              </div>
                            )}
                            {(selectedRental.request?.images?.[0]?.condition || selectedRental.productImages?.condition) && (
                              <div className="text-center">
                                <img
                                  src={selectedRental.request?.images?.[0]?.condition || selectedRental.productImages?.condition}
                                  alt="Condition"
                                  className="h-16 w-16 object-cover rounded border"
                                  onError={(e) => { e.target.src = 'https://via.placeholder.com/64?text=Condition'; }}
                                />
                                <p className="text-xs text-gray-500 mt-1">Condition</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-400">No items available</div>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="space-y-2">
                  <div className="pt-2 border-t border-blue-200">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">Monthly Total:</span>
                      <span className="text-xl font-bold text-blue-600">
                        ${(selectedRental.totalAmount || selectedRental.monthlyRent || 0).toFixed(2)}
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
            onClick={() => setShowModal(false)}
            className="px-4 py-2 bg-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-400 transition duration-150 ease-in-out"
          >
            Close
          </button>
          {selectedRental.status === 'active' ? (
            <button 
              onClick={() => {
                handleStatusChange(selectedRental._id, 'paused');
                setShowModal(false);
              }}
              className="px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-md hover:bg-yellow-700 transition duration-150 ease-in-out flex items-center"
            >
              <Pause className="h-4 w-4 mr-1" />
              Pause Rental
            </button>
          ) : selectedRental.status === 'paused' ? (
            <button 
              onClick={() => {
                handleStatusChange(selectedRental._id, 'active');
                setShowModal(false);
              }}
              className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition duration-150 ease-in-out flex items-center"
            >
              <Play className="h-4 w-4 mr-1" />
              Resume Rental
            </button>
          ) : null}
        </div>
      </div>
    </div>
  </div>
)}
    </div>
 </>
  );
};

export default RentalsManagement;