import React, { useState } from 'react';

export default function PaymentOrderFlow() {
  const [step, setStep] = useState(1);
  const [showConfetti, setShowConfetti] = useState(false);

  const handlePayment = () => {
    setShowConfetti(true);
    setTimeout(() => {
      setStep(2);
      setShowConfetti(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 relative">
      {/* Confetti animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: '1s'
              }}
            >
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
          ))}
        </div>
      )}

      <div className="max-w-lg mx-auto">
        {step === 1 ? (
          // Step 1: Payment Page
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-4xl font-bold text-gray-900">Payment</h1>
              <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path>
                </svg>
              </div>
            </div>

            {/* Payment Card */}
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
              {/* Product */}
              <div className="flex items-center gap-4 pb-6 border-b border-gray-200">
                <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg className="w-16 h-16 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="9"></circle>
                    <circle cx="12" cy="12" r="4"></circle>
                    <line x1="12" y1="3" x2="12" y2="7"></line>
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Washer & Dryer</h2>
                  <p className="text-2xl font-semibold text-gray-900">$60/mo</p>
                </div>
              </div>

              {/* Pricing Details */}
              <div className="py-6 space-y-3">
                <div className="flex items-center justify-between text-lg">
                  <span className="text-gray-700">First month rent</span>
                  <span className="font-semibold text-gray-900">$60</span>
                </div>
                <div className="flex items-center justify-between text-lg">
                  <span className="text-gray-700">Installation & delivery</span>
                  <span className="font-semibold text-gray-900">$60</span>
                </div>
              </div>

              {/* Total */}
              <div className="pt-4 border-t border-gray-200 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl font-bold text-gray-900">Total due</span>
                  <span className="text-xl font-bold text-gray-900">$132</span>
                </div>
                <p className="text-sm text-gray-500">Includes service fee</p>
              </div>

              {/* Pay Button */}
              <button
                onClick={handlePayment}
                className="w-full bg-green-900 hover:bg-green-800 text-white text-xl font-semibold py-4 rounded-xl transition-colors mb-4"
              >
                Pay $132
              </button>

              <p className="text-center text-sm text-gray-600">
                By continuing, you agree to rental terms.
              </p>
            </div>

            {/* Order Confirmed Preview (with scribbles) */}
            <div className="bg-white rounded-2xl shadow-sm p-6 relative overflow-hidden opacity-50">
              <div className="relative z-10">
                <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Order confirmed</h2>
                <p className="text-center text-gray-600">Confirmation #54321</p>
              </div>
              {/* Scribble overlay */}
              <svg className="absolute inset-0 w-full h-full z-20 pointer-events-none" viewBox="0 0 400 200">
                <path d="M50,100 Q100,50 150,100 T250,100 T350,100" stroke="#666" strokeWidth="2" fill="none" opacity="0.3" />
                <path d="M80,80 Q120,120 160,80 T240,80" stroke="#666" strokeWidth="2" fill="none" opacity="0.3" />
                <path d="M100,120 L200,60 L300,140 L150,90" stroke="#666" strokeWidth="2" fill="none" opacity="0.3" />
                <circle cx="200" cy="100" r="60" stroke="#666" strokeWidth="2" fill="none" opacity="0.2" />
                <path d="M60,140 Q200,40 340,160" stroke="#666" strokeWidth="2" fill="none" opacity="0.3" />
              </svg>
            </div>
          </div>
        ) : (
          // Step 2: Order Confirmed Page
          <div className="pt-8">
            <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
              {/* Header */}
              <h1 className="text-4xl font-bold text-gray-900 text-center mb-3">Order Confirmed</h1>
              <p className="text-center text-gray-600 text-lg mb-8">Order #1234</p>

              {/* Product */}
              <div className="flex items-center gap-4 pb-6 mb-6 border-b border-gray-200">
                <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg className="w-16 h-16 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="9"></circle>
                    <circle cx="12" cy="12" r="4"></circle>
                    <line x1="12" y1="3" x2="12" y2="7"></line>
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Washer & Dryer</h2>
                  <p className="text-2xl font-semibold text-gray-900">$60/mo</p>
                </div>
              </div>

              {/* Pricing Details */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-lg">
                  <span className="text-gray-700">First month rent</span>
                  <span className="font-semibold text-gray-900">$60</span>
                </div>
                <div className="flex items-center justify-between text-lg">
                  <span className="text-gray-700">Installation & delivery</span>
                  <span className="font-semibold text-gray-900">$60</span>
                </div>
              </div>

              {/* Total */}
              <div className="pt-4 border-t border-gray-200 mb-8">
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-gray-900">Total due</span>
                  <span className="text-xl font-bold text-gray-900">$132</span>
                </div>
              </div>

              {/* Success Message */}
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Your order is on the way!</h3>
                <p className="text-gray-600 text-lg">We'll let you know when it's out for delivery.</p>
              </div>

              {/* Track Button */}
              <button className="w-full bg-green-900 hover:bg-green-800 text-white text-xl font-semibold py-4 rounded-xl transition-colors">
                Track delivery
              </button>
            </div>

            {/* Final Confirmation Button */}
            <button className="w-full bg-gray-600 hover:bg-gray-700 text-white text-lg font-semibold py-4 rounded-xl transition-colors">
              final confirmation
            </button>
          </div>
        )}
      </div>
    </div>
  );
}