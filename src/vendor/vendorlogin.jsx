import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import { BASE_URL } from '../baseUrl';
import { useNavigate } from 'react-router-dom';

function VendorLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields', { containerId: 'loginPage' });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${BASE_URL}/vendor/login`, {
        email: formData.email,
        password: formData.password
      });
      
      localStorage.setItem('vendorToken', response.data.token);
      localStorage.setItem('vendorId', response.data.vendor._id);
      
      if (formData.rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }
      
      toast.success('Login successful!', { containerId: 'loginPage' });
      
      setTimeout(() => {
        navigate('/vendordashboard');
      }, 1500);
      
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error?.response?.data?.error || 'Login failed. Please try again.', {
        containerId: 'loginPage'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer containerId="loginPage" />
      <div className="min-h-screen bg-[#f3f4e6] flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#024a47] mb-2">
              Vendor Login
            </h1>
            <p className="text-gray-600">
              Sign in to manage your listings
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="vendor@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#024a47]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin(e)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-12 py-3 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#024a47]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-[#024a47] rounded" 
                  />
                  <span className="text-sm text-gray-600">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => navigate('/vendorreset')}
                  className="text-sm text-[#024a47] hover:underline"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full py-3 bg-[#024a47] text-white rounded-lg font-semibold hover:bg-[#035d59] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>

              <div className="text-center mt-4">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/vendorregister')}
                    className="text-[#024a47] font-semibold hover:underline"
                  >
                    Sign Up
                  </button>
                </p>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Need help?{' '}
              <a href="#" className="text-[#024a47] hover:underline">
                Contact Support
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default VendorLogin;