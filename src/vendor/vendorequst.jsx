import React, { useState } from 'react';
import { Check } from 'lucide-react';

export default function PreDeliveryProcess() {
  const [photos, setPhotos] = useState({
    front: false,
    side: false,
    serialTag: false,
    condition: false
  });

  const togglePhoto = (type) => {
    setPhotos(prev => ({ ...prev, [type]: !prev[type] }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-sm p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              </svg>
            </div>
            <h1 className="text-3xl font-bold">RentSimple</h1>
          </div>
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-700" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path>
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-4xl font-bold mb-8">Pre-Delivery Process</h2>

        {/* Photos Section */}
        <div className="border border-gray-200 rounded-2xl p-6 mb-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-8 h-8 bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
              <Check className="w-5 h-5 text-white" strokeWidth={3} />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-2">Photos</h3>
              <p className="text-gray-700 text-lg">
                Capture front, side, serial tag, and condition photos of the unit
              </p>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-4">
            {[
              { key: 'front', label: 'Front' },
              { key: 'side', label: 'Side' },
              { key: 'serialTag', label: 'Serial tag' },
              { key: 'condition', label: 'Condition' }
            ].map((item, idx) => (
              <button
                key={item.key}
                onClick={() => togglePhoto(item.key)}
                className={`aspect-square rounded-2xl border-2 flex flex-col items-center justify-center gap-3 transition-all ${
                  photos[item.key]
                    ? 'bg-green-100 border-green-300'
                    : 'bg-gray-100 border-gray-300'
                }`}
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  photos[item.key] ? 'bg-green-200' : 'bg-gray-300'
                }`}>
                  {photos[item.key] && (
                    <Check className="w-6 h-6 text-green-700" strokeWidth={3} />
                  )}
                </div>
                <span className="text-sm font-medium text-gray-900">{item.label}</span>
              </button>
            ))}
            <div className="aspect-square rounded-2xl border-2 bg-gray-100 border-gray-300 flex items-center justify-center">
              <div className="w-12 h-12 rounded-lg bg-gray-300"></div>
            </div>
          </div>
        </div>

        {/* Operational Test Section */}
        <div className="border border-gray-200 rounded-2xl p-6 mb-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-8 h-8 bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
              <Check className="w-5 h-5 text-white" strokeWidth={3} />
            </div>
            <h3 className="text-2xl font-bold">Operational Test</h3>
          </div>

          <div className="ml-12 space-y-3">
            <p className="text-gray-700 text-lg mb-4">Perform function checks</p>
            
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                <Check className="w-4 h-4 text-white" strokeWidth={3} />
              </div>
              <span className="text-lg text-gray-900">Verify proper operation</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                <Check className="w-4 h-4 text-white" strokeWidth={3} />
              </div>
              <span className="text-lg text-gray-900">Desired location confirmed</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                <Check className="w-4 h-4 text-white" strokeWidth={3} />
              </div>
              <span className="text-lg text-gray-900">Safe to install</span>
            </div>
          </div>
        </div>

        {/* Unit Ready Section */}
        <div className="border border-gray-200 rounded-2xl p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
              <Check className="w-5 h-5 text-white" strokeWidth={3} />
            </div>
            <h3 className="text-2xl font-bold">Unit Ready for Purchase & Delivery</h3>
          </div>
        </div>

        {/* Submit Button */}
        <button className="w-full bg-green-900 hover:bg-green-800 text-white text-xl font-semibold py-4 rounded-2xl transition-colors">
          Submit
        </button>
      </div>
    </div>
  );
}