import { useState,useEffect} from "react";
import React from "react";
import { X,Zap } from "lucide-react";

function BoostingInterface({ setCurrentPage }) {
    const [selectedListing, setSelectedListing] = useState(null);
    const [boostAmount, setBoostAmount] = useState(5);
    const [boostDuration, setBoostDuration] = useState(7);
  
    const listings = [
      { id: 1, name: 'Samsung Refrigerator', currentViews: 234, status: 'Active' },
      { id: 2, name: 'LG Washing Machine', currentViews: 189, status: 'Active' },
      { id: 3, name: 'Whirlpool Dishwasher', currentViews: 156, status: 'Active' },
    ];
  
    const estimatedReach = boostAmount * 50 * (boostDuration / 7);
  
    return (
      <div className="min-h-screen pb-20">
        <header className="bg-white shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center space-x-3">
              <button onClick={() => setCurrentPage('dashboard')} className="text-gray-600 hover:text-[#024a47]">
                <X className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-[#024a47]">Boost Your Listings</h1>
                <p className="text-sm text-gray-600">Increase visibility and reach more customers</p>
              </div>
            </div>
          </div>
        </header>
  
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Listing Selection */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-[#024a47] mb-4">Select Listing to Boost</h2>
              <div className="space-y-3">
                {listings.map((listing) => (
                  <button
                    key={listing.id}
                    onClick={() => setSelectedListing(listing)}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                      selectedListing?.id === listing.id
                        ? 'border-[#024a47] bg-[#024a4708]'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{listing.name}</h3>
                        <p className="text-sm text-gray-600">{listing.currentViews} current views</p>
                      </div>
                      <Zap className={`w-5 h-5 ${selectedListing?.id === listing.id ? 'text-[#024a47]' : 'text-gray-400'}`} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
  
            {/* Boost Configuration */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-[#024a47] mb-4">Boost Settings</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Boost Amount: ${boostAmount}
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    step="5"
                    value={boostAmount}
                    onChange={(e) => setBoostAmount(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-600 mt-1">
                    <span>$5</span>
                    <span>$100</span>
                  </div>
                </div>
  
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Duration: {boostDuration} days
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    value={boostDuration}
                    onChange={(e) => setBoostDuration(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-600 mt-1">
                    <span>1 day</span>
                    <span>30 days</span>
                  </div>
                </div>
  
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
                  <h3 className="font-semibold text-gray-900 mb-2">Estimated Results</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Additional Reach:</span>
                      <span className="font-bold text-purple-700">~{Math.round(estimatedReach)} views</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Cost per day:</span>
                      <span className="font-bold text-purple-700">${(boostAmount / boostDuration).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
  
                <button
                  disabled={!selectedListing}
                  className={`w-full py-4 rounded-lg font-semibold text-lg transition-all ${
                    selectedListing
                      ? 'bg-[#024a47] text-white hover:bg-[#035d59]'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {selectedListing ? `Boost for $${boostAmount}` : 'Select a listing first'}
                </button>
              </div>
            </div>
          </div>
  
          {/* Active Boosts */}
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h2 className="text-xl font-bold text-[#024a47] mb-4">Active Boosts</h2>
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">Samsung Refrigerator</h3>
                  <span className="px-3 py-1 bg-yellow-200 text-yellow-800 rounded-full text-sm font-semibold">
                    Active
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Investment</p>
                    <p className="font-bold text-gray-900">$25</p>
                  </div>
                  <div>
                    <p className="text-gray-600">New Views</p>
                    <p className="font-bold text-gray-900">+342</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Time Left</p>
                    <p className="font-bold text-gray-900">3 days</p>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>70%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '70%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  export default BoostingInterface