import React, { useState } from "react";
import { Lock, Eye, EyeOff, Key } from "lucide-react";
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import { BASE_URL } from '../baseUrl';
import { useNavigate } from 'react-router-dom';

function VendorResetPassword() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    token: '',
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!formData.token || !formData.password) {
      toast.error('Please fill in all fields', { containerId: 'resetPasswordPage' });
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters', { containerId: 'resetPasswordPage' });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match', { containerId: 'resetPasswordPage' });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${BASE_URL}/auth/vendor/reset-password`, {
        token: formData.token,
        password: formData.password
      });
      
      toast.success('Password reset successful! Redirecting to login...', { 
        containerId: 'resetPasswordPage' 
      });
      
      setTimeout(() => {
        navigate('/vendorlogin');
      }, 1500);
      
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error(error?.response?.data?.error || 'Failed to reset password.', {
        containerId: 'resetPasswordPage'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer containerId="resetPasswordPage" />
      <div className="min-h-screen bg-[#f3f4e6] flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#024a47] mb-2">
              Reset Password
            </h1>
            <p className="text-gray-600">
              Create a new password for your account
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Reset Token *
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="token"
                    value={formData.token}
                    onChange={handleInputChange}
                    placeholder="Enter token from email"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#024a47]"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Check your email for the reset token
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  New Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Minimum 6 characters"
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

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Re-enter new password"
                    className="w-full pl-10 pr-12 py-3 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#024a47]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-gray-400"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Password Requirements */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-gray-700 mb-2">Password Requirements:</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li className="flex items-center space-x-2">
                    <span className={formData.password.length >= 6 ? "text-green-600" : "text-gray-400"}>
                      {formData.password.length >= 6 ? "✓" : "○"}
                    </span>
                    <span>At least 6 characters</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className={formData.password === formData.confirmPassword && formData.password ? "text-green-600" : "text-gray-400"}>
                      {formData.password === formData.confirmPassword && formData.password ? "✓" : "○"}
                    </span>
                    <span>Passwords match</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={handleResetPassword}
                disabled={loading}
                className="w-full py-3 bg-[#024a47] text-white rounded-lg font-semibold hover:bg-[#035d59] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Resetting...</span>
                  </>
                ) : (
                  <span>Reset Password</span>
                )}
              </button>

              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => navigate('/vendorlogin')}
                  className="text-sm text-[#024a47] hover:underline"
                >
                  Back to Login
                </button>
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

export default VendorResetPassword;