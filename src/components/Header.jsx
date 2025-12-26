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
     
      </header>
    );
  };
  

  export default Header