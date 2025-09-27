import axios from 'axios';
import React, { useState,useEffect } from 'react';
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

import { BASE_URL } from '../baseUrl';

const Notifications = () => {
   
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const markAsRead = (id) => {
      setNotifications(notifications.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      ));
    };
  
    const getIconForType = (type) => {
      switch (type) {
        case 'payment':
          return <CreditCard className="h-5 w-5 text-red-500" />;
        case 'delivery':
          return <Calendar className="h-5 w-5 text-blue-500" />;
        case 'maintenance':
          return <Settings className="h-5 w-5 text-orange-500" />;
        case 'user':
          return <Users className="h-5 w-5 text-green-500" />;
        default:
          return <Bell className="h-5 w-5 text-gray-500" />;
      }
    };

    useEffect(() => {
        getOrders();
    }, []);

    const getOrders = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${BASE_URL}/get-orders`);
            console.log("ORDERS");
            console.log(response.data);
            
            
            if (response.data && response.data.orders && response.data.orders.length > 0) {
                setNotifications(response.data.orders);
            } else {
                setNotifications([]);
            }
        } catch (e) {
            console.error("Error fetching orders:", e);
            setNotifications([]); 
        } finally {
            setLoading(false);
        }
    };

    return (
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications & Communication</h1>
          <p className="text-gray-600">System alerts, customer messaging, and communication tools.</p>
        </div>
  
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg p-6 text-left transition-colors">
            <MessageSquare className="h-8 w-8 mb-3" />
            <h3 className="text-lg font-semibold">Send Bulk SMS</h3>
            <p className="text-blue-100 text-sm">Send payment reminders or promotions</p>
          </button>
          <button className="bg-green-500 hover:bg-green-600 text-white rounded-lg p-6 text-left transition-colors">
            <Bell className="h-8 w-8 mb-3" />
            <h3 className="text-lg font-semibold">Create Alert</h3>
            <p className="text-green-100 text-sm">Set up custom system alerts</p>
          </button>
          <button className="bg-purple-500 hover:bg-purple-600 text-white rounded-lg p-6 text-left transition-colors">
            <Calendar className="h-8 w-8 mb-3" />
            <h3 className="text-lg font-semibold">Schedule Message</h3>
            <p className="text-purple-100 text-sm">Schedule delivery or pickup reminders</p>
          </button>
        </div>
  
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Recent Notifications</h2>
            <button className="text-blue-600 hover:text-blue-800 text-sm">Mark all as read</button>
          </div>
          
          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-6 text-center">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Recent Notifications</h3>
              <p className="text-gray-500">You're all caught up! No new notifications at this time.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {notifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`p-6 hover:bg-gray-50 transition-colors ${!notification.read ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {getIconForType(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                            notification.priority === 'high' 
                              ? 'bg-red-100 text-red-800'
                              : notification.priority === 'medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {notification.priority}
                          </span>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">{notification.time}</span>
                        {!notification.read && (
                          <button 
                            onClick={() => markAsRead(notification.id)}
                            className="text-blue-600 hover:text-blue-800 text-xs"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

export default Notifications