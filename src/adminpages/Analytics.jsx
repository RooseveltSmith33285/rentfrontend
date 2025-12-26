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
  X
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';

const Analytics = () => {
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
  const [categoryData, setCategoryData] = useState([]);
  const [locationData, setLocationData] = useState([]);
  const [revenueGrowth, setRevenueGrowth] = useState([]);

  useEffect(() => {
    fetchAllDashboardData();
  }, []);

  



  const calculateGrowthPercentage = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };


  const calculatePreviousMonthStats = (subscriptions, users) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    

    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
   const currentMonthSubs = subscriptions.filter(sub => {
    const date = new Date(sub.deliveryDate || sub.createdAt);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear && 
           sub.status === 'confirmed';
  });
const currentMonthRevenue = currentMonthSubs.reduce((sum, sub) => sum + ((sub.totalAmount || 0) * 0.15), 0);

const prevMonthSubs = subscriptions.filter(sub => {
  const date = new Date(sub.deliveryDate || sub.createdAt);
  return date.getMonth() === prevMonth && date.getFullYear() === prevYear && 
         sub.status === 'confirmed';
});

const prevMonthRevenue = prevMonthSubs.reduce((sum, sub) => sum + ((sub.totalAmount || 0) * 0.15), 0);
   
    const currentMonthUsers = users.filter(user => {
      const date = new Date(user.createdAt);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    }).length;
    
   
    const prevMonthUsers = users.filter(user => {
      const date = new Date(user.createdAt);
      return date.getMonth() === prevMonth && date.getFullYear() === prevYear;
    }).length;
    
    return {
      revenueGrowth: calculateGrowthPercentage(currentMonthRevenue, prevMonthRevenue),
      userGrowth: calculateGrowthPercentage(currentMonthUsers, prevMonthUsers),
      currentMonthRevenue,
      prevMonthRevenue
    };
  };

  

  const fetchAllDashboardData = async () => {
    try {
      setLoading(true);
      
      const [productsResponse, subscriptionsResponse, usersResponse] = await Promise.allSettled([
        axios.get(`${BASE_URL}/admin/getProducts?limit=1000`),
        axios.get(`${BASE_URL}/get-orders?limit=1000`),
        axios.get(`${BASE_URL}/getUsers`) 
      ]);

      console.log('Subscriptions Response:', subscriptionsResponse);
console.log('Total Orders:', subscriptionsResponse.value?.data?.orders?.length);
console.log('Orders by status:', subscriptionsResponse.value?.data?.orders?.reduce((acc, order) => {
  acc[order.status] = (acc[order.status] || 0) + 1;
  return acc;
}, {}));
      console.log(subscriptionsResponse)
      console.log("subscription")
  
      let products = [];
      let subscriptions = [];
      let users = [];
  
      if (productsResponse.status === 'fulfilled') {
        products = productsResponse.value.data.products || [];
      }
      if (subscriptionsResponse.status === 'fulfilled') {
        subscriptions = subscriptionsResponse.value.data.orders || [];
      }
      if (usersResponse.status === 'fulfilled') {
        users = usersResponse.value.data.users || [];
      }
  
      const stats = calculateStats(products, subscriptions, users);
      const growthStats = calculatePreviousMonthStats(subscriptions, users);
      
      setDashboardData({
        products,
        subscriptions,
        users,
        stats: { ...stats, ...growthStats }
      });
  
      generateCategoryAnalytics(products, subscriptions);
      generateLocationAnalytics(users);
      generateRevenueGrowth(subscriptions);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load analytics data',{containerId:"adminanalyticsPage"});
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (products, subscriptions, users) => {

const availableInventory = products.filter(product => {
 
  console.log('Product:', product.name, 'Status:', product.status, 'Available:', product.availability);
  

  return product.status === 'active' || 
         (product.availability?.isAvailable === true) ||
         (!product.isRented && product.status !== 'inactive');
}).length;
    
    const activeSubscriptions = subscriptions.filter(subscription => 
      subscription.status === 'confirmed'
    ).length;
    const monthlyRevenue = subscriptions
    .filter(sub => sub.status === 'confirmed')
    .reduce((total, sub) => {
    
      return total + ((sub.totalAmount || 0) * 0.15);
    }, 0);
    const totalUsers = users.length;
    const activeUsers = users.filter(user => user.status === 'active').length;
    const verifiedUsers = users.filter(user => user.verified === true).length;
  
    const cancelledSubscriptions = subscriptions.filter(sub => sub.status === 'cancelled').length;
  const churnRate = subscriptions.length > 0 ? (cancelledSubscriptions / subscriptions.length) * 100 : 0;

  const avgLTV = activeUsers > 0 ? (monthlyRevenue / activeUsers) * 12 : 0;


  const rentedItems = subscriptions.filter(sub => 
    sub.status === 'confirmed'
  ).length;
  
  
  const soldItems = subscriptions.filter(sub => 
    sub.status === 'sold' || sub.status === 'completed'
  ).length;

  return {
    totalUsers,
    activeUsers,
    verifiedUsers,
    activeSubscriptions,
    monthlyRevenue,
    availableInventory,
    totalProducts: products.length,
    churnRate,
    avgLTV,
    pausedSubscriptions: subscriptions.filter(sub => sub.status === 'paused').length,
    rentedItems,
    soldItems,
    inactiveItems: products.filter(product => product.status === 'inactive').length
  };
};

  const generateCategoryAnalytics = (products, subscriptions) => {
    const categoryMap = {};
    
   
    products.forEach(product => {
      const category = product.category || 'uncategorized';
      if (!categoryMap[category]) {
        categoryMap[category] = { total: 0, rented: 0 };
      }
      categoryMap[category].total += 1;
      if (product.status === 'rented') {
        categoryMap[category].rented += 1;
      }
    });
  
    
    subscriptions.forEach(sub => {
      if (sub.listing?.category && sub.status === 'active') {
        const category = sub.listing.category;
        if (!categoryMap[category]) {
          categoryMap[category] = { total: 0, rented: 0 };
        }
       
      }
    });
   
    const categoryStats = Object.entries(categoryMap)
      .map(([category, data]) => ({
        category,
        percentage: data.total > 0 ? Math.round((data.rented / data.total) * 100) : 0,
        rentedCount: data.rented,
        totalCount: data.total
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 5); 

    setCategoryData(categoryStats);
  };

  const generateLocationAnalytics = (users) => {
   
    const locationMap = {};
    
    users.forEach(user => {
      const location = user.address?.city || user.city || 'Unknown Location';
      locationMap[location] = (locationMap[location] || 0) + 1;
    });

    const locationStats = Object.entries(locationMap)
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); 

    setLocationData(locationStats);
  };

  const generateRevenueGrowth = (subscriptions) => {
    
    const monthlyRevenue = {};
    
    subscriptions.forEach(sub => {
      if (sub.status === 'confirmed') {
        const date = new Date(sub.deliveryDate || sub.createdAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
       
        const revenue = (sub.totalAmount || 0) * 0.15;
        
        monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + revenue;
      }
    });


    const chartData = Object.entries(monthlyRevenue)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6) 
      .map(([monthKey, revenue]) => {
        const [year, month] = monthKey.split('-');
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return {
          month: monthNames[parseInt(month) - 1],
          revenue,
          users: Math.floor(revenue / 100) 
        };
      });

    setRevenueGrowth(chartData);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getCategoryColor = (index) => {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-red-500'];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading analytics...</div>
        </div>
      </div>
    );
  }

 
  return (
    <>
      <ToastContainer containerId={"adminanalyticsPage"}/>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics & Reporting</h1>
          <p className="text-gray-600">Track growth metrics, revenue reports, and business insights.</p>
        </div>

   
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <span className={`text-sm font-medium ${(dashboardData.stats.revenueGrowth || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
  {(dashboardData.stats.revenueGrowth || 0) >= 0 ? '+' : ''}{dashboardData.stats.revenueGrowth || 0}%
</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(dashboardData.stats.monthlyRevenue)}</h3>
            <p className="text-gray-600">Monthly Revenue</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="h-8 w-8 text-blue-500" />
              <span className={`text-sm font-medium ${dashboardData.stats.userGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
  {dashboardData.stats.userGrowth >= 0 ? '+' : ''}{dashboardData.stats.userGrowth}%
</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{dashboardData.stats.totalUsers.toLocaleString()}</h3>
            <p className="text-gray-600">Total Users</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <BarChart3 className="h-8 w-8 text-purple-500" />
              <span className={`text-sm font-medium ${dashboardData.stats.churnRate <= 5 ? 'text-green-600' : 'text-red-600'}`}>
  {dashboardData.stats.churnRate <= 5 ? 'Good' : 'High'}
</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{dashboardData.stats.churnRate?.toFixed(1) || 0}%</h3>
            <p className="text-gray-600">Churn Rate</p>
          </div>
        
        </div>

       
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Revenue Trend</h2>
            {revenueGrowth.length > 0 ? (
              <div className="h-64 flex items-end justify-between space-x-2">
                {revenueGrowth.map((data, index) => (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div 
                      className="w-full bg-blue-500 rounded-t min-h-[20px]"
                      style={{ height: `${Math.max((data.revenue / Math.max(...revenueGrowth.map(d => d.revenue))) * 200, 20)}px` }}
                    ></div>
                    <span className="text-xs text-gray-600 mt-2">{data.month}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No revenue data available
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">User Growth</h2>
            {revenueGrowth.length > 0 ? (
              <div className="h-64 flex items-end justify-between space-x-2">
                {revenueGrowth.map((data, index) => (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div 
                      className="w-full bg-green-500 rounded-t min-h-[20px]"
                      style={{ height: `${Math.max((data.users / Math.max(...revenueGrowth.map(d => d.users))) * 200, 20)}px` }}
                    ></div>
                    <span className="text-xs text-gray-600 mt-2">{data.month}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No user data available
              </div>
            )}
          </div>
        </div>

     

       
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <h3 className="text-lg font-bold text-gray-900 mb-2">Active Subscriptions</h3>
    <p className="text-3xl font-bold text-green-600">{dashboardData.stats.activeSubscriptions}</p>
    <p className="text-sm text-gray-600">Currently active rental subscriptions</p>
  </div>
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <h3 className="text-lg font-bold text-gray-900 mb-2">Available Inventory</h3>
    <p className="text-3xl font-bold text-blue-600">{dashboardData.stats.availableInventory}</p>
    <p className="text-sm text-gray-600">Products ready for rental</p>
  </div>
  
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <h3 className="text-lg font-bold text-gray-900 mb-2">Rented Items</h3>
    <p className="text-3xl font-bold text-orange-600">{dashboardData.stats.rentedItems}</p>
    <p className="text-sm text-gray-600">Products currently on rent</p>
  </div>
 
</div>
      </div>
    </>
  );
};

export default Analytics;