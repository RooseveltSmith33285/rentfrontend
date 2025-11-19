import { useState } from "react";
import React from "react";
import axios from 'axios'
import {BASE_URL} from '../baseUrl'
import {ToastContainer,toast} from 'react-toastify'

const ComboPopup = ({ selectedComboAppliance, handlePlugTypeSelect }) => {
  const [selectedDeliveryOption, setSelectedDeliveryOption] = useState('');
  const [selectedInstallOption, setSelectedInstallOption] = useState('');

  const handleFinalSubmit = async() => {
  
    try{
      let token=localStorage.getItem('token')
       let response=await axios.post(`${BASE_URL}/sendRequestUser`,{listing:selectedComboAppliance._id,vendor:selectedComboAppliance.vendor._id,deliveryType:selectedDeliveryOption,installationType:selectedInstallOption},{
        headers:{
          Authorization:`Bearer ${token}`
        }
       })
      //  toast.success("Request sent to vendor",{containerId:"combopopup"})
    window.location.reload(true)
      }catch(e){
        console.log(e.message)
    }
  };

  return (
    <>
    <ToastContainer containerId={"combopopup"}/>
    



    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            Hi, Randall 👋
          </h1>
          <img 
            src="https://via.placeholder.com/48" 
            alt="Profile" 
            className="w-12 h-12 rounded-full"
          />
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl border border-gray-200 p-8 shadow-lg">
          {/* Product Summary */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              {selectedComboAppliance?.vendor?.businessName || "Vendor"}
            </h3>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {selectedComboAppliance?.title}
            </h2>
            <p className="text-3xl font-bold text-gray-900">${selectedComboAppliance?.pricing?.rentPrice}/mo</p>
          </div>

          {/* Product Image */}
          <div className="flex justify-center mb-8">
            <img 
              src={selectedComboAppliance?.images?.find(img => img.isPrimary)?.url || selectedComboAppliance?.images?.[0]?.url || 'https://via.placeholder.com/200'} 
              alt={selectedComboAppliance?.title}
              className="w-48 h-48 object-contain"
            />
          </div>

          {/* Pickup or Delivery Section */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">PICKUP OR DELIVERY</h3>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input 
                  type="radio" 
                  name="delivery" 
                  value="pickup"
                  checked={selectedDeliveryOption === 'pickup'}
                  onChange={(e) => setSelectedDeliveryOption(e.target.value)}
                  className="w-5 h-5 text-[#024a47]"
                />
                <span className="text-lg font-semibold text-gray-900">PICKUP</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input 
                  type="radio" 
                  name="delivery" 
                  value="delivery"
                  checked={selectedDeliveryOption === 'delivery'}
                  onChange={(e) => setSelectedDeliveryOption(e.target.value)}
                  className="w-5 h-5 text-[#024a47]"
                />
                <span className="text-lg font-semibold text-gray-900">DELIVERY</span>
              </label>
            </div>
          </div>

          {/* Estimated Payment */}
          <div className="mb-8 pb-8 border-b border-gray-200">
            <p className="text-lg text-gray-900">
              Estimated monthly payment: <span className="font-bold">${selectedComboAppliance?.pricing?.rentPrice} + tax</span>
            </p>
          </div>

          {/* Installation Options */}
          <div className="grid grid-cols-2 gap-4 mb-8">
  <button
    onClick={() => setSelectedInstallOption('no-install')}
    className={`py-4 px-6 rounded-lg font-semibold text-lg transition-colors border-2 ${
      selectedInstallOption === 'no-install'
        ? 'bg-[#024a47] text-white border-[#024a47]'
        : 'bg-white border-[#024a47] text-[#024a47] hover:bg-gray-50'
    }`}
  >
    NO INSTALL
  </button>
  <button
    onClick={() => setSelectedInstallOption('installation')}
    className={`py-4 px-6 rounded-lg font-semibold text-lg transition-colors border-2 ${
      selectedInstallOption === 'installation'
        ? 'bg-[#024a47] text-white border-[#024a47]'
        : 'bg-white border-[#024a47] text-[#024a47] hover:bg-gray-50'
    }`}
  >
    INSTALLATION
  </button>
</div>

          {/* Connect to Vendor Button */}
          <button
            onClick={handleFinalSubmit}
            disabled={!selectedDeliveryOption || !selectedInstallOption}
            className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-colors ${
              selectedDeliveryOption && selectedInstallOption
                ? 'bg-[#024a47] text-white hover:bg-[#035d59]'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Connect to Vendor
          </button>

          {/* Terms */}
          <p className="text-center text-sm text-gray-600 mt-4">
            By continuing, you agree to rental terms and <a href="#" className="underline">privacy</a>.
          </p>
        </div>
      </div>
    </div>
    </>
  );
};

export default ComboPopup;