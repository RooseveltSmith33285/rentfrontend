import React, { useState, useEffect, useRef } from "react";


function SubscriptionComponent() {
    const [selectedPlan, setSelectedPlan] = useState('pro');
  
    const plans = [
      {
        id: 'basic',
        name: 'Basic',
        price: 29,
        features: [
          'Up to 10 active listings',
          'Basic analytics',
          'Community posting',
          'Email support'
        ]
      },
      {
        id: 'pro',
        name: 'Pro',
        price: 79,
        popular: true,
        features: [
          'Unlimited listings',
          'Advanced analytics',
          'Priority community posting',
          'Boost credits ($20/mo)',
          'Priority support',
          'Featured vendor badge'
        ]
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        price: 199,
        features: [
          'Everything in Pro',
          'Dedicated account manager',
          'Custom branding',
          'API access',
          'Boost credits ($100/mo)',
          'White-glove onboarding'
        ]
      }
    ];
  
    return (
      <div className="min-h-screen pb-20">
        <header className="bg-white shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center space-x-3">
              <button onClick={() => setCurrentPage('dashboard')} className="text-gray-600 hover:text-[#024a47]">
                <X className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-[#024a47]">Vendor Subscription</h1>
                <p className="text-sm text-gray-600">Choose the plan that fits your business</p>
              </div>
            </div>
          </div>
        </header>
  
        <div className="max-w-6xl mx-auto px-4 py-12">
          {/* Current Plan Banner */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Current Plan: Free Trial</h3>
                <p className="text-gray-600">14 days remaining • Upgrade to unlock all features</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-[#024a47]">$0</p>
                <p className="text-sm text-gray-600">per month</p>
              </div>
            </div>
          </div>
  
          {/* Plans Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`bg-white rounded-lg shadow-md overflow-hidden transition-all ${
                  selectedPlan === plan.id ? 'ring-2 ring-[#024a47] transform scale-105' : ''
                } ${plan.popular ? 'relative' : ''}`}
              >
                {plan.popular && (
                  <div className="bg-yellow-400 text-center py-2 font-semibold text-sm">
                    Most Popular
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-[#024a47]">${plan.price}</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`w-full py-3 rounded-lg font-semibold transition-all ${
                      selectedPlan === plan.id
                        ? 'bg-[#024a47] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {selectedPlan === plan.id ? 'Selected' : 'Select Plan'}
                  </button>
                </div>
              </div>
            ))}
          </div>
  
          {/* Payment Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-[#024a47] mb-6">Complete Your Subscription</h2>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Card Number</label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-4 py-3 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#024a47]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Expiry</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="w-full px-4 py-3 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#024a47]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">CVC</label>
                  <input
                    type="text"
                    placeholder="123"
                    className="w-full px-4 py-3 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#024a47]"
                  />
                </div>
              </div>
            </div>
  
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700">Selected Plan:</span>
                <span className="font-bold text-gray-900">
                  {plans.find(p => p.id === selectedPlan)?.name}
                </span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700">Monthly Cost:</span>
                <span className="font-bold text-gray-900">
                  ${plans.find(p => p.id === selectedPlan)?.price}
                </span>
              </div>
              <div className="border-t border-blue-300 my-2"></div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-900">Total Due Today:</span>
                <span className="text-2xl font-bold text-[#024a47]">
                  ${plans.find(p => p.id === selectedPlan)?.price}
                </span>
              </div>
            </div>
  
            <button className="w-full bg-[#024a47] hover:bg-[#035d59] text-white font-semibold py-4 rounded-lg transition-all text-lg">
              Subscribe Now with Stripe
            </button>
  
            <p className="text-center text-sm text-gray-600 mt-4">
              Secured by Stripe • Cancel anytime • 30-day money-back guarantee
            </p>
          </div>
        </div>
      </div>
    );
  }


  export default SubscriptionComponent;