import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../baseUrl';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import jsPDF from 'jspdf';
import { ToastContainer,toast } from 'react-toastify';

export default function RentSimpleAccount() {
  const [activeTab, setActiveTab] = useState('current');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showEditModal, setShowEditModal] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    orders: [],
    paymentMethod: {},
    user: {}
  });

  // Stripe hooks
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardError, setCardError] = useState('');

  // Card styling
  const cardStyle = {
    style: {
      base: {
        fontSize: '14px',
        color: '#374151',
        fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
        '::placeholder': {
          color: '#9CA3AF',
        },
        padding: '12px',
      },
      invalid: {
        color: '#DC2626',
      },
    },
  };

  const currentOrders = [
    {
      id: 'RS-10294',
      title: 'Washer & Dryer Set',
      status: 'active',
      placedDate: 'Apr 2, 2025',
      nextPayment: 'May 2 — $60',
      delivery: 'Completed',
      plan: 'Rent‑to‑Own',
      technician: 'James R.'
    },
    {
      id: 'RS-10311',
      title: 'Refrigerator',
      status: 'overdue',
      placedDate: 'May 12, 2025',
      amountDue: '$40 (3 days late)',
      reminder: 'Today 9:00 AM',
      address: '1212 Visionary Way',
      support: 'Open ticket'
    }
  ];

  const pastOrders = [
    {
      id: 'RS-9881',
      title: 'Deep Freezer',
      status: 'completed',
      deliveredDate: 'Jan 21, 2025',
      totalPaid: '$200',
      returnDate: 'Mar 20, 2025',
      condition: 'Good',
      invoice: '#INV-5562'
    }
  ];

  const invoices = [
    { date: '2025‑05‑02', order: 'Washer & Dryer', total: '$60.00', status: 'Paid', isPaid: true },
    { date: '2025‑05‑01', order: 'Refrigerator', total: '$40.00', status: 'Due', isPaid: false },
    { date: '2025‑03‑20', order: 'Deep Freezer', total: '$0.00', status: 'Closed', isPaid: true }
  ];

  useEffect(() => {
    getDashboardData()
  }, [])

  const getDashboardData = async () => {
    try {
   
      let token = localStorage.getItem('token')
      let response = await axios.get(`${BASE_URL}/getDashboardData`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      console.log(response.data)
      console.log("response.data")
      setDashboardData({
        user: response.data.user,
        orders: response.data.orders,
        paymentMethod: response.data.paymentMethod
      })
      console.log(response.data)
    } catch (e) {
console.log(e.message)
    }
  }

  const handleUpdatePaymentMethod = async () => {
    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setCardError('');

    const cardElement = elements.getElement(CardElement);

    try {
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          email: dashboardData?.user?.email,
          name: dashboardData?.user?.name,
        },
      });

      if (error) {
        setCardError(error.message);
        setIsProcessing(false);
        return;
      }

      
      console.log('Payment Method:', paymentMethod);
      
      
      const token = localStorage.getItem('token');
      const response = await axios.patch(`${BASE_URL}/updatePaymentMethod`, {
        paymentMethodId: paymentMethod.id
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    

    toast.success("Billing information updated sucessfully",{containerId:"dashboard"})
      await getDashboardData();
      setShowEditModal(false);
      
    } catch (error) {
      console.error('Error updating payment method:', error);
      setCardError('Failed to update payment method. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadInvoice = async (order, item) => {
    try {
      // Create new PDF document
      const doc = new jsPDF();
      
      // Set up colors and fonts
      const primaryColor = '#0f766e'; // Teal-700
      const textColor = '#374151'; // Gray-700
      const lightGray = '#f3f4f6'; // Gray-100
      
      // Header
      doc.setFillColor(15, 118, 110); // Teal background
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('INVOICE', 20, 25);
      
      // Company info (you can customize this)
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Your Company Name', 140, 15);
      doc.text('Address Line 1', 140, 20);
      doc.text('Address Line 2', 140, 25);
      doc.text(`Phone: ${dashboardData?.user?.mobile}`, 140, 30);
      doc.text(`Email: ${dashboardData?.user?.email}`, 140, 35);
      
      // Reset text color for body
      doc.setTextColor(55, 65, 81);
      
      // Invoice details
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Invoice Details', 20, 55);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Order ID: ${order._id}`, 20, 65);
      doc.text(`Subscription ID: ${order.subscriptionId}`, 20, 70);
      doc.text(`Date: ${new Date(order.deliveryDate).toLocaleDateString()}`, 20, 75);
      doc.text(`Delivery Time: ${order.deliveryTime}`, 20, 80);
      doc.text(`Status: ${order?.status?.toUpperCase()}`, 20, 85);
      
      // Delivery information
      doc.setFont('helvetica', 'bold');
      doc.text('Delivery Information', 110, 65);
      
      doc.setFont('helvetica', 'normal');
      doc.text(`Location: ${order.locationName}`, 110, 70);
      if (order.location?.coordinates) {
        doc.text(`Coordinates: ${order.location.coordinates.join(', ')}`, 110, 75);
      }
      
      // Line separator
      doc.setDrawColor(229, 231, 235);
      doc.setLineWidth(0.5);
      doc.line(20, 95, 190, 95);
      
      // Item details header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('Item Details', 20, 110);
      
      // Table header
      doc.setFillColor(243, 244, 246);
      doc.rect(20, 115, 170, 10, 'F');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('Item Name', 25, 122);
      doc.text('Monthly Price', 100, 122);
      doc.text('Status', 140, 122);
      doc.text('Item ID', 160, 122);
      
      // Item data
      let yPos = 132;
      doc.setFont('helvetica', 'normal');
      doc.text(item.name || 'N/A', 25, yPos);
      doc.text(`$${item.monthly_price || '0'}`, 100, yPos);
      doc.text(item.stock_status || 'N/A', 140, yPos);
      doc.text(item._id.substring(0, 8) + '...', 160, yPos);
      
      // Add item photo if available
      if (item.photo) {
        try {
          doc.setFont('helvetica', 'italic');
          doc.setFontSize(8);
          doc.text('Product Image: Available', 25, yPos + 8);
        } catch (error) {
          console.log('Could not add image to PDF');
        }
      }
      
      // Total section
      yPos += 25;
      doc.setDrawColor(229, 231, 235);
      doc.line(120, yPos, 190, yPos);
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('Total Amount:', 120, yPos + 10);
      doc.text(`$${item.monthly_price || '0'}`, 160, yPos + 10);
      
      // Footer
      yPos += 30;
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(107, 114, 128);
      doc.text('Thank you for your business!', 20, yPos);
      doc.text('For support, contact: support@company.com', 20, yPos + 5);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, yPos + 10);
      
      // Generate filename
      const fileName = `invoice_${order._id}_${item.name.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`;
      
      // Save the PDF
      doc.save(fileName);
      
      console.log('Invoice downloaded successfully');
      
    } catch (error) {
      console.error('Error generating invoice:', error);
      alert('Failed to generate invoice. Please try again.');
    }
  };

  const filteredOrders = (orders) => {
    return orders.filter(order => {
      const matchesSearch = order.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          order.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  };

  const StatusBadge = ({ status }) => {
    const baseClasses = "font-bold text-xs px-2.5 py-1.5 rounded-full border";
    const statusClasses = {
      active: "bg-emerald-50 text-emerald-700 border-emerald-200",
      overdue: "bg-red-50 text-red-600 border-red-200",
      completed: "bg-gray-50 text-gray-600 border-gray-200"
    };
    
    return (
      <span className={`${baseClasses} ${statusClasses[status]}`}>
        {status === 'active' || status === "pending" ? 'Active' : status === 'overdue' ? 'Past Due' : 'Completed'}
      </span>
    );
  };

  const OrderCard = ({ order, item }) => (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-lg mb-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-extrabold text-slate-800 text-lg">{item?.name}</h3>
        <StatusBadge status={order?.status} />
      </div>
      <div className="text-sm text-slate-500 mb-3">
        Order #{order?._id} • Delivery Date {new Date(order?.deliveryDate).toLocaleDateString('en-US', { 
          weekday: 'short',
          month: 'short', 
          day: 'numeric', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {order?.status === 'active' || order?.status == "pending" && (
          <>
            {/* <div className="text-sm px-3 py-3 rounded-lg bg-teal-25 border border-dashed border-teal-300">
              Next payment: {order.nextPayment}
            </div>
            <div className="text-sm px-3 py-3 rounded-lg bg-teal-25 border border-dashed border-teal-300">
              Delivery: {order.delivery}
            </div>
            <div className="text-sm px-3 py-3 rounded-lg bg-teal-25 border border-dashed border-teal-300">
              Plan: {order.plan}
            </div>
            <div className="text-sm px-3 py-3 rounded-lg bg-teal-25 border border-dashed border-teal-300">
              Technician: {order.technician}
            </div> */}
          </>
        )}
        {order.status === 'overdue' && (
          <>
            <div className="text-sm px-3 py-3 rounded-lg bg-teal-25 border border-dashed border-teal-300">
              Amount due: {order.amountDue}
            </div>
            <div className="text-sm px-3 py-3 rounded-lg bg-teal-25 border border-dashed border-teal-300">
              Reminder sent: {order.reminder}
            </div>
            <div className="text-sm px-3 py-3 rounded-lg bg-teal-25 border border-dashed border-teal-300">
              Address: {order.address}
            </div>
            <div className="text-sm px-3 py-3 rounded-lg bg-teal-25 border border-dashed border-teal-300">
              Support: {order.support}
            </div>
          </>
        )}
        {order.status === 'completed' && (
          <>
            <div className="text-sm px-3 py-3 rounded-lg bg-teal-25 border border-dashed border-teal-300">
              Total paid: {order.totalPaid}
            </div>
            <div className="text-sm px-3 py-3 rounded-lg bg-teal-25 border border-dashed border-teal-300">
              Return date: {order.returnDate}
            </div>
            <div className="text-sm px-3 py-3 rounded-lg bg-teal-25 border border-dashed border-teal-300">
              Condition: {order.condition}
            </div>
            <div className="text-sm px-3 py-3 rounded-lg bg-teal-25 border border-dashed border-teal-300">
              Invoice: {order.invoice}
            </div>
          </>
        )}
      </div>
      <div className="flex gap-3 mt-3">
        {order.status === 'active' && (
          <>
           
          </>
        )}
        {order.status === 'overdue' && (
          <>
            <button className="bg-teal-700 text-white font-bold px-4 py-3 rounded-xl">Pay Now</button>
            <button className="bg-white text-teal-700 border border-teal-700 font-bold px-4 py-3 rounded-xl">Contact Support</button>
          </>
        )}
        {order.status === 'completed' && (
          <>
            <button className="bg-white text-teal-700 border border-teal-700 font-bold px-4 py-3 rounded-xl">View Invoice</button>
            <button className="bg-teal-50 text-teal-700 border border-teal-200 font-bold px-4 py-3 rounded-xl">Re‑order</button>
          </>
        )}
      </div>
    </div>
  );


  const pauseBilling=async()=>{
    try{
      let token=localStorage.getItem('token')
let response=await axios.patch(`${BASE_URL}/pauseBilling`,{},{
  headers:{
    Authorization:`Bearer ${token}`
  }
})

toast.success("Billing paused sucessfully",{containerId:"dashboard"})
setDashboardData((prev)=>{
  let old;
  old={
    ...prev,
    user:{
      ...prev?.user,
      billingPaused:true
    }
  }

  return old;
})
    }catch(e){
      console.log(e.message)
      toast.error("Error occured while pausing billing",{containerId:"dashboard"})
    }
  }


  const UnpauseBilling=async()=>{
    try{
      let token=localStorage.getItem('token')
let response=await axios.post(`${BASE_URL}/resumeBilling`,{},{
  headers:{
    Authorization:`Bearer ${token}`
  }
})

toast.success("Billing unpaused sucessfully",{containerId:"dashboard"})
    }catch(e){
      console.log(e.message)
      toast.error("Error occured while unpausing billing",{containerId:"dashboard"})
    }
  }
  return (
  <>
  <ToastContainer containerId={"dashboard"}/>
  <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="relative px-6 py-8 text-white bg-gradient-to-b from-teal-600 to-teal-700 shadow-lg shadow-teal-700/25">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-md flex items-center justify-center border border-white/20">
                🏠
              </div>
              <div className="text-xl font-bold tracking-wider">RentSimple</div>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 bg-white/15 border border-white/20 rounded-full">
              <img src="https://placehold.co/40x40" alt="avatar" className="w-6 h-6 rounded-full bg-white" />
              <span className="text-sm">Hi, {dashboardData?.user?.name}</span>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mt-6 tracking-wide">My Account</h1>
          <div className="text-lg opacity-90 mt-2">Manage your details, payments & deliveries</div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 md:px-8">
        {/* Account Details Card */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-4 mb-4">
            <div>
              <div className="text-sm text-slate-500">Account</div>
              <div className="font-semibold text-slate-800 text-lg">{dashboardData?.user?.email}</div>
            </div>
            <button 
              onClick={() => setShowEditModal(true)}
              className="bg-teal-50 text-teal-700 border border-teal-200 font-bold px-4 py-3 rounded-xl"
            >
              Edit Billing
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'Name', value: dashboardData?.user?.name },
              { label: 'Phone', value: dashboardData?.user?.mobile, mono: true },
              { label: 'Delivery Address', value: '1212 Visionary Way, Fishers IN' },
              { label: 'Default Payment', value: dashboardData?.paymentMethod?.card?.brand + ' ' + dashboardData?.paymentMethod?.card?.last4, mono: true },
              { label: 'Billing Address', value: 'Same as delivery' }
            ].map((item, idx) => (
              <div key={idx} className="flex justify-between items-center py-3 border-b border-dashed border-gray-200 last:border-b-0">
                <div className="text-sm text-slate-500">{item.label}</div>
                <div className={`font-semibold text-slate-800 ${item.mono ? 'font-mono' : ''}`}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 my-6">
          <button 
            onClick={() => setActiveTab('current')}
            className={`flex-1 text-center py-4 font-bold rounded-xl border ${
              activeTab === 'current' 
                ? 'bg-teal-700 text-white border-teal-700' 
                : 'bg-white border-gray-200'
            }`}
          >
            Current Orders
          </button>
          <button 
            onClick={() => setActiveTab('past')}
            className={`flex-1 text-center py-4 font-bold rounded-xl border ${
              activeTab === 'past' 
                ? 'bg-teal-700 text-white border-teal-700' 
                : 'bg-white border-gray-200'
            }`}
          >
            Past Orders
          </button>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input 
            className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm"
            placeholder="Search orders (name, ID, product)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Orders List */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
          {activeTab === 'current' && 
          dashboardData?.orders?.filter(u => u?.status == "pending" || u?.status == "active")?.flatMap((order) => 
            order?.items?.map((item) => (
              <OrderCard 
                key={`${order?._id}-${item?._id}`} 
                order={order} 
                item={item} 
              />
            )) || []
          )}
          {activeTab === 'past' && 
          dashboardData?.orders?.filter(u => u?.status == "completed")?.length > 0 ? dashboardData?.orders?.filter(u => u?.status == "completed")?.flatMap((order) => 
            order?.items?.map((item) => (
              <OrderCard 
                key={`${order?._id}-${item?._id}`} 
                order={order} 
                item={item} 
              />
            )) || []
          ) : activeTab === 'past' ? <div className='bg-white border border-gray-200 rounded-2xl p-4 shadow-lg mb-4'>
            <p>No Past Orders Found</p>
          </div> : ''}
        </div>

        {/* Billing Block */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-4 mb-4">
            <div>
              <div className="text-sm text-slate-500">Billing Details</div>
              <div className="font-semibold text-slate-800 text-lg">{dashboardData?.paymentMethod?.card?.brand} •••• {dashboardData?.paymentMethod?.card?.last4} — {dashboardData?.paymentMethod?.card?.exp_month}/{dashboardData?.paymentMethod?.card?.exp_year}</div>
            </div>
            <button 
              onClick={() => setShowEditModal(true)}
              className="bg-teal-50 text-teal-700 border border-teal-200 font-bold px-4 py-3 rounded-xl"
            >
              Edit
            </button>
          </div>
          <div className="h-px bg-gray-200 my-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-slate-500">Postal Code</div>
              <div className="text-base">{dashboardData?.paymentMethod?.billing_details?.address?.postal_code}</div>
            </div>
            <div>
              <div className="text-sm text-slate-500">Email for Receipts</div>
              <div className="text-base">{dashboardData?.user?.email}</div>
            </div>
          </div>
        </div>

        {/* Invoices */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div className="font-semibold text-slate-800 text-lg">Recent Invoices</div>
            <button className="bg-teal-50 text-teal-700 border border-teal-200 font-bold px-4 py-3 rounded-xl text-sm">
              Download All (PDF)
            </button>
          </div>
          
          <div className="space-y-3">
            {dashboardData?.orders?.map((order, i) => (
              order?.items?.map((item, j) => {
                return <div key={item?._id} className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm w-full">
                    <div>{order?._id}</div>
                    <div className="font-semibold">{item?.monthly_price}</div>
                    <div className={'text-green-600'}>{"paid"}</div>
                  </div>
                  <button onClick={() => downloadInvoice(order, item)} className={`font-bold px-4 py-2 rounded-lg text-sm whitespace-nowrap ${'bg-white text-teal-700 border border-teal-700'}`}>
                    {'PDF'}
                  </button>
                </div>
              })
            ))}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 border border-dashed border-red-300 rounded-xl p-6">
          <div className="font-semibold text-slate-800 text-lg mb-2">Danger Zone</div>
          <div className="text-sm text-slate-500 mb-4">Pause billing or close your account. These actions can't be undone.</div>
          <div className="flex flex-col sm:flex-row gap-3">
            {dashboardData?.user?.billingPaused?<p>Your billing has been paused</p>:<button onClick={pauseBilling} className="bg-white text-teal-700 border border-teal-700 font-bold px-4 py-3 rounded-xl">
              Pause Billing
            </button>}
            {/* <button className="bg-red-600 text-white font-bold px-4 py-3 rounded-xl">
              Close Account
            </button> */}
          </div>
        </div>
      </div>

      {/* Edit Billing Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/55 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-lg">
            <div className="bg-teal-600 text-white p-4 rounded-t-2xl">
              <strong className="text-lg">Edit Billing</strong>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-slate-600 mb-2">Card Details</label>
                <div className="w-full p-3 border border-gray-200 rounded-xl">
                  <CardElement 
                    options={cardStyle}
                    onChange={(event) => {
                      if (event.error) {
                        setCardError(event.error.message);
                      } else {
                        setCardError('');
                      }
                    }}
                  />
                </div>
                {cardError && (
                  <div className="text-red-600 text-sm mt-2">{cardError}</div>
                )}
              </div>
            </div>
            <div className="flex gap-3 p-4 bg-slate-50 rounded-b-2xl">
              <button 
                onClick={() => setShowEditModal(false)}
                className="bg-white text-teal-700 border border-teal-700 font-bold px-4 py-3 rounded-xl flex-1"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdatePaymentMethod}
                className="bg-teal-700 text-white font-bold px-4 py-3 rounded-xl flex-1 disabled:opacity-50"
                disabled={!stripe || isProcessing}
              >
                {isProcessing ? 'Updating...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  </>
  );
}