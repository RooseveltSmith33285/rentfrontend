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
  X
} from 'lucide-react';



const Header = ({ toggleSidebar }) => {
    return (
      <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-6">
        <button 
          onClick={toggleSidebar}
          className="text-gray-500 hover:text-gray-700 lg:hidden"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Bell className="h-6 w-6 text-gray-400" />
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">3</span>
          </div>
          <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-gray-600">AD</span>
          </div>
        </div>
      </header>
    );
  };
  

  export default Header