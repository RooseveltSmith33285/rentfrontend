import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios'
import { BASE_URL } from '../baseUrl';
import { useStripe, useElements, CardNumberElement, CardExpiryElement, CardCvcElement } from '@stripe/react-stripe-js';
import SupportChatWidget from './useradminchat';
import ImageLightbox from '../components/lightbox';
import { toast, ToastContainer } from 'react-toastify';

const FIXED_WARRANTY_FEE = 15; 
export default function UnitPurchasePage() {
  const [searchParams] = useSearchParams();
  const stripe = useStripe();
  const elements=useElements();
  const navigate = useNavigate();
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [savedPaymentMethod, setSavedPaymentMethod] = useState(null);
const [useSavedCard, setUseSavedCard] = useState(true); // Default to saved card if available

  const getServiceFee = () => {
    const rentPrice = request?.listing?.pricing?.rentPrice || 60;
    const serviceFee = (rentPrice * 0.20).toFixed(2);
    
    return serviceFee;
  };
  const getWarrantyFee = () => {
    if (request?.listing?.powerType === 'Warranty') {
      return FIXED_WARRANTY_FEE;
    }
    return 0;
  };
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [confirmationNumber, setConfirmationNumber] = useState('');
  const [credits,setCredits]=useState(0)
  const [downloadingReceipt, setDownloadingReceipt] = useState(false);
  const [receiptDownloaded, setReceiptDownloaded] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxStartIndex, setLightboxStartIndex] = useState(0);

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      fetchRequest(id);
    } else {
      toast.info('Request ID not found',{containerId:"renterConfirmationPage"});
      setLoading(false);
    }
  }, [searchParams]);

  
  useEffect(() => {
    if (showPayment && savedPaymentMethod && elements) {
      const cardExpiryElement = elements.getElement(CardExpiryElement);
      
      // Pre-fill expiry date if available
      if (cardExpiryElement && savedPaymentMethod.expiryDate) {
        // Stripe automatically formats MM/YY
        // We can't directly set values, but we can show it in the UI
      }
    }
  }, [showPayment, savedPaymentMethod, elements]);
  

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
        console.log('paymentMethod')
      console.log(data.paymentMethod)
        if (data.paymentMethod) {
          setSavedPaymentMethod(data.paymentMethod);
        }
    
      } else {
        toast.error('Error fetching request details',{containerId:"renterConfirmationPage"});
      }
    } catch (e) {
      console.error('Error:', e);
      toast.error('Error fetching request details',{containerId:"renterConfirmationPage"});
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    // Show payment screen
    setShowPayment(true);
  };


  // Add this function before the return statement
const getLightboxImages = () => {
  const images = [];
  if (request.images && request.images.length > 0) {
    if (request.images[0].front) {
      images.push({ url: request.images[0].front, label: 'Front View' });
    }
    if (request.images[0].side) {
      images.push({ url: request.images[0].side, label: 'Side View' });
    }
    if (request.images[0].serial_tag) {
      images.push({ url: request.images[0].serial_tag, label: 'Serial Tag' });
    }
    if (request.images[0].condition) {
      images.push({ url: request.images[0].condition, label: 'Condition' });
    }
  }
  return images;
};

const handlePayment = async () => {
  if (!stripe) {
    return;
  }

  setProcessing(true);
  try {
    const id = searchParams.get('id');
    const totalPrice = calculateTotal();
    const token = localStorage.getItem('token');

    let paymentMethodId;

    // Check if using saved payment method
    if (useSavedCard && savedPaymentMethod) {
      // If we have a saved Stripe Payment Method ID, use it
      if (savedPaymentMethod.paymentMethodId) {
        paymentMethodId = savedPaymentMethod.paymentMethodId;
        console.log('Using saved payment method ID:', paymentMethodId);
      } else {
        // No saved payment method ID, but user has saved card info
        // We'll need to create a new payment method with the saved card details
        // For security, we can't recreate it from saved data
        // So we need to ask user to re-enter the card or use new card option
        toast.error('Saved card needs to be re-verified. Please select "Use a Different Card" and re-enter your card details.', {containerId:"renterConfirmationPage"});
        setProcessing(false);
        return;
      }
    } else {
      // Create new payment method using Stripe Elements
      if (!elements) {
        toast.error('Payment form not ready. Please try again.', {containerId:"renterConfirmationPage"});
        setProcessing(false);
        return;
      }

      const cardElement = elements.getElement(CardNumberElement);
      
      if (!cardElement) {
        toast.error('Card details not entered. Please fill in your card information.', {containerId:"renterConfirmationPage"});
        setProcessing(false);
        return;
      }
      
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          email: request.user?.email,
          name: request.user?.name || request.user?.username
        }
      });

      if (error) {
        toast.error('Payment method creation failed: ' + error.message, {containerId:"renterConfirmationPage"});
        setProcessing(false);
        return;
      }

      paymentMethodId = paymentMethod.id;
    }
    
    const totalBeforeCredits = getTotalBeforeCredits();
    const creditsApplied = getCreditsApplied();
    const finalTotal = calculateTotal();
    const newCredits = credits - creditsApplied;
    
    console.log('📤 Sending payment request to backend...');
    
    const response = await axios.post(`${BASE_URL}/approveOfferByUser`, 
      { 
        id, 
        totalPrice: finalTotal,
        creditsUsed: creditsApplied,
        totalBeforeCredits: totalBeforeCredits,
        paymentMethodId: paymentMethodId,
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
        deliveryFee: getDeliveryFee(),
        installationFee: getInstallationFee(),
        serviceFee: getServiceFee()
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    console.log('✅ Backend response:', response.data);

    // Backend already confirmed payment - no need to call stripe.confirmCardPayment
   
    const confNumber = response.data.orderId || 
                       response.data.order?._id || 
                       Math.floor(10000 + Math.random() * 90000);
    
    setConfirmationNumber(confNumber.toString());
    
    toast.success('Your order has been confirmed. Thank you for choosing us!', {containerId:"renterConfirmationPage"});
    
    setOrderConfirmed(true);
   
    setProcessing(false);

  } catch (e) {
    console.error('❌ Payment error:', e);
    console.error('❌ Error response:', e.response?.data);
    
    let userFriendlyMessage = 'Unable to process payment. Please try again.';
    
    if (e.response?.data?.error) {
      const errorMsg = e.response.data.error;
      
      // Don't show raw error messages to users
      if (errorMsg.toLowerCase().includes('vendor')) {
        userFriendlyMessage = 'Vendor payment setup incomplete. Please contact support.';
      } else if (errorMsg.toLowerCase().includes('stripe')) {
        userFriendlyMessage = 'Payment service error. Please try again in a moment.';
      } else if (errorMsg.toLowerCase().includes('payment')) {
        userFriendlyMessage = 'Payment failed. Please check your card details and try again.';
      } else if (errorMsg.toLowerCase().includes('customer')) {
        userFriendlyMessage = 'Account setup error. Please contact support.';
      } else {
        // For other errors, show a generic message
        userFriendlyMessage = 'Unable to complete your order. Please try again or contact support.';
      }
    } else if (e.message) {
      if (e.message.includes('Network')) {
        userFriendlyMessage = 'Network error. Please check your connection and try again.';
      } else if (e.code === 'ECONNABORTED') {
        userFriendlyMessage = 'Request timed out. Please try again.';
      }
    }
    
    toast.error(userFriendlyMessage, {containerId:"renterConfirmationPage"});
    setProcessing(false);
  }
};
  const downloadReceipt = () => {
    if (receiptDownloaded) {
      toast.info('Receipt has already been downloaded', {containerId:"renterConfirmationPage"});
      return;
    }
  
    setDownloadingReceipt(true);
  
    try {
      const receiptContent = `
  RECEIPT
  ${'-'.repeat(50)}
  
  Order Number: ${confirmationNumber}
  Date: ${new Date().toLocaleString()}
  
  
  ${'-'.repeat(50)}
  ITEM DETAILS
  ${'-'.repeat(50)}
  
  Item: ${request.listing?.title || 'N/A'}
  Brand: ${request.listing?.brand || 'N/A'}
  Power Type: ${request.listing?.powerType || 'N/A'}
  Monthly Rent: $${request.listing?.pricing?.rentPrice || '0'}
  
  ${'-'.repeat(50)}
  PAYMENT DETAILS
  ${'-'.repeat(50)}
  
  First Month Rent          $${request.listing?.pricing?.rentPrice}
  ${request?.listing?.powerType === 'Warranty'
    ? `Warranty Protection (monthly) $${getWarrantyFee()}`
    : ''
  }
  ${request?.deliveryType !== 'pickup'
    ? `Delivery Fee              $${getDeliveryFee()}`
    : 'Delivery Fee              $0.00 (Self Pickup)'
  }
  ${request?.installationType !== 'no-install'
    ? `Installation Fee          $${getInstallationFee()}`
    : 'Installation Fee          $0.00 (Self Installation)'
  }
  Service & Vendor Fee      $${getServiceFee()}
  
  ${getCreditsApplied() > 0 ? `
  Subtotal                  $${getTotalBeforeCredits().toFixed(2)}
  Credits Applied          -$${getCreditsApplied().toFixed(2)}
  ` : ''}
  
  ${'-'.repeat(50)}
  TOTAL PAID                $${calculateTotal().toFixed(2)}
  
  ${'-'.repeat(50)}
  DELIVERY INFORMATION
  ${'-'.repeat(50)}
  
  Delivery Type: ${request?.deliveryType === 'pickup' ? 'Self Pickup' : 'Delivery'}
  ${request?.deliveryType === 'pickup' && request?.listing?.pickUpAddress ? `Pickup Location: ${request.listing.pickUpAddress}` : ''}
  Installation Type: ${request?.installationType === 'no-install'
    ? 'Self Installation'
    : 'Professional Installation'
  }
  
  ${'-'.repeat(50)}
  
  Generated On: ${new Date().toLocaleString()}
  
  ${'-'.repeat(50)}
  
  Thank you for your order!
  For support, contact: rentsimple159@gmail.com
  
  ${'-'.repeat(50)}
  `.trim();
  
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
      setReceiptDownloaded(true);
      toast.success('Receipt downloaded successfully!', {containerId:"renterConfirmationPage"});
    } catch (error) {
      console.error('Error downloading receipt:', error);
      toast.error('Failed to download receipt',{containerId:"renterConfirmationPage"});
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
        toast.success('Offer denied successfully',{containerId:"renterConfirmationPage"});
        
        navigate('/appliance')
      } catch (e) {
        console.error('Error:', e);
        toast.error('Error denying offer: ' + (e.response?.data?.error || e.message),{containerId:"renterConfirmationPage"});
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
    return request?.listing?.deliveryPrice || 30; // Use dynamic price from listing
  };


  const getInstallationFee = () => {
    if (request?.installationType === 'no-install') {
      return 0;
    }
    return request?.listing?.installationPrice || 30; 
  };
  

  const calculateTotal = () => {
    const rentPrice = request?.listing?.pricing?.rentPrice || 60;
    const warrantyFee = getWarrantyFee(); 
    const deliveryFee = getDeliveryFee();
    const installationFee = getInstallationFee();
    const subtotal = rentPrice + warrantyFee + deliveryFee + installationFee; // Added warrantyFee
    const serviceFee = parseFloat(getServiceFee()); 
    const totalBeforeCredits = subtotal + serviceFee;
    
    const afterCredits = totalBeforeCredits - credits;
    const finalTotal = credits > 0 && afterCredits < 1 ? 1 : Math.max(0, afterCredits);
    
    return finalTotal;
  };

// // Helper to get amount before credits
// const getTotalBeforeCredits = () => {
//   const rentPrice = request?.listing?.pricing?.rentPrice || 60;
//   const deliveryFee = getDeliveryFee();
//   const installationFee = getInstallationFee();
//   const subtotal = rentPrice + deliveryFee + installationFee;
//   const serviceFee = 12;
//   return subtotal + serviceFee;
// };
const getTotalBeforeCredits = () => {
  const rentPrice = request?.listing?.pricing?.rentPrice || 60;
  const warrantyFee = getWarrantyFee(); // NEW
  const deliveryFee = getDeliveryFee();
  const installationFee = getInstallationFee();
  const subtotal = rentPrice + warrantyFee + deliveryFee + installationFee; // Added warrantyFee
  const serviceFee = parseFloat(getServiceFee());
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
   <>
   <ToastContainer containerId={"renterConfirmationPage"}/>
   

   <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 relative">
        <SupportChatWidget/>
      {processing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 shadow-xl max-w-md w-full mx-4">
            <div className="text-center">
              <div className="relative inline-flex items-center justify-center mb-6">
                
                <div className="animate-spin rounded-full h-24 w-24 border-4 border-gray-200"></div>
              
                <div className="absolute animate-spin rounded-full h-24 w-24 border-4 border-[#004d40] border-t-transparent"></div>
              
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
       
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm">
      
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

<div className="space-y-4 mb-6">
  <div className="flex justify-between text-xl text-gray-900">
    <span>First month rent</span>
    <span>${request.listing?.pricing?.rentPrice}</span>
  </div>
  

  {request?.deliveryType !== 'pickup' && (
    <div className="flex justify-between text-xl text-gray-900">
      <span>Delivery</span>
      <span>${getDeliveryFee()}</span>
    </div>
  )}
  
  {request?.listing?.powerType === 'Warranty' && (
  <div className="flex justify-between text-xl text-gray-900 bg-green-50 -mx-4 px-4 py-2 rounded-lg">
    <div className="flex items-center space-x-2">
      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
      <span className="font-semibold">Warranty Protection</span>
    </div>
    <span>${getWarrantyFee()}/mo</span>
  </div>
)}

  {request?.installationType !== 'no-install' && (
    <div className="flex justify-between text-xl text-gray-900">
      <span>Installation</span>
      <span>${getInstallationFee()}</span>
    </div>
  )}
  
  
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
    <span>${getServiceFee()}</span>
  </div>
</div>

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


<div className="border-t border-gray-200 pt-6 mb-8"></div>

    
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

         
   {/* Payment Method Selection */}
{savedPaymentMethod && (
  <div className="mb-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Payment Method</h3>
    
    {/* Saved Card Option */}
    <div 
      onClick={() => setUseSavedCard(true)}
      className={`p-5 rounded-xl border-2 cursor-pointer transition-all mb-3 ${
        useSavedCard 
          ? 'border-[#004d40] bg-teal-50' 
          : 'border-gray-300 bg-white hover:border-gray-400'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
            useSavedCard ? 'border-[#004d40] bg-[#004d40]' : 'border-gray-300'
          }`}>
            {useSavedCard && (
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <svg className="w-10 h-10 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <div>
              <p className="text-base font-semibold text-gray-900">Saved Card</p>
              <p className="text-sm text-gray-600">•••• •••• •••• {savedPaymentMethod.last4}</p>
              <p className="text-xs text-gray-500">Expires {savedPaymentMethod.expiryDate}</p>
            </div>
          </div>
        </div>
        {useSavedCard && (
          <span className="text-sm font-semibold text-[#004d40]">Selected</span>
        )}
      </div>
    </div>

    {/* New Card Option */}
    <div 
      onClick={() => setUseSavedCard(false)}
      className={`p-5 rounded-xl border-2 cursor-pointer transition-all ${
        !useSavedCard 
          ? 'border-[#004d40] bg-teal-50' 
          : 'border-gray-300 bg-white hover:border-gray-400'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
            !useSavedCard ? 'border-[#004d40] bg-[#004d40]' : 'border-gray-300'
          }`}>
            {!useSavedCard && (
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <svg className="w-10 h-10 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <div>
              <p className="text-base font-semibold text-gray-900">Use a Different Card</p>
              <p className="text-sm text-gray-600">Enter new card details</p>
            </div>
          </div>
        </div>
        {!useSavedCard && (
          <span className="text-sm font-semibold text-[#004d40]">Selected</span>
        )}
      </div>
    </div>
  </div>
)}

{/* Show card input fields only if NOT using saved card OR no saved card exists */}
{(!savedPaymentMethod || !useSavedCard) && (
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
)}

   
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
   </>
  );
}

  // Show Order Confirmed Screen
 // Show Order Confirmed Screen
if (orderConfirmed) {
  return (<>
  <ToastContainer containerId={"renterConfirmationPage"}/>
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="w-full max-w-2xl">
  
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-[#004d40] mb-3">Order Confirmed</h1>
          <p className="text-2xl text-gray-600">Order #{confirmationNumber}</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm">
        
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

    
      <div className="space-y-4 mb-6">
  <div className="flex justify-between text-xl text-gray-900">
    <span>First month rent</span>
    <span>${request.listing?.pricing?.rentPrice}</span>
  </div>
  
 
  {request?.deliveryType !== 'pickup' && (
    <div className="flex justify-between text-xl text-gray-900">
      <span>Delivery</span>
      <span>${getDeliveryFee()}</span>
    </div>
  )}
  {request?.listing?.powerType === 'Warranty' && (
  <div className="flex justify-between text-xl text-gray-900 bg-green-50 -mx-4 px-4 py-2 rounded-lg">
    <div className="flex items-center space-x-2">
      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
      <span className="font-semibold">Warranty Protection</span>
    </div>
    <span>${getWarrantyFee()}/mo</span>
  </div>
)}

  
  {request?.deliveryType === 'pickup' && request?.listing?.pickUpAddress && (
  <div className="mb-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-5">
    <div className="flex items-start space-x-3">
      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-blue-700 uppercase tracking-wide mb-1">Pickup Location</p>
        <p className="text-base text-blue-900 font-medium">{request.listing.pickUpAddress}</p>
        <p className="text-sm text-blue-600 mt-1">Please arrive at the scheduled time for pickup</p>
      </div>
    </div>
  </div>
)}
  {request?.installationType !== 'no-install' && (
    <div className="flex justify-between text-xl text-gray-900">
      <span>Installation</span>
      <span>${getInstallationFee()}</span>
    </div>
  )}
  

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
    <span>${getServiceFee()}</span>
  </div>
</div>

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


<div className="border-t border-gray-200 pt-6 mb-8"></div>
         
          <div className="border-t border-gray-200 pt-6 mb-8">
          <div className="flex justify-between items-baseline">
  <span className="text-2xl font-bold text-gray-900">Total paid</span>
  <span className="text-3xl font-bold text-gray-900">${calculateTotal().toFixed(2)}</span>
</div>
          </div>

        
          <div className="text-center">
  <p className="text-2xl font-bold text-gray-900 mb-2">Your order is on the way!</p>
  <p className="text-gray-600 text-lg mb-6">We'll let you know when it's out for delivery.</p>
  

  <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
    <button
      onClick={downloadReceipt}
      disabled={downloadingReceipt || receiptDownloaded}
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
    </>
  );
}

  return (
    <>
    <ToastContainer containerId={"renterConfirmationPage"}/>
    <div className="min-h-screen bg-gray-50">
     
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

    
      <div className="max-w-4xl mx-auto px-6 py-8">
   
        <h2 className="text-4xl font-bold text-gray-900 mb-8">Unit for Purchase</h2>

        <div className="bg-white rounded-2xl p-6 mb-8 shadow-sm">
  <h3 className="text-2xl font-bold text-gray-900 mb-4">{request.listing?.title}</h3>
  <div className="grid grid-cols-2 gap-4 text-gray-700">
    {/* ... product details ... */}
  </div>
</div>

{/* Fee Notice Section */}
<div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 mb-8">
  <div className="flex items-start space-x-4">
    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    <div className="flex-1">
      <h4 className="text-xl font-bold text-blue-900 mb-3">Delivery & Installation Options</h4>
      <div className="space-y-3 text-blue-800">
      {request?.listing?.powerType === 'Warranty' && (
  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
    <div className="flex items-center space-x-2">
      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
      <span className="font-semibold text-green-700">Monthly Warranty Protection</span>
    </div>
    <span className="text-lg font-bold text-green-700">${getWarrantyFee()}/mo</span>
  </div>
)}

        {request?.deliveryType !== 'pickup' && (
          <div className="flex items-center justify-between bg-white bg-opacity-60 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              <span className="font-semibold">Delivery Fee</span>
            </div>
            <span className="text-lg font-bold">${getDeliveryFee()}</span>
          </div>
        )}
        
        {request?.deliveryType === 'pickup' && (
          <div className="flex items-center justify-between bg-green-50 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-semibold text-green-700">Self Pickup - No Delivery Fee!</span>
            </div>
            <span className="text-lg font-bold text-green-700">$0</span>
          </div>
        )}

        {request?.installationType !== 'no-install' && (
          <div className="flex items-center justify-between bg-white bg-opacity-60 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="font-semibold">Professional Installation</span>
            </div>
            <span className="text-lg font-bold">${getInstallationFee()}</span>
          </div>
        )}
        
        {request?.installationType === 'no-install' && (
          <div className="flex items-center justify-between bg-green-50 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-semibold text-green-700">Self Installation - No Installation Fee!</span>
            </div>
            <span className="text-lg font-bold text-green-700">$0</span>
          </div>
        )}
        
        <div className="flex items-center justify-between bg-white bg-opacity-60 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="font-semibold">Service Fee</span>
          </div>
          <span className="text-lg font-bold">${getServiceFee()}</span>
        </div>
      </div>
      
      <p className="text-sm text-blue-700 mt-4">
        💡 These fees will be added to your first month's rent at checkout
      </p>
    </div>
  </div>
</div>
     
<div className="mb-8">
  <h3 className="text-2xl font-bold text-gray-900 mb-6">Photos</h3>
  <div className="grid grid-cols-3 gap-4">
    {request.images && request.images.length > 0 && request.images[0].front && (
      <div 
        className="flex flex-col items-center cursor-pointer"
        onClick={() => {
          setLightboxStartIndex(0);
          setLightboxOpen(true);
        }}
      >
        <div className="w-full aspect-square bg-gray-200 rounded-2xl overflow-hidden mb-3 hover:opacity-80 transition-opacity">
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
      <div 
        className="flex flex-col items-center cursor-pointer"
        onClick={() => {
          setLightboxStartIndex(1);
          setLightboxOpen(true);
        }}
      >
        <div className="w-full aspect-square bg-gray-200 rounded-2xl overflow-hidden mb-3 hover:opacity-80 transition-opacity">
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
      <div 
        className="flex flex-col items-center cursor-pointer"
        onClick={() => {
          setLightboxStartIndex(2);
          setLightboxOpen(true);
        }}
      >
        <div className="w-full aspect-square bg-gray-200 rounded-2xl overflow-hidden mb-3 hover:opacity-80 transition-opacity">
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
      <div 
        className="flex flex-col items-center cursor-pointer"
        onClick={() => {
          setLightboxStartIndex(3);
          setLightboxOpen(true);
        }}
      >
        <div className="w-full aspect-square bg-gray-200 rounded-2xl overflow-hidden mb-3 hover:opacity-80 transition-opacity">
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

  {/* Add Lightbox Component */}
  <ImageLightbox
    images={getLightboxImages()}
    isOpen={lightboxOpen}
    onClose={() => setLightboxOpen(false)}
    startIndex={lightboxStartIndex}
  />
</div>

       
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


<div className="mb-8">
  <div className="flex items-center justify-between">
    <span className="text-3xl font-bold text-gray-900">Monthly Rent</span>
    <span className="text-5xl font-bold text-gray-900">${request.listing?.pricing?.rentPrice}</span>
  </div>
  
  {request?.listing?.powerType === 'Warranty' && (
    <div className="flex items-center justify-between mt-3 bg-green-50 border border-green-200 rounded-xl p-4">
      <div className="flex items-center space-x-2">
        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <span className="text-xl font-semibold text-green-700">Warranty Protection</span>
      </div>
      <span className="text-3xl font-bold text-green-700">+${getWarrantyFee()}/mo</span>
    </div>
  )}
  
  {request?.listing?.powerType === 'Warranty' && (
    <div className="mt-3 text-center">
      <p className="text-lg text-gray-600">
        Total Monthly: <span className="font-bold text-gray-900">${(parseFloat(request.listing?.pricing?.rentPrice) + getWarrantyFee()).toFixed(2)}/mo</span>
      </p>
    </div>
  )}
  </div>

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
    </>
  );
}