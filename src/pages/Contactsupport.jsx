import { useState } from 'react';
import React from 'react';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios'
import { BASE_URL } from '../baseUrl';
import { useNavigate } from 'react-router-dom';

export default function ContactSupport() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    issue: ''
  });

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
   
    try {
  
      if (formData.name.length === 0) {
        toast.error("Please enter your name", {containerId:"contactPage"})
        return
      }
      if (formData.email.length === 0) {
        toast.error("Please enter your email", {containerId:"contactPage"})
        return
      }
      if (formData.issue.length === 0) {
        toast.error("Please describe your issue", {containerId:"contactPage"})
        return
      }

      const response = await axios.post(`${BASE_URL}/contactSupport`, {
        name: formData.name,
        email: formData.email,
        issue: formData.issue
      })

      console.log(response.data)
      toast.dismiss(); 
      toast.success(response.data.message || "Your message has been sent successfully!", {containerId:"contactPage"})
      
    

      setFormData({
        name: '',
        email: '',
        issue: ''
      });
      
    } catch(e) {
      console.log(e)
      if (e?.response?.data?.error) {
        toast.dismiss(); 
        toast.error(e?.response?.data?.error, {containerId:"contactPage"})
      } else {
        toast.dismiss(); 
        toast.error("Error while sending message, please try again", {containerId:"contactPage"})
      }
    }
  };

  return (
    <>
      <ToastContainer containerId={"contactPage"}/>
      <div className="min-h-screen bg-[#f3f4e6] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl bg-white rounded-lg shadow-lg overflow-hidden mx-auto">
         
          <div className="bg-white px-4 sm:px-6 md:px-8 pt-6 sm:pt-8 pb-4 sm:pb-6 text-center">
            <div className="mb-3 sm:mb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 bg-[#024a47] rounded-lg mb-2">
                <svg viewBox="0 0 24 24" className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-white" fill="currentColor">
                  <path d="M19 9.3V4h-3v2.6L12 3L2 12h3v8h6v-6h2v6h6v-8h3L19 9.3z"/>
                  <circle cx="8" cy="16" r="1"/>
                  <circle cx="16" cy="16" r="1"/>
                  <rect x="6" y="14" width="4" height="1"/>
                  <rect x="14" y="14" width="4" height="1"/>
                </svg>
              </div>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-[#024a47] mb-1">RentSimple</h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-[#024a47]">Rent-to-Own Appliance</p>
          </div>

        
          <div className="px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-[#024a47] text-center">
              Contact Support
            </h2>
          </div>

 
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center mb-4 sm:mb-6">
              <div className="flex-grow h-px bg-gray-300"></div>
              <span className="px-3 sm:px-4 text-base sm:text-lg lg:text-xl font-semibold text-[#024a47]">
                Get in Touch
              </span>
              <div className="flex-grow h-px bg-gray-300"></div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              
              <div>
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 sm:px-4 py-3 sm:py-4 text-gray-700 placeholder-gray-400 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#024a47] focus:border-[#024a47] text-base sm:text-lg"
                />
              </div>

              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 sm:px-4 py-3 sm:py-4 text-gray-700 placeholder-gray-400 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#024a47] focus:border-[#024a47] text-base sm:text-lg"
                />
              </div>

            
              <div>
                <textarea
                  name="issue"
                  placeholder="Describe your issue..."
                  value={formData.issue}
                  onChange={handleInputChange}
                  rows="5"
                  className="w-full px-3 sm:px-4 py-3 sm:py-4 text-gray-700 placeholder-gray-400 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#024a47] focus:border-[#024a47] text-base sm:text-lg resize-none"
                />
              </div>

              <div className="pt-3 sm:pt-4 pb-6 sm:pb-8">
                <button
                  onClick={handleSubmit}
                  className="w-full cursor-pointer bg-[#024a47] hover:bg-[#035d59] text-white font-semibold py-3 sm:py-4 px-4 rounded-lg transition-colors text-base sm:text-lg lg:text-xl"
                >
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}