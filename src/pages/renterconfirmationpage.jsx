import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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

      const response = await axios.post(`${BASE_URL}/approveOfferByUser`, 
        { 
          id, 
          totalPrice,
          paymentMethodId: paymentMethod.id,
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
          deliveryFee: 60,
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
        setOrderConfirmed(true);
        setTimeout(()=>{
navigate('/appliance')
        },500)
      }
    } catch (e) {
      console.error('Error:', e);
      alert('Error processing payment: ' + (e.response?.data?.error || e.message));
    } finally {
      setProcessing(false);
    }
  };

  
  const handleDeny = async () => {
    // Add your deny logic here
    if (window.confirm('Are you sure you want to deny this offer?')) {
      setProcessing(true);
      try {
        const id = searchParams.get('id');
        let response = await axios.patch(`${BASE_URL}/rejectRequestOffer/${id}`)
        // Call your deny endpoint
        alert('Offer denied');
        navigate('/appliance')
      } catch (e) {
        console.error('Error:', e);
        alert('Error denying offer');
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

  // Calculate total with service fee
  const calculateTotal = () => {
    const rentPrice = request?.listing?.pricing?.rentPrice || 60;
    const deliveryFee = 60;
    const subtotal = rentPrice + deliveryFee;
    const serviceFee = 12; // Can be calculated as percentage if needed
    return subtotal + serviceFee;
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
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

          {/* Cost Breakdown */}
          <div className="space-y-4 mb-6">
            <div className="flex justify-between text-xl text-gray-900">
              <span>First month rent</span>
              <span>${request.listing?.pricing?.rentPrice}</span>
            </div>
            <div className="flex justify-between text-xl text-gray-900">
              <span>Installation & delivery</span>
              <span>$60</span>
            </div>
          </div>

          {/* Total */}
          <div className="border-t border-gray-200 pt-6 mb-6">
            <div className="flex justify-between items-baseline mb-2">
              <span className="text-2xl font-bold text-gray-900">Total due</span>
              <span className="text-3xl font-bold text-gray-900">${calculateTotal()}</span>
            </div>
            <p className="text-gray-600 text-sm">Includes service fee</p>
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
          <button 
            onClick={handlePayment}
            disabled={processing || !stripe}
            className="w-full bg-[#004d40] hover:bg-[#00635a] text-white text-2xl font-semibold py-5 rounded-2xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? 'Processing...' : `Pay $${calculateTotal()}`}
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
          <div className="space-y-4 mb-6">
            <div className="flex justify-between text-xl text-gray-900">
              <span>First month rent</span>
              <span>${request.listing?.pricing?.rentPrice}</span>
            </div>
            <div className="flex justify-between text-xl text-gray-900">
              <span>Installation & delivery</span>
              <span>$60</span>
            </div>
          </div>

          {/* Total */}
          <div className="border-t border-gray-200 pt-6 mb-8">
            <div className="flex justify-between items-baseline">
              <span className="text-2xl font-bold text-gray-900">Total paid</span>
              <span className="text-3xl font-bold text-gray-900">${calculateTotal()}</span>
            </div>
          </div>

          {/* Success Message */}
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 mb-2">Your order is on the way!</p>
            <p className="text-gray-600 text-lg">We'll let you know when it's out for delivery.</p>
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
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-[#004d40]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
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

        {/* Price Section */}
        <div className="flex items-center justify-between mb-8">
          <span className="text-3xl font-bold text-gray-900">Monthly Rent</span>
          <span className="text-5xl font-bold text-gray-900">${request.listing?.pricing?.rentPrice}</span>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button 
            onClick={handleApprove}
            disabled={processing || request.approvedByUser}
            className="w-full bg-[#004d40] hover:bg-[#00635a] text-white text-2xl font-semibold py-5 rounded-2xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? 'Processing...' : request.approvedByUser ? 'Already Approved' : 'Approve Offer'}
          </button>
         
          <button 
            onClick={handleDeny}
            disabled={processing || request.approvedByUser}
            className="w-full bg-white hover:bg-gray-50 text-gray-900 text-2xl font-semibold py-5 rounded-2xl border-2 border-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Deny Offer
          </button>
        </div>
      </div>
    </div>
  );
}