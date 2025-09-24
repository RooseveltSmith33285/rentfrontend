import { ArrowLeft, Home, CheckCircle, ChevronDown } from "lucide-react";
import React, { useState } from "react";

export default function ConfirmSubmitPage() {
  const [showTechDetails, setShowTechDetails] = useState(false);

  const handleConfirmOrder = () => {
    alert("Order confirmed successfully!");
  };

  return (
    <div className="min-h-screen bg-[#f3f4e6] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl bg-white rounded-lg shadow-lg overflow-hidden mx-auto">
        
        {/* Header with curved background */}
        <div className="relative bg-[#024a47] px-4 sm:px-6 md:px-8 pt-6 sm:pt-8 pb-12 sm:pb-16 text-center">
          {/* Status bar mockup */}
          <div className="flex justify-between items-center mb-4 text-white text-xs sm:text-sm font-medium">
            <span>11:28</span>
            <div className="flex items-center gap-1">
              <div className="flex gap-1">
                <div className="w-1 h-3 bg-white rounded-full"></div>
                <div className="w-1 h-3 bg-white rounded-full"></div>
                <div className="w-1 h-3 bg-white rounded-full"></div>
                <div className="w-1 h-3 bg-white opacity-50 rounded-full"></div>
              </div>
              <span className="ml-2">📶</span>
              <span>🔋</span>
            </div>
          </div>

          {/* Back arrow */}
          <div className="flex justify-start mb-4">
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white cursor-pointer" />
          </div>

          {/* Logo and title */}
          <div className="mb-4">
            <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-white rounded-lg mb-3">
              <Home className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-[#024a47]" />
            </div>
          </div>
          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white mb-1">RentSimple</h1>
          <p className="text-xs sm:text-sm md:text-base text-white opacity-90">Rent made simples</p>

          {/* Curved bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-[#f3f4e6] rounded-t-[2rem]"></div>
        </div>

        {/* Content */}
        <div className="px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8 -mt-4">
          {/* Title */}
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#024a47]">
              Confirm & Submit
            </h2>
          </div>

          {/* Order Details */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-5 mb-4 sm:mb-6 shadow-sm">
            <div className="flex items-start gap-3 sm:gap-4">
              {/* Product icon */}
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#024a47] rounded-lg flex items-center justify-center flex-shrink-0">
                <Home className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-sm sm:text-base font-medium text-gray-600">Orefer SL 25</h3>
                    <h4 className="text-base sm:text-lg font-bold text-gray-900">Washer & Dryer</h4>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm sm:text-base">
                  <span className="text-gray-600">$80/month</span>
                  <span className="text-gray-600">$0 | 70086</span>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Info */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-5 mb-4 sm:mb-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-medium text-[#4a9b8e] mb-1">Delivery</h3>
                <p className="text-xs sm:text-sm text-[#4a9b8e]">& install, fee free</p>
              </div>
              <div className="bg-[#024a47] text-white px-3 py-1 rounded-full">
                <span className="text-xs sm:text-sm font-medium">Free</span>
              </div>
            </div>
          </div>

          {/* Technician Info */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-5 mb-6 sm:mb-8 shadow-sm">
            <div className="flex items-start gap-3 sm:gap-4">
              {/* Avatar */}
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-600 rounded-full flex-shrink-0 overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center">
                  <span className="text-white font-bold text-sm sm:text-base">J</span>
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">James</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-2">Certified RentSimple Technician</p>
                
                <button 
                  onClick={() => setShowTechDetails(!showTechDetails)}
                  className="flex items-center gap-2 text-[#4a9b8e] text-sm sm:text-base"
                >
                  <CheckCircle className="w-4 h-4 text-[#4a9b8e]" />
                  <span className="font-medium">Certified RentSimple Tech</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showTechDetails ? 'rotate-180' : ''}`} />
                </button>
                
                {showTechDetails && (
                  <div className="mt-2 text-sm text-gray-600">
                    <p>Background Shocked & Insured</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Confirm Button */}
          <button 
            onClick={handleConfirmOrder}
            className="w-full bg-[#024a47] hover:bg-[#024a47] text-white font-bold py-3 sm:py-4 px-4 rounded-lg transition-colors text-base sm:text-lg lg:text-xl"
          >
            Confirm Order
          </button>
        </div>
      </div>
    </div>
  );
}