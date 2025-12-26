import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '../baseUrl';
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
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    users: [],
    subscriptions: [],
    products: [],
    stats: {
      totalUsers: 0,
      activeSubscriptions: 0,
      monthlyRevenue: 0,
      availableInventory: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);
  
 
  const [activityPage, setActivityPage] = useState(1);
  const [activityPagination, setActivityPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalSubscriptions: 0,
    limit: 8,
    hasNext: false,
    hasPrev: false
  });

 
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    fetchAllDashboardData();
  }, [activityPage]);

 
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAllDashboardData();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const fetchAllDashboardData = async () => {
    try {
      setLoading(true);
      
 
      const fetchPromises = [
      
        axios.get(`${BASE_URL}/getUsers?page=1&limit=1000`), 

        axios.get(`${BASE_URL}/get-orders?page=${activityPage}&limit=${activityPagination.limit}`),
       
        axios.get(`${BASE_URL}/admin/getProducts?page=1&limit=1000`)
      ];

      const [usersResponse, subscriptionsResponse, productsResponse] = await Promise.allSettled(fetchPromises);
console.log(subscriptionsResponse)
console.log("SUB")
console.log("PRODUCTS")
console.log(productsResponse)
      let products = [];
      let subscriptions = [];
      let users = [];
      let subscriptionPagination = {};

    
      if (productsResponse.status === 'fulfilled') {
        products = productsResponse.value.data.products || [];
        console.log('Fetched products:', products.length, products);
      } else {
        console.error('Failed to fetch products:', productsResponse.reason);
        toast.error('Failed to load products data',{containerId:"adminDashboard"});
      }

     
      if (subscriptionsResponse.status === 'fulfilled') {
        const subscriptionData = subscriptionsResponse.value.data;
        subscriptions = subscriptionData.orders || [];
        subscriptionPagination = subscriptionData.pagination || {};
      } else {
        console.error('Failed to fetch subscriptions:', subscriptionsResponse.reason);
        toast.error('Failed to load subscriptions data',{containerId:"adminDashboard"});
      }

     
      if (usersResponse.status === 'fulfilled') {
        const userData = usersResponse.value.data;
        users = userData.users || [];
      } else {
        console.error('Failed to fetch users:', usersResponse.reason);
        toast.error('Failed to load users data',{containerId:"adminDashboard"});
      }

      
      const stats = await calculateStats(products, users);
     
console.log('Calculated Stats:', stats);
console.log('Products:', products.length);
console.log('Users:', users.length);
      setDashboardData({
        products,
        subscriptions,
        users,
        stats
      });

   
      setActivityPagination(prev => ({
        ...prev,
        ...subscriptionPagination
      }));

     
      await generateRecentActivity(subscriptions, users);
      
      setLastRefresh(new Date());

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data',{containerId:"adminDashboard"});
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = async (products, users) => {
    try {
      const allSubscriptionsResponse = await axios.get(`${BASE_URL}/get-orders?page=1&limit=10000`);
      const allSubscriptions = allSubscriptionsResponse.data.orders || [];
  
      const availableInventory = products.filter(product => 
        product.status === 'active' && product.availability?.isAvailable === true
      ).length;
  
      const rentedItems = products.filter(product => 
        product.status === 'rented'
      ).length;
  
      const inactiveItems = products.filter(product => 
        product.status === 'inactive'
      ).length;
  
      
      const activeSubscriptions = allSubscriptions.filter(subscription => 
        subscription.status === 'active' || subscription.status === 'confirmed'
      ).length;
  
      const pausedSubscriptions = allSubscriptions.filter(subscription => 
        subscription.status === 'paused'
      ).length;
  
      const cancelledSubscriptions = allSubscriptions.filter(subscription => 
        subscription.status === 'cancelled'
      ).length;
  
      
      const monthlyRevenue = allSubscriptions
        .filter(sub => sub.status === 'confirmed')
        .reduce((total, sub) => {
          return total + ((sub.totalAmount || 0) * 0.15);
        }, 0);
  
      const totalUsers = users.length;
      const activeUsers = users.filter(user => user.status === 'active').length;
      const suspendedUsers = users.filter(user => user.status === 'suspended').length;
      const verifiedUsers = users.filter(user => user.verified === true).length;
  
      return {
        totalUsers,
        activeUsers,
        suspendedUsers,
        verifiedUsers,
        
        totalSubscriptions: allSubscriptions.length,
        activeSubscriptions,
        pausedSubscriptions,
        cancelledSubscriptions,
        monthlyRevenue,
        
        totalProducts: products.length,
        availableInventory,
        rentedItems,
        inactiveItems
      };
      
    } catch (error) {
      console.error('Error calculating comprehensive stats:', error);
      
   
return {
  totalUsers: users.length,
  activeUsers: users.filter(user => user.status === 'active').length,
  suspendedUsers: users.filter(user => user.status === 'suspended').length,
  verifiedUsers: users.filter(user => user.verified === true).length,
  
  totalSubscriptions: 0,
  activeSubscriptions: 0,
  pausedSubscriptions: 0,
  cancelledSubscriptions: 0,
  monthlyRevenue: 0,
  
  totalProducts: products.length,
  availableInventory: products.filter(product => 
    product.status === 'active' && product.availability?.isAvailable === true
  ).length,
  rentedItems: products.filter(product => product.status === 'rented').length,
  inactiveItems: products.filter(product => product.status === 'inactive').length
};
    }
  };

  const generateRecentActivity = async (subscriptions, users) => {
    const userMap = users.reduce((map, user) => {
      map[user._id] = user;
      return map;
    }, {});
  
    const recent = subscriptions
      .sort((a, b) => new Date(b.createdAt || b.deliveryDate) - new Date(a.createdAt || a.deliveryDate))
      .map(sub => {
       
        const userId = typeof sub.user === 'object' ? sub.user._id : sub.user;
        const user = typeof sub.user === 'object' ? sub.user : userMap[userId];
        
        return {
          id: sub._id,
          userId: userId,
          userName: user ? (user.name || user.email || 'Unknown User') : 'Unknown User',
          userEmail: user ? user.email : '',
          status: sub.status,
          deliveryDate: sub.deliveryDate,
          createdAt: sub.createdAt,
          listingTitle: sub.listing?.title || 'N/A',
          monthlyTotal: sub.monthlyRent || 0
        };
      });
    
    setRecentActivity(recent);
  };
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
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

  const getChangePercentage = (current, category) => {
  
    if (!current || current === 0) {
      return null; 
    }
    
   
  };

  const handleRefresh = () => {
    fetchAllDashboardData();
    toast.success('Dashboard refreshed successfully',{containerId:"adminDashboard"});
  };

  const handleActivityPageChange = (newPage) => {
    if (newPage >= 1 && newPage <= activityPagination.totalPages) {
      setActivityPage(newPage);
    }
  };

  if (loading && recentActivity.length === 0) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  const statsCards = [
    { 
      title: 'Total Users', 
      value: dashboardData.stats.totalUsers?.toLocaleString() || '0', 
      change: getChangePercentage(dashboardData.stats.totalUsers, 'totalUsers'), 
      icon: Users, 
      color: 'bg-blue-500' 
    },
    { 
      title: 'Active Subscriptions', 
      value: dashboardData.stats.activeSubscriptions?.toLocaleString() || '0', 
      change: getChangePercentage(dashboardData.stats.activeSubscriptions, 'activeSubscriptions'), 
      icon: CreditCard, 
      color: 'bg-green-500' 
    },
    { 
      title: 'Monthly Revenue', 
      value: formatCurrency(dashboardData.stats.monthlyRevenue || 0), 
      change: getChangePercentage(dashboardData.stats.monthlyRevenue, 'monthlyRevenue'), 
      icon: DollarSign, 
      color: 'bg-purple-500' 
    },
    { 
      title: 'Available Inventory', 
      value: dashboardData.stats.availableInventory?.toLocaleString() || '0', 
      change: getChangePercentage(dashboardData.stats.availableInventory, 'availableInventory'), 
      icon: Package, 
      color: 'bg-orange-500' 
    }
  ];

  return (
    <>
      <ToastContainer containerId={"adminDashboard"} />
      <div className="p-6">
     
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
            <p className="text-gray-600">Welcome back! Here's what's happening with RentSimple today.</p>
            <p className="text-sm text-gray-500 mt-1">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </p>
          </div>
          <button
            onClick={handleRefresh}
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

       
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
  {statsCards.map((stat, index) => (
    <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 relative">
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
        </div>
      )}
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${stat.color}`}>
          <stat.icon className="h-6 w-6 text-white" />
        </div>
        {stat.change && (
          <span className={`text-sm font-medium ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
            {stat.change}
          </span>
        )}
      </div>
      <div>
        <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
        <p className="text-gray-600 text-sm">{stat.title}</p>
      </div>
    </div>
  ))}
</div>
   
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-green-600">
                  {dashboardData.stats.activeUsers?.toLocaleString() || '0'}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Verified Users</p>
                <p className="text-2xl font-bold text-blue-600">
                  {dashboardData.stats.verifiedUsers?.toLocaleString() || '0'}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Paused Subscriptions</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {dashboardData.stats.pausedSubscriptions?.toLocaleString() || '0'}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-gray-600">Inactive Items</p>
      <p className="text-2xl font-bold text-red-600">
        {dashboardData.stats.inactiveItems?.toLocaleString() || '0'}
      </p>
    </div>
    <div className="p-3 bg-red-100 rounded-full">
      <XCircle className="h-6 w-6 text-red-600" />
    </div>
  </div>
</div>
        </div>

       
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Recent Subscription Orders</h2>
              <div className="text-sm text-gray-500">
                Page {activityPagination.currentPage} of {activityPagination.totalPages}
              </div>
            </div>
            
            <div className="max-h-96 overflow-y-auto space-y-4 relative">
              {loading && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                </div>
              )}
              
              {recentActivity.map(activity => (
  <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
    <div>
      <p className="font-medium text-gray-900">{activity.userName}</p>
      <p className="text-xs text-gray-500 truncate max-w-48">{activity.userEmail}</p>
      <p className="text-sm text-gray-600">
        {activity.listingTitle} - {formatCurrency(activity.monthlyTotal)}/month
      </p>
    </div>
    <div className="text-right">
      <p className="text-sm text-gray-500">
        {formatDate(activity.deliveryDate || activity.createdAt)}
      </p>
      <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getStatusColor(activity.status)}`}>
        {activity.status}
      </span>
    </div>
  </div>
))}
         </div>
            
        
        
            {activityPagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  {activityPagination.totalSubscriptions} total orders
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleActivityPageChange(activityPagination.currentPage - 1)}
                    disabled={!activityPagination.hasPrev || loading}
                    className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-sm text-gray-700">
                    {activityPagination.currentPage} / {activityPagination.totalPages}
                  </span>
                  <button
                    onClick={() => handleActivityPageChange(activityPagination.currentPage + 1)}
                    disabled={!activityPagination.hasNext || loading}
                    className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

        
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">System Status</h2>
            <div className="space-y-4">
              <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-green-800">All systems operational</p>
                  <p className="text-xs text-green-600">
                    Last updated: {lastRefresh.toLocaleTimeString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Package className="h-5 w-5 text-blue-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-blue-800">
                    {dashboardData.stats.totalProducts?.toLocaleString() || '0'} total products in inventory
                  </p>
                  <p className="text-xs text-blue-600">
                    {dashboardData.stats.availableInventory?.toLocaleString() || '0'} available for rent
                  </p>
                </div>
              </div>

              <div className="flex items-center p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <Users className="h-5 w-5 text-gray-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {dashboardData.stats.totalUsers?.toLocaleString() || '0'} registered users
                  </p>
                 
                </div>
              </div>

              {dashboardData.stats.pausedSubscriptions > 0 && (
                <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <Clock className="h-5 w-5 text-yellow-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">
                      {dashboardData.stats.pausedSubscriptions?.toLocaleString()} paused subscriptions
                    </p>
                    <p className="text-xs text-yellow-600">May need attention</p>
                  </div>
                </div>
              )}
{dashboardData.stats.inactiveItems > 0 && (
  <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
    <XCircle className="h-5 w-5 text-red-500 mr-3" />
    <div>
      <p className="text-sm font-medium text-red-800">
        {dashboardData.stats.inactiveItems?.toLocaleString()} inactive items
      </p>
      <p className="text-xs text-red-600">Items not available for rent</p>
    </div>
  </div>
)}
            </div>
          </div>
        </div>

      
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            Dashboard showing live data from {dashboardData.stats.totalUsers?.toLocaleString() || '0'} users, 
            {' '}{dashboardData.stats.totalSubscriptions?.toLocaleString() || '0'} subscriptions, 
            and {dashboardData.stats.totalProducts?.toLocaleString() || '0'} products
          </p>
          <p className="mt-1">Auto-refreshes every 5 minutes</p>
        </div>
      </div>
    </>
  );
};

export default Dashboard;