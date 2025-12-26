import React, { useState } from 'react';
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
  HandCoins
} from 'lucide-react';


const Sidebar = ({ isOpen, toggleSidebar }) => {
    const location = useLocation();
    const menuItems = [
        { path: '/admin/dashboard', icon: BarChart3, label: 'Dashboard' },
        { path: '/admin/users', icon: Users, label: 'User Management' },
        { path: '/admin/vendors', icon: Users, label: 'Vendor Management' },
        { path: '/admin/subscriptions', icon: CreditCard, label: 'Subscriptions' },
        { path: '/admin/inventory', icon: Package, label: 'Inventory' },
        { path: '/admin/analytics', icon: TrendingUp, label: 'Analytics' },
        { path: '/admin/rentals', icon: HandCoins, label: 'Rentals' },
        { path: '/admin/chat', icon: MessageSquare, label: 'Chat' }
      ];
    return (
      <>
       
        {isOpen && (
          <div 
            className="fixed inset-0 bg-gray-600 bg-opacity-50 z-20 lg:hidden"
            onClick={toggleSidebar}
          ></div>
        )}
        
       
        <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-gray-900 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="flex items-center justify-between h-16 px-6 bg-gray-800">
            <h1 className="text-xl font-bold text-white">RentSimple Admin</h1>
            <button 
              onClick={toggleSidebar}
              className="text-gray-400 hover:text-white lg:hidden"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="mt-8">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors ${
                  location.pathname === item.path ? 'bg-gray-800 text-white border-r-4 border-blue-500' : ''
                }`}
                onClick={() => window.innerWidth < 1024 && toggleSidebar()}
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </>
    );
  };



  export default Sidebar