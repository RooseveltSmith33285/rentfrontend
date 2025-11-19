import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios'
import { BASE_URL } from '../baseUrl';
import { useStripe, useElements, CardNumberElement, CardExpiryElement, CardCvcElement } from '@stripe/react-stripe-js';


export default function UnitPurchasePage() {
  const [searchParams] = useSearchParams();
  const stripe = useStripe();
  const elements=useElements();
  const navigate = useNavigate();
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [confirmationNumber, setConfirmationNumber] = useState('');
  const [credits,setCredits]=useState(0)
  const [downloadingReceipt, setDownloadingReceipt] = useState(false);

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      fetchRequest(id);
    } else {
      alert('Request ID not found');
      setLoading(false);
    }
  }, [searchParams]);

  const fetchRequest = async (id) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/getRequestById/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCredits(data.credits)
        setRequest(data.request);
      
    
      } else {
        alert('Error fetching request details');
      }
    } catch (e) {
      console.error('Error:', e);
      alert('Error fetching request details');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    // Show payment screen
    setShowPayment(true);
  };

  const handlePayment = async () => {
    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    try {
      const id = searchParams.get('id');
      const totalPrice = calculateTotal();
      const token = localStorage.getItem('token');

      // Create payment method using Stripe Elements
      const cardElement = elements.getElement(CardNumberElement);
      
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          email: request.user?.email,
          name: request.user?.name || request.user?.username
        }
      });

      if (error) {
        alert('Payment method creation failed: ' + error.message);
        setProcessing(false);
        return;
      }

      const totalBeforeCredits = getTotalBeforeCredits();
      const creditsApplied = getCreditsApplied();
      const finalTotal = calculateTotal();
      const newCredits = credits - creditsApplied; // Calculate remaining credits
      
      
      const response = await axios.post(`${BASE_URL}/approveOfferByUser`, 
        { 
          id, 
          totalPrice: finalTotal,
          creditsUsed: creditsApplied,
          totalBeforeCredits: totalBeforeCredits,
          paymentMethodId: paymentMethod.id,
          newCredits: newCredits,
          deliveryType: request.deliveryType || 'standard',
          installationType: request.installationType || 'professional',
          deliveryAddress: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'US'
          },
          deliveryDate: new Date().toISOString(),
          deliveryTime: 'TBD',
          monthlyRent: request.listing?.pricing?.rentPrice,
          deliveryFee: getDeliveryFee(), // ✅ Dynamic delivery fee
          installationFee: getInstallationFee(), // ✅ Dynamic installation fee
          serviceFee: 12
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data) {
        if (response.data.requiresAction) {
          const { error: confirmError } = await stripe.confirmCardPayment(
            response.data.clientSecret
          );
          
          if (confirmError) {
            alert('Payment confirmation failed: ' + confirmError.message);
            setProcessing(false);
            return;
          }
        }
        
        const confNumber = response.data.orderId || Math.floor(10000 + Math.random() * 90000);
        setConfirmationNumber(confNumber.toString());
        
        // Success alert
        alert('✅ Payment successful! Your order has been confirmed.');
        
        setOrderConfirmed(true);
      
      }
    } catch (e) {
      console.error('Error:', e);
      alert('❌ Error processing payment: ' + (e.response?.data?.error || e.message));
    } finally {
      setProcessing(false);
    }
  };

  
  const downloadReceipt = () => {
    setDownloadingReceipt(true);
  
    try {
      const receiptContent = `
  RECEIPT
  ${'-'.repeat(50)}
  
  Order Number: ${confirmationNumber}
  Date: ${new Date().toLocaleString()}
  
  ${'-'.repeat(50)}
  PRODUCT DETAILS
  ${'-'.repeat(50)}
  
  Item: ${request.listing?.title}
  Brand: ${request.listing?.brand}
  Monthly Rent: $${request.listing?.pricing?.rentPrice}
  
  ${'-'.repeat(50)}
  CHARGES
  ${'-'.repeat(50)}
  
  First Month Rent          $${request.listing?.pricing?.rentPrice}
  ${request?.deliveryType !== 'pickup' ? `Delivery Fee              $${getDeliveryFee()}` : 'Delivery Fee              $0.00 (Self Pickup)'}
  ${request?.installationType !== 'no-install' ? `Installation Fee          $${getInstallationFee()}` : 'Installation Fee          $0.00 (Self Installation)'}
  Service Fee               $12.00
  
  ${getCreditsApplied() > 0 ? `
  Subtotal                  $${getTotalBeforeCredits().toFixed(2)}
  Credits Applied          -$${getCreditsApplied().toFixed(2)}
  ` : ''}
  ${'-'.repeat(50)}
  TOTAL PAID                $${calculateTotal().toFixed(2)}
  ${'-'.repeat(50)}
  
  ${getCreditsApplied() > 0 ? `
  Credits Used: $${getCreditsApplied().toFixed(2)}
  Remaining Credits: $${(credits - getCreditsApplied()).toFixed(2)}
  
  ` : ''}
  DELIVERY INFORMATION
  ${'-'.repeat(50)}
  
  Delivery Type: ${request?.deliveryType || 'Standard'}
  Installation Type: ${request?.installationType || 'Professional'}
  
  ${'-'.repeat(50)}
  
  Thank you for your order!
  For support, contact: support@rentsimple.com
  
  ${'-'.repeat(50)}
      `.trim();
  
      // Create and download file
      const blob = new Blob([receiptContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `receipt-${confirmationNumber}-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
  
      setDownloadingReceipt(false);
    } catch (error) {
      console.error('Error downloading receipt:', error);
      alert('Failed to download receipt');
      setDownloadingReceipt(false);
    }
  };

  const handleDeny = async () => {
    // Add your deny logic here
    if (window.confirm('Are you sure you want to deny this offer?')) {
      setProcessing(true);
      try {
        const id = searchParams.get('id');
        let response = await axios.patch(`${BASE_URL}/rejectRequestOffer/${id}`)
        
        // Success alert
        alert('✅ Offer denied successfully');
        
        navigate('/appliance')
      } catch (e) {
        console.error('Error:', e);
        alert('❌ Error denying offer: ' + (e.response?.data?.error || e.message));
      } finally {
        setProcessing(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004d40] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading request details...</p>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">Request not found</p>
        </div>
      </div>
    );
  }

  const getPrimaryImage = (images) => {
    if (!images || images.length === 0) return 'https://via.placeholder.com/400';
    const primary = images.find(img => img.isPrimary);
    return primary ? primary.url : images[0].url;
  };


  const getDeliveryFee = () => {
    if (request?.deliveryType === 'pickup') {
      return 0;
    }
    return 30; // delivery = $30
  };
  
  const getInstallationFee = () => {
    if (request?.installationType === 'no-install') {
      return 0;
    }
    return 30; // installation = $30
  };
  
  // Calculate total with service fee
// Calculate total with service fee and apply credits
const calculateTotal = () => {
  const rentPrice = request?.listing?.pricing?.rentPrice || 60;
  const deliveryFee = getDeliveryFee();
  const installationFee = getInstallationFee();
  const subtotal = rentPrice + deliveryFee + installationFee;
  const serviceFee = 12;
  const totalBeforeCredits = subtotal + serviceFee;
  
  // Apply credits (minimum $1 if credits are used)
  const afterCredits = totalBeforeCredits - credits;
  const finalTotal = credits > 0 && afterCredits < 1 ? 1 : Math.max(0, afterCredits);
  return finalTotal;
};


// Helper to get amount before credits
const getTotalBeforeCredits = () => {
  const rentPrice = request?.listing?.pricing?.rentPrice || 60;
  const deliveryFee = getDeliveryFee();
  const installationFee = getInstallationFee();
  const subtotal = rentPrice + deliveryFee + installationFee;
  const serviceFee = 12;
  return subtotal + serviceFee;
};

// Helper to get credits applied
const getCreditsApplied = () => {
  const totalBefore = getTotalBeforeCredits();
  // If credits would bring total below $1, only apply credits to leave $1 remaining
  if (credits >= totalBefore) {
    return totalBefore - 1;
  }
  return credits;
};

  // Show Payment Screen
 // Show Payment Screen
 if (showPayment && !orderConfirmed) {
  const elementOptions = {
    style: {
      base: {
        fontSize: '18px',
        color: '#1f2937',
        '::placeholder': {
          color: '#9ca3af',
        },
      },
    },
  };



  


  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 relative">
      {/* Loading Overlay */}
      {processing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 shadow-xl max-w-md w-full mx-4">
            <div className="text-center">
              <div className="relative inline-flex items-center justify-center mb-6">
                {/* Outer rotating circle */}
                <div className="animate-spin rounded-full h-24 w-24 border-4 border-gray-200"></div>
                {/* Inner rotating circle */}
                <div className="absolute animate-spin rounded-full h-24 w-24 border-4 border-[#004d40] border-t-transparent"></div>
                {/* Center icon */}
                <div className="absolute">
                  <svg className="w-10 h-10 text-[#004d40]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-2">Processing Payment...</p>
              <p className="text-gray-600">Please wait while we process your transaction</p>
              <p className="text-sm text-gray-500 mt-4">Do not close this window</p>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Payment</h1>
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-[#004d40]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm">
          {/* Product Header */}
          <div className="flex items-center space-x-4 mb-8 pb-8 border-b border-gray-200">
            <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center">
              <img 
                src={request.images?.[0]?.front || 'https://via.placeholder.com/96'} 
                alt={request.listing?.title}
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{request.listing?.title}</h2>
              <p className="text-2xl font-semibold text-gray-900">${request.listing?.pricing?.rentPrice}/mo</p>
            </div>
          </div>
{/* Available Credits Banner */}
{credits > 0 && (
  <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-5">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-green-700 uppercase tracking-wide">Available Credits</p>
          <p className="text-3xl font-bold text-green-900">${credits.toFixed(2)}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm text-green-700 font-medium">Auto-applied</p>
        <p className="text-xs text-green-600">to your order</p>
      </div>
    </div>
  </div>
)}

          {/* Cost Breakdown */}
{/* Cost Breakdown */}
{/* Cost Breakdown */}
<div className="space-y-4 mb-6">
  <div className="flex justify-between text-xl text-gray-900">
    <span>First month rent</span>
    <span>${request.listing?.pricing?.rentPrice}</span>
  </div>
  
  {/* Show delivery fee only if not pickup */}
  {request?.deliveryType !== 'pickup' && (
    <div className="flex justify-between text-xl text-gray-900">
      <span>Delivery</span>
      <span>${getDeliveryFee()}</span>
    </div>
  )}
  
  {/* Show installation fee only if not no-install */}
  {request?.installationType !== 'no-install' && (
    <div className="flex justify-between text-xl text-gray-900">
      <span>Installation</span>
      <span>${getInstallationFee()}</span>
    </div>
  )}
  
  {/* Show message if both are free */}
  {request?.deliveryType === 'pickup' && request?.installationType === 'no-install' && (
    <div className="flex items-center gap-2 text-green-700 bg-green-50 -mx-4 px-4 py-2 rounded-lg">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span className="font-semibold">Self pickup & installation - No extra fees!</span>
    </div>
  )}
  
  <div className="flex justify-between text-lg text-gray-600">
    <span>Service fee</span>
    <span>$12</span>
  </div>
</div>
{/* Credits Used Section - ADD THIS */}
{getCreditsApplied() > 0 && (
  <div className="border-t border-gray-200 pt-4 mb-4">
    <div className="flex justify-between items-center text-xl bg-green-50 -mx-4 px-4 py-3 rounded-xl">
      <div className="flex items-center space-x-2">
        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="font-semibold text-green-700">Credits Used</span>
      </div>
      <span className="font-bold text-green-700">-${getCreditsApplied().toFixed(2)}</span>
    </div>
  </div>
)}

{/* Total */}


{/* Total */}
<div className="border-t border-gray-200 pt-6 mb-8"></div>

          {/* Total */}
        {/* Total */}
<div className="border-t border-gray-200 pt-6 mb-6">
  {credits > 0 && (
    <>
      <div className="flex justify-between text-xl text-gray-900 mb-3">
        <span>Subtotal</span>
        <span>${getTotalBeforeCredits()}</span>
      </div>
      
      <div className="flex justify-between items-center text-xl mb-4 bg-green-50 -mx-4 px-4 py-3 rounded-xl">
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-semibold text-green-700">Credits Applied</span>
        </div>
        <span className="font-bold text-green-700">-${getCreditsApplied().toFixed(2)}</span>
      </div>
    </>
  )}
  
  <div className="flex justify-between items-baseline mb-2 pt-4 border-t border-gray-200">
    <span className="text-2xl font-bold text-gray-900">Total due</span>
    <span className="text-3xl font-bold text-gray-900">${calculateTotal().toFixed(2)}</span>
  </div>
  <p className="text-gray-600 text-sm">
    {credits > 0 ? 'After credits applied' : 'Includes service fee'}
  </p>
</div>

          {/* Card Details Form with Stripe Elements */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Card Number</label>
              <div className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus-within:border-[#004d40]">
                <CardNumberElement options={elementOptions} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Expiry Date</label>
                <div className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus-within:border-[#004d40]">
                  <CardExpiryElement options={elementOptions} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">CVC</label>
                <div className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus-within:border-[#004d40]">
                  <CardCvcElement options={elementOptions} />
                </div>
              </div>
            </div>
          </div>

          {/* Pay Button */}
      {/* Pay Button */}
      <button 
  onClick={handlePayment}
  disabled={processing || !stripe}
  className="w-full bg-[#004d40] hover:bg-[#00635a] text-white text-2xl font-semibold py-5 rounded-2xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
>
  {processing ? (
    <>
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
      Processing Payment...
    </>
  ) : (
    `Pay $${calculateTotal().toFixed(2)}`
  )}
</button>

          <p className="text-center text-gray-600 mt-4">By continuing, you agree to rental terms.</p>
        </div>
      </div>
    </div>
  );
}

  // Show Order Confirmed Screen
 // Show Order Confirmed Screen
if (orderConfirmed) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-[#004d40] mb-3">Order Confirmed</h1>
          <p className="text-2xl text-gray-600">Order #{confirmationNumber}</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm">
          {/* Product Header */}
          <div className="flex items-center space-x-4 mb-8 pb-8 border-b border-gray-200">
            <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center">
              <img 
                src={request.images?.[0]?.front || 'https://via.placeholder.com/96'} 
                alt={request.listing?.title}
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{request.listing?.title}</h2>
              <p className="text-2xl font-semibold text-gray-900">${request.listing?.pricing?.rentPrice}/mo</p>
            </div>
          </div>

          {/* Cost Breakdown */}
      {/* Cost Breakdown */}
      <div className="space-y-4 mb-6">
  <div className="flex justify-between text-xl text-gray-900">
    <span>First month rent</span>
    <span>${request.listing?.pricing?.rentPrice}</span>
  </div>
  
  {/* Show delivery fee only if not pickup */}
  {request?.deliveryType !== 'pickup' && (
    <div className="flex justify-between text-xl text-gray-900">
      <span>Delivery</span>
      <span>${getDeliveryFee()}</span>
    </div>
  )}
  
  {/* Show installation fee only if not no-install */}
  {request?.installationType !== 'no-install' && (
    <div className="flex justify-between text-xl text-gray-900">
      <span>Installation</span>
      <span>${getInstallationFee()}</span>
    </div>
  )}
  
  {/* Show message if both are free */}
  {request?.deliveryType === 'pickup' && request?.installationType === 'no-install' && (
    <div className="flex items-center gap-2 text-green-700 bg-green-50 -mx-4 px-4 py-2 rounded-lg">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span className="font-semibold">Self pickup & installation - No extra fees!</span>
    </div>
  )}
  
  <div className="flex justify-between text-lg text-gray-600">
    <span>Service fee</span>
    <span>$12</span>
  </div>
</div>
{/* Credits Used Section - ADD THIS */}
{getCreditsApplied() > 0 && (
  <div className="border-t border-gray-200 pt-4 mb-4">
    <div className="flex justify-between items-center text-xl bg-green-50 -mx-4 px-4 py-3 rounded-xl">
      <div className="flex items-center space-x-2">
        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="font-semibold text-green-700">Credits Used</span>
      </div>
      <span className="font-bold text-green-700">-${getCreditsApplied().toFixed(2)}</span>
    </div>
  </div>
)}

{/* Total */}
<div className="border-t border-gray-200 pt-6 mb-8"></div>
          {/* Total */}
          <div className="border-t border-gray-200 pt-6 mb-8">
          <div className="flex justify-between items-baseline">
  <span className="text-2xl font-bold text-gray-900">Total paid</span>
  <span className="text-3xl font-bold text-gray-900">${calculateTotal().toFixed(2)}</span>
</div>
          </div>

          {/* Success Message */}
          <div className="text-center">
  <p className="text-2xl font-bold text-gray-900 mb-2">Your order is on the way!</p>
  <p className="text-gray-600 text-lg mb-6">We'll let you know when it's out for delivery.</p>
  
  {/* Download Receipt Button */}
  <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
    <button
      onClick={downloadReceipt}
      disabled={downloadingReceipt}
      className="inline-flex items-center space-x-2 bg-[#004d40] hover:bg-[#00635a] text-white font-semibold py-3 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {downloadingReceipt ? (
        <>
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          <span>Downloading...</span>
        </>
      ) : (
        <>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span>Download Receipt</span>
        </>
      )}
    </button>

    <Link
      to="/renterdashboard"
      className="inline-flex items-center space-x-2 bg-white hover:bg-gray-50 text-[#004d40] font-semibold py-3 px-6 rounded-xl border-2 border-[#004d40] transition-colors"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
      <span>Go to Dashboard</span>
    </Link>
  </div>
</div>
        </div>
      </div>
    </div>
  );
}

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Keep as is */}
      <div className="bg-white rounded-t-3xl shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#004d40] rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">RentSimple</h1>
          </div>
         
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Title */}
        <h2 className="text-4xl font-bold text-gray-900 mb-8">Unit for Purchase</h2>

        {/* Product Info */}
        <div className="bg-white rounded-2xl p-6 mb-8 shadow-sm">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">{request.listing?.title}</h3>
          <div className="grid grid-cols-2 gap-4 text-gray-700">
            <div>
              <span className="font-semibold">Brand:</span> {request.listing?.brand}
            </div>
            <div>
              <span className="font-semibold">Category:</span> <span className="capitalize">{request.listing?.category}</span>
            </div>
            <div>
              <span className="font-semibold">Condition:</span> {request.listing?.condition}
            </div>
            {request.deliveryType && (
              <div>
                <span className="font-semibold">Delivery:</span> <span className="capitalize">{request.deliveryType}</span>
              </div>
            )}
          </div>
        </div>

        {/* Photos Section */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Photos</h3>
          <div className="grid grid-cols-3 gap-4">
            {request.images && request.images.length > 0 && request.images[0].front && (
              <div className="flex flex-col items-center">
                <div className="w-full aspect-square bg-gray-200 rounded-2xl overflow-hidden mb-3">
                  <img 
                    src={request.images[0].front} 
                    alt="Front view"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-lg font-semibold text-gray-900">Front</span>
              </div>
            )}

            {request.images && request.images.length > 0 && request.images[0].side && (
              <div className="flex flex-col items-center">
                <div className="w-full aspect-square bg-gray-200 rounded-2xl overflow-hidden mb-3">
                  <img 
                    src={request.images[0].side} 
                    alt="Side view"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-lg font-semibold text-gray-900">Side</span>
              </div>
            )}

            {request.images && request.images.length > 0 && request.images[0].serial_tag && (
              <div className="flex flex-col items-center">
                <div className="w-full aspect-square bg-gray-200 rounded-2xl overflow-hidden mb-3">
                  <img 
                    src={request.images[0].serial_tag} 
                    alt="Serial tag"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-lg font-semibold text-gray-900">Serial Tag</span>
              </div>
            )}

            {request.images && request.images.length > 0 && request.images[0].condition && (
              <div className="flex flex-col items-center">
                <div className="w-full aspect-square bg-gray-200 rounded-2xl overflow-hidden mb-3">
                  <img 
                    src={request.images[0].condition} 
                    alt="Condition"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-lg font-semibold text-gray-900">Condition</span>
              </div>
            )}
          </div>
        </div>

        {/* Verification Badge */}
        {request.approvedByVendor && (
          <div className="flex items-center space-x-3 mb-8 pb-8 border-b border-gray-300">
            <div className="w-12 h-12 bg-[#004d40] rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-2xl font-semibold text-gray-900">Proper operation verified</span>
          </div>
        )}

{/* Credits Available Badge */}
{credits > 0 && (
  <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-6">
    <div className="flex items-center space-x-4">
      <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div>
        <p className="text-sm font-semibold text-green-700 uppercase tracking-wide mb-1">You have credits!</p>
        <p className="text-4xl font-bold text-green-900">${credits.toFixed(2)}</p>
        <p className="text-sm text-green-600 mt-1">Will be applied at checkout</p>
      </div>
    </div>
  </div>
)}


        {/* Price Section */}
        <div className="flex items-center justify-between mb-8">
          <span className="text-3xl font-bold text-gray-900">Monthly Rent</span>
          <span className="text-5xl font-bold text-gray-900">${request.listing?.pricing?.rentPrice}</span>
        </div>

        {/* Action Buttons */}
    {/* Action Buttons */}
    <div className="space-y-4">
          <button 
            onClick={handleApprove}
            disabled={processing || request.approvedByUser}
            className="w-full bg-[#004d40] hover:bg-[#00635a] text-white text-2xl font-semibold py-5 rounded-2xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {processing ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                Processing...
              </>
            ) : request.approvedByUser ? (
              'Already Approved'
            ) : (
              'Approve Offer'
            )}
          </button>
         
          <button 
            onClick={handleDeny}
            disabled={processing || request.approvedByUser}
            className="w-full bg-white hover:bg-gray-50 text-gray-900 text-2xl font-semibold py-5 rounded-2xl border-2 border-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {processing ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mr-3"></div>
                Processing...
              </>
            ) : (
              'Deny Offer'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}